import { useEffect } from 'react';
import { ConfChip, Segmented, fmtTime, useMatch } from '../components/ui';
import type { OverlayKey, Workspace } from '../state';
import { recalcTargeting } from '../lib/recalc';

const OV_LABELS: Record<OverlayKey, string> = {
  zones: 'Court zones', labels: 'Player labels', trails: 'Movement trails',
  shuttle: 'Shuttle', shots: 'Shot labels', notes: 'Tactical notes',
};
const SHOT_GAP = 2.3; // seconds between shots in the placeholder timeline
const HATCH = 'repeating-linear-gradient(135deg,#3a4048 0 2px,#1c2024 2px 4px)';

export function VideoView({ ws }: { ws: Workspace }) {
  const m = useMatch();
  const { s, patch } = ws;
  const P = m.players;
  const cur = m.rallies[s.rally - 1];
  const evs = cur.events;
  const t = cur.startSec + s.ev * SHOT_GAP;
  const ce = evs[s.ev];
  const ceHitter = ce ? P[s.corr[`${s.rally}-${s.ev}`] ?? ce.hitter] : null;
  const tgt = m.strategy.targeting;
  const tgtName = tgt ? P[tgt.target].name : '';

  // Simulated playback: step through shots at the chosen speed.
  useEffect(() => {
    if (!s.playing) return;
    const id = window.setInterval(() => {
      patch((p) => {
        const r = m.rallies[p.rally - 1];
        if (p.ev < r.events.length - 1) return { ev: p.ev + 1, frame: 0 };
        return { playing: false };
      });
    }, (SHOT_GAP * 1000) / s.speed);
    return () => window.clearInterval(id);
  }, [s.playing, s.speed, m, patch]);

  const pickHitter = (key: string, p: string, current: string) => {
    if (p === current) return patch({ picker: null });
    const next = { ...s.corr, [key]: p };
    const r = recalcTargeting(m, s.corr, next);
    patch({
      corr: next,
      picker: null,
      toast: r
        ? `Hitter changed to ${P[p].name}. Stats and alerts recalculated: ${tgtName}'s share now ${r.now}% (was ${r.was}%). ${r.fires ? 'Alert still fires.' : 'Alert no longer fires.'}`
        : `Hitter changed to ${P[p].name}. Stats recalculated.`,
    });
  };

  const addNote = () => {
    const text = s.draft.trim();
    if (!text) return;
    patch({ notes: [...s.notes, { t: fmtTime(t), text }], draft: '' });
  };

  const startPct = tgt ? ((tgt.startedRally - 1) / m.rallies.length) * 100 : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', minHeight: 'calc(100vh - 160px)' }}>
      <div className="col" style={{ padding: '16px 20px 24px', gap: 12, minWidth: 0 }}>
        {/* Frame */}
        <div style={{ position: 'relative', aspectRatio: '16/9', maxHeight: '62vh', background: '#08090a', borderRadius: 6, overflow: 'hidden', backgroundImage: 'repeating-linear-gradient(135deg,#0a0b0c 0 14px,#0c0d0f 14px 28px)' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '12px var(--mono)', color: '#3f464d', textAlign: 'center' }}>
            {m.meta.videoFile} · {m.meta.videoSpec}<br />video frame placeholder
          </div>
          {s.view === 'analysed' && (
            <>
              <svg viewBox="0 0 960 540" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
                {s.ov.zones && (
                  <g>
                    <polygon points="150,505 810,505 660,110 300,110" fill="none" stroke="#e8eaed" strokeOpacity=".35" strokeWidth="1.2" />
                    <line x1="248" y1="245" x2="712" y2="245" stroke="#e8eaed" strokeOpacity=".5" strokeWidth="1.5" />
                    <line x1="480" y1="505" x2="480" y2="110" stroke="#e8eaed" strokeOpacity=".2" />
                    <line x1="198" y1="375" x2="762" y2="375" stroke="#e8eaed" strokeOpacity=".2" />
                    <line x1="272" y1="180" x2="688" y2="180" stroke="#e8eaed" strokeOpacity=".2" />
                    <polygon points="220,318 480,318 480,375 198,375" fill="#e5484d" fillOpacity=".07" />
                  </g>
                )}
                {s.ov.trails && (
                  <g fill="none" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round">
                    <polyline points="610,470 598,452 590,440 596,426" stroke={P.vikram?.color} />
                    <polyline points="330,420 350,410 372,402" stroke={P.arun?.color} />
                    <polyline points="590,120 575,132 560,146" stroke={P.rahul?.color} />
                  </g>
                )}
                {s.ov.shuttle && (
                  <g>
                    <path d="M560,128 Q580,210 600,408" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="5 5" />
                    <circle cx="600" cy="408" r="3.5" fill="#fff" />
                  </g>
                )}
                <ellipse cx="372" cy="405" rx="18" ry="5" fill="none" stroke={P.arun?.color} strokeWidth="1.5" />
                <ellipse cx="596" cy="428" rx="18" ry="5" fill="none" stroke={P.vikram?.color} strokeWidth="1.5" />
                <rect x="548" y="143" width="24" height="7" fill="none" stroke={P.rahul?.color} strokeWidth="1.5" />
                <rect x="398" y="168" width="24" height="7" fill="none" stroke={P.sameer?.color} strokeWidth="1.5" />
              </svg>
              {s.ov.labels && (
                <>
                  <FrameLabel id="arun" left="34%" top="61%" />
                  <FrameLabel id="vikram" left="62%" top="65%" />
                  <FrameLabel id="rahul" left="58%" top="15%" />
                  <FrameLabel id="sameer" left="43%" top="20%" />
                </>
              )}
              {s.ov.shots && ce && ceHitter && (
                <div className="mono" style={{ position: 'absolute', right: 16, bottom: 16, padding: '6px 10px', background: 'rgba(10,12,14,.85)', border: '1px solid var(--line-2)', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                  {ce.type.toUpperCase()} · {ceHitter.name} → {ce.target ? P[ce.target].name : '—'} · {ce.conf}
                </div>
              )}
              {s.ov.notes && cur.targeted && (
                <div style={{ position: 'absolute', left: 16, top: 16, maxWidth: 280, padding: '6px 10px', background: 'rgba(36,21,23,.9)', borderLeft: '2px solid var(--crit)', fontSize: 12 }}>
                  {m.video.frameOverlayNote}
                </div>
              )}
            </>
          )}
          <div className="mono muted" style={{ position: 'absolute', right: 16, top: 16, padding: '3px 8px', background: 'rgba(10,12,14,.85)', borderRadius: 3, fontSize: 11, fontWeight: 500 }}>
            {s.view === 'analysed' ? 'ANALYSED' : 'ORIGINAL'}
          </div>
        </div>

        {/* Transport */}
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => patch({ playing: !s.playing })} aria-label={s.playing ? 'Pause' : 'Play'} className="btn btn-primary" style={{ width: 36, padding: 0, fontSize: 13, fontWeight: 400 }}>
            {s.playing ? '❚❚' : '▶'}
          </button>
          <button onClick={() => patch({ frame: s.frame - 1 })} title="Previous frame" className="btn mono" style={{ padding: '0 10px', fontSize: 12 }}>◂ 1f</button>
          <button onClick={() => patch({ frame: s.frame + 1 })} title="Next frame" className="btn mono" style={{ padding: '0 10px', fontSize: 12 }}>1f ▸</button>
          <span className="nowrap" style={{ font: '500 13px var(--mono)' }}>{fmtTime(t)} / {m.meta.videoDurationLabel}</span>
          <span className="nowrap faint" style={{ font: '400 11px var(--mono)' }}>frame {(Math.round(t * m.meta.fps) + s.frame).toLocaleString('en-US')}</span>
          <div className="push">
            <Segmented items={[0.25, 0.5, 1] as const} value={s.speed as 0.25 | 0.5 | 1} onChange={(v) => patch({ speed: v })} format={(v) => `${v}×`} mono />
          </div>
          <Segmented items={['analysed', 'original'] as const} value={s.view} onChange={(v) => patch({ view: v })} format={(v) => v[0].toUpperCase() + v.slice(1)} />
        </div>

        {/* Overlays */}
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="label" style={{ marginRight: 4, letterSpacing: 0 }}>OVERLAYS</span>
          {(Object.keys(OV_LABELS) as OverlayKey[]).map((k) => (
            <button key={k} className={`pill${s.ov[k] ? ' on' : ''}`} aria-pressed={s.ov[k]} onClick={() => patch({ ov: { ...s.ov, [k]: !s.ov[k] } })}>
              {s.ov[k] ? '✓' : '+'} {OV_LABELS[k]}
            </button>
          ))}
        </div>

        {/* Rally timeline */}
        <div className="col" style={{ border: '1px solid var(--line-2)', borderRadius: 8, background: 'var(--bg-sunk)', padding: '12px 14px', gap: 10 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600 }}>Rally timeline</span>
            <span className="muted" style={{ fontSize: 12 }}>Game 1 · {m.meta.rallyCounts.total} rallies · {m.meta.rallyCounts.analysed} analysed</span>
            <div className="push">
              <Segmented items={['All', 'Won', 'Lost'] as const} value={s.outcome} onChange={(v) => patch({ outcome: v })} height={26} />
            </div>
            {tgt && (
              <button onClick={() => patch({ tgtOnly: !s.tgtOnly })} aria-pressed={s.tgtOnly} className="btn" style={{ height: 26, padding: '0 10px', fontSize: 12, borderColor: s.tgtOnly ? P[tgt.target].color : 'var(--line-3)', background: s.tgtOnly ? 'rgba(79,149,240,.18)' : 'transparent' }}>
                ● {tgtName} targeted
              </button>
            )}
            {['Shot type', 'Formation', 'Error', 'Confidence'].map((f) => (
              <span key={f} title="Filter coming in the next pass" className="row muted" style={{ height: 26, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 4, fontSize: 12 }}>{f} ▾</span>
            ))}
          </div>
          <div style={{ position: 'relative', paddingTop: 16 }}>
            {startPct !== null && (
              <>
                <div style={{ position: 'absolute', left: `${startPct}%`, right: 0, top: 0, bottom: 18, background: 'rgba(229,72,77,.1)', borderLeft: '1.5px solid var(--crit)' }} />
                <div style={{ position: 'absolute', left: `${startPct}%`, top: 0, paddingLeft: 6, font: '500 10px var(--mono)', color: 'var(--crit-soft)' }}>▲ targeting from {tgt!.startedAt}</div>
              </>
            )}
            <div style={{ position: 'relative', display: 'flex', gap: 2 }}>
              {m.rallies.map((r) => {
                const won = r.outcome === 'won';
                const dim = (s.outcome === 'Won' && !won) || (s.outcome === 'Lost' && won) || (s.tgtOnly && !r.targeted);
                const h = r.excluded ? '60%' : `${60 + ((r.n * 13) % 40)}%`;
                const sel = r.n === s.rally;
                return (
                  <button
                    key={r.n}
                    onClick={() => patch({ rally: r.n, ev: 0, frame: 0, picker: null, toast: null, playing: false })}
                    title={`Rally ${r.n} · ${r.scoreBefore} → ${r.scoreAfter}` + (r.excluded ? ' · not analysed' : won ? ' · won' : ' · lost')}
                    aria-current={sel}
                    style={{ flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch', opacity: dim ? 0.2 : 1 }}
                  >
                    <span style={{ height: 12, font: '10px/12px var(--mono)', color: 'var(--fg-3)', textAlign: 'center' }}>{r.mark}</span>
                    <span style={{ height: 26, display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid var(--line-4)' }}>
                      <span style={{ width: '100%', height: won || r.excluded ? h : 0, background: r.excluded ? HATCH : 'var(--us)', borderRadius: '2px 2px 0 0' }} />
                    </span>
                    <span style={{ height: 26, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ width: '100%', height: !won || r.excluded ? h : 0, background: r.excluded ? HATCH : 'var(--them)', borderRadius: '0 0 2px 2px' }} />
                    </span>
                    <span style={{ height: 16, marginTop: 2, font: '10px/16px var(--mono)', color: sel ? 'var(--fg)' : 'var(--fg-faint)', textAlign: 'center', borderTop: `2px solid ${sel ? 'var(--fg)' : 'transparent'}` }}>{r.n}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="row muted" style={{ gap: 16, fontSize: 11, flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--us)', borderRadius: 2 }} />Up: won by {m.teams.us.map((id) => P[id].name).join(' & ')}</span>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--them)', borderRadius: 2 }} />Down: won by opponent</span>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 10, background: HATCH }} />Not analysed</span>
            <span>◆ highlight</span><span>✕ our error</span>
          </div>
        </div>
      </div>

      {/* Rally panel */}
      <aside className="col" style={{ borderLeft: '1px solid var(--line)', background: 'var(--bg-sunk)', minWidth: 0 }}>
        <div className="col" style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Rally {cur.n}</span>
            <span className="mono muted" style={{ fontSize: 12, fontWeight: 500 }}>{cur.scoreBefore} → {cur.scoreAfter}</span>
            <span className="push" style={{ fontSize: 12, color: cur.excluded ? 'var(--fg-muted)' : cur.outcome === 'won' ? '#8cc4ff' : '#f5b867' }}>
              {cur.excluded ? 'Not analysed' : cur.outcome === 'won' ? '● Won' : '■ Lost'}
            </span>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            {cur.excluded ? 'Excluded from conclusions' : `${evs.length} shots · ${fmtTime(cur.startSec)} · ${cur.targeted ? `${tgtName} targeted` : 'no targeting'} · side-by-side defence`}
          </span>
        </div>
        {cur.excluded && (
          <div className="col hatch muted" style={{ margin: '16px 18px', padding: 14, border: '1px dashed var(--line-4)', borderRadius: 6, gap: 6 }}>
            <span style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>SHOT LIST UNAVAILABLE</span>
            <span>{cur.excluded}</span>
            <span className="faint">This rally is excluded from all stats and alerts.</span>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {evs.map((e, k) => {
            const key = `${s.rally}-${k}`;
            const hid = s.corr[key] ?? e.hitter;
            const hp = P[hid];
            const tp = e.target ? P[e.target] : null;
            const sel = k === s.ev;
            return (
              <div
                key={k}
                onClick={() => patch({ ev: k, frame: 0 })}
                style={{ position: 'relative', display: 'grid', gridTemplateColumns: '44px minmax(0,1fr) auto', gap: 10, padding: '9px 18px', background: sel ? 'var(--bg-raised)' : 'transparent', borderLeft: `2px solid ${sel ? 'var(--fg)' : 'transparent'}`, cursor: 'pointer' }}
              >
                <span className="muted" style={{ font: '500 11px/20px var(--mono)' }}>{fmtTime(cur.startSec + k * SHOT_GAP)}</span>
                <div className="col" style={{ gap: 3, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={(ev) => { ev.stopPropagation(); patch({ picker: s.picker === key ? null : key }); }}
                      title="Click to correct hitter"
                      aria-expanded={s.picker === key}
                      className="row"
                      style={{ gap: 5, height: 20, padding: '0 6px', border: '1px solid var(--line-3)', borderRadius: 3, background: 'var(--bg-raised)', color: 'var(--fg)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: hp.side === 'us' ? '50%' : 1, background: hp.color }} />{hp.name}
                    </button>
                    <span className="faint">→</span>
                    <span className="row" style={{ gap: 5, fontSize: 12, color: 'var(--fg-3)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: tp && tp.side === 'them' ? 1 : '50%', background: tp ? tp.color : 'var(--line-4)' }} />
                      {tp ? tp.name : cur.endLabel}
                    </span>
                    {s.corr[key] && <span className="muted" style={{ font: '600 9px var(--mono)', border: '1px solid var(--line-3)', padding: '1px 4px', borderRadius: 2 }}>CORRECTED</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{e.type} · {e.dir} · {e.zone}</span>
                  {s.picker === key && (
                    <div className="col" style={{ gap: 6, marginTop: 6, padding: 8, border: '1px solid var(--line-3)', borderRadius: 5, background: 'var(--bg)' }}>
                      <span className="muted" style={{ fontSize: 11 }}>Who hit this shot?</span>
                      <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                        {Object.values(P).map((p) => (
                          <button
                            key={p.id}
                            onClick={(ev) => { ev.stopPropagation(); pickHitter(key, p.id, hid); }}
                            className="row"
                            style={{ gap: 5, height: 26, padding: '0 8px', border: `1px solid ${p.id === hid ? 'var(--fg)' : 'var(--line-3)'}`, borderRadius: 4, background: 'var(--bg-bar)', color: 'var(--fg)', fontSize: 12, cursor: 'pointer' }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: p.side === 'us' ? '50%' : 1, background: p.color }} />{p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ConfChip small conf={{ level: e.conf, reason: e.conf + (e.why ? ': ' + e.why : ': clear hitter, shuttle and landing') }} style={{ alignSelf: 'start' }} />
              </div>
            );
          })}
        </div>
        {s.toast && (
          <div role="status" style={{ margin: '0 18px 10px', padding: '10px 12px', border: '1px solid var(--line-3)', borderRadius: 5, background: 'var(--bg-raised)', fontSize: 12 }}>{s.toast}</div>
        )}
        <div className="col" style={{ borderTop: '1px solid var(--line)', padding: '14px 18px', gap: 8 }}>
          <span className="muted" style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>COACH NOTES</span>
          {s.notes.map((n, i) => (
            <div key={i} className="row" style={{ gap: 10, fontSize: 12, alignItems: 'flex-start' }}>
              <span className="mono muted">{n.t}</span>
              <span style={{ color: 'var(--fg-2)' }}>{n.text}</span>
            </div>
          ))}
          <form className="row" style={{ gap: 6 }} onSubmit={(e) => { e.preventDefault(); addNote(); }}>
            <input className="note" value={s.draft} onChange={(e) => patch({ draft: e.target.value })} placeholder={`Note at ${fmtTime(t)}…`} aria-label="Coach note" />
            <button type="submit" className="btn" style={{ background: 'var(--bg-raised)', fontSize: 12 }}>Add</button>
          </form>
        </div>
      </aside>
    </div>
  );
}

function FrameLabel({ id, left, top }: { id: string; left: string; top: string }) {
  const p = useMatch().players[id];
  if (!p) return null;
  return (
    <div className="frame-label" style={{ left, top, borderLeft: `2px solid ${p.color}` }}>
      {p.side === 'us' ? '●' : '■'} {p.name}
    </div>
  );
}
