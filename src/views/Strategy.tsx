import type { ReactNode } from 'react';
import { ConfChip, EvidenceTag, PlayerName, useMatch } from '../components/ui';
import type { Workspace } from '../state';
import type { Verdict } from '../types';
import { TargetingChart } from './TargetingChart';
import { ShareMeter } from './Guided';

const V_ICON: Record<Verdict, string> = { Keep: '✓ KEEP', Adjust: '~ ADJUST', Abandon: '✕ ABANDON' };

function SectionHead({ n, children, sub }: { n: string; children: ReactNode; sub?: string }) {
  return (
    <div className="section-head">
      <span className="label" style={{ letterSpacing: 0 }}>{n}</span>
      <h2>{children}</h2>
      {sub && <span className="muted">{sub}</span>}
    </div>
  );
}

export function StrategyView({ ws }: { ws: Workspace }) {
  const m = useMatch();
  const { s, patch, viewRallies } = ws;
  const st = m.strategy;
  const t = st.targeting;
  const opp = st.opportunity;

  return (
    <main className="col" style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 48px', gap: 40 }}>
      {/* 01 Alerts */}
      <section className="col" style={{ gap: 14 }}>
        <SectionHead n="01" sub="Ranked Critical › Opportunity › Watch">Alerts</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.75fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          {t ? (
            <article className="card" style={{ borderColor: 'var(--crit-bd)', overflow: 'hidden' }}>
              <div className="row" style={{ gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--line-2)' }}>
                <span className="tag tag-crit">▲ CRITICAL</span>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{t.subtitle}</span>
                <span className="push mono muted" style={{ fontSize: 12 }}>{t.sampleLabel}</span>
                <ConfChip conf={t.conf} />
              </div>
              <div style={{ padding: '18px 18px 4px' }}>
                <h3 className="pretty" style={{ margin: '0 0 16px', fontSize: 24, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-.01em' }}>
                  Opponent is directing attacking play at <PlayerName id={t.target} />.
                </h3>
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
                  <div className="col" style={{ padding: '12px 14px', gap: 8 }}>
                    <span className="label">SHOT SHARE AT {m.players[t.target].name.toUpperCase()}</span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: '600 28px/1 var(--mono)' }}>{t.share}%</span><span className="muted">vs {t.expected}% expected</span></span>
                    <ShareMeter share={t.share} expected={t.expected} height={6} color={m.players[t.target].color} />
                    <span className="muted" style={{ fontSize: 11 }}>In side-by-side defence</span>
                  </div>
                  <div className="col" style={{ padding: '12px 14px', gap: 8 }}>
                    <span className="label">STARTED</span>
                    <span style={{ font: '600 28px/1 var(--mono)' }}>{t.startedAt}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{t.startedNote}</span>
                  </div>
                  <div className="col" style={{ padding: '12px 14px', gap: 8 }}>
                    <span className="label">RALLY LOSS WHEN TARGETED</span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ font: '600 28px/1 var(--mono)' }}>{t.lossWhenTargeted}%</span><span className="muted">vs {t.lossOtherwise}% otherwise</span></span>
                    <span className="muted" style={{ fontSize: 11 }}>{t.lossNote}</span>
                  </div>
                </div>
                <div className="col" style={{ gap: 10, padding: '16px 0' }}>
                  {t.evidence.map((e, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
                      <EvidenceTag kind={e.kind} style={{ justifySelf: 'start' }} />
                      <span style={{ color: 'var(--fg-2)' }}>{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '14px 18px 16px', background: 'var(--bg-sunk)', borderTop: '1px solid var(--line-2)' }}>
                <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                  <span className="ev-tag ev-rec">→ RESPONSE OPTIONS</span>
                  <span className="muted" style={{ fontSize: 12 }}>Pick what goes into the Game 2 plan</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
                  {t.responses.map((r, i) => {
                    const on = s.plan[i];
                    return (
                      <div key={i} className="col" style={{ gap: 8, padding: 12, border: `1px solid ${on ? 'var(--hover)' : 'var(--line-2)'}`, borderRadius: 6, background: on ? 'var(--bg-raised)' : 'transparent' }}>
                        <span className="pretty" style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{r.title}</span>
                        <span className="pretty muted" style={{ fontSize: 12 }}>Trade-off: {r.trade}</span>
                        <div className="row" style={{ gap: 8, marginTop: 'auto', paddingTop: 4 }}>
                          <ConfChip conf={r.conf} />
                          <button
                            onClick={() => patch({ plan: s.plan.map((p, j) => (j === i ? !p : p)) })}
                            aria-pressed={on}
                            className={on ? 'btn btn-primary' : 'btn'}
                            style={{ marginLeft: 'auto', height: 28, padding: '0 10px', fontSize: 12, fontWeight: 600 }}
                          >
                            {on ? '✓ In plan' : 'Add to plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="row" style={{ gap: 8, padding: '12px 18px', borderTop: '1px solid var(--line-2)' }}>
                <button className="btn" onClick={viewRallies}>View {t.ralliesCount} rallies</button>
                <span className="faint" style={{ fontSize: 12 }}>Opens Video with the targeting band selected</span>
                <button className="btn push" style={{ padding: '0 14px', background: s.acked ? 'var(--bg-raised)' : 'transparent' }} onClick={() => patch({ acked: true })}>
                  {s.acked ? '✓ Acknowledged' : 'Acknowledge'}
                </button>
              </div>
            </article>
          ) : (
            <article className="col hatch muted" style={{ border: '1px dashed var(--line-4)', borderRadius: 8, padding: 20, gap: 10 }}>
              <span style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>TARGETING DETECTION · DISABLED BY CLARITY</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-3)' }}>Couldn't check whether a player is being targeted.</span>
              <span>{st.targetingUnavailable.reason}</span>
              <span>{st.targetingUnavailable.fix}</span>
            </article>
          )}

          <article className="card" style={{ borderColor: 'var(--opp-bd)', overflow: 'hidden' }}>
            <div className="row" style={{ gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--line-2)' }}>
              <span className="tag tag-opp">◆ OPPORTUNITY</span>
              <ConfChip conf={opp.conf} style={{ marginLeft: 'auto' }} />
            </div>
            <div className="col" style={{ padding: 18, gap: 14 }}>
              <h3 className="pretty" style={{ fontSize: 18, lineHeight: 1.3, fontWeight: 600 }}>
                <PlayerName id={opp.player} size={10} gap={6} /> {opp.headline}
              </h3>
              <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {opp.stats.map((x) => (
                  <div key={x.label} style={{ padding: '10px 12px' }}>
                    <div className="muted" style={{ font: '500 10px var(--mono)' }}>{x.label}</div>
                    <div style={{ font: '600 22px var(--mono)' }}>{x.value}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{x.note}</div>
                  </div>
                ))}
              </div>
              <div className="col" style={{ gap: 8 }}>
                {opp.evidence.map((e, i) => (
                  <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <EvidenceTag kind={e.kind} />
                    <span style={{ color: 'var(--fg-2)' }}>{e.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="row" style={{ gap: 8, padding: '12px 18px', borderTop: '1px solid var(--line-2)' }}>
              <button className="btn" onClick={viewRallies}>View {opp.ralliesCount} rallies</button>
              <button className="btn push" onClick={() => patch({ oppAcked: !s.oppAcked })}>{s.oppAcked ? '✓ Acknowledged' : 'Acknowledge'}</button>
            </div>
          </article>
        </div>
      </section>

      {/* 02 Plan */}
      <section className="col" style={{ gap: 14 }}>
        <SectionHead n="02" sub="Three priorities, in order. This is the courtside card in the PDF.">Plan for Game 2</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
          {st.plan.map((p, i) => (
            <div key={i} className="col paper" style={{ borderRadius: 8, padding: '22px 22px 18px', gap: 14 }}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{ font: '600 40px/1 var(--mono)' }}>{i + 1}</span>
                <span style={{ font: '600 10px var(--mono)', letterSpacing: '.06em', color: 'var(--ink-3)' }}>FROM {p.source === 'critical' ? '▲ CRITICAL' : '◆ OPPORTUNITY'}</span>
              </div>
              <p className="pretty" style={{ fontSize: 25, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-.01em' }}>{p.title}</p>
              <p className="pretty" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{p.detail}</p>
              <div className="row" style={{ gap: 10, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--paper-line)', fontSize: 12, color: 'var(--ink-2)' }}>
                <span className="mono">{p.evidenceLabel}</span>
                <a href="#" onClick={viewRallies} className="push" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>View rallies</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 14 }}>
          <div className="row" style={{ border: '1px solid var(--watch-bd)', background: 'var(--watch-bg)', borderRadius: 8, padding: '16px 18px', gap: 16, alignItems: 'flex-start' }}>
            <span className="tag tag-watch" style={{ flex: 'none' }}>◌ EXPECT THEM TO ADJUST</span>
            <div className="col" style={{ gap: 6 }}>
              <span className="pretty" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
                {st.expectAdjust.textBefore}<PlayerName id={st.expectAdjust.player} size={10} gap={6} suffix="'s" />{st.expectAdjust.textAfter}
              </span>
              <span className="muted" style={{ fontSize: 12 }}><span className="mono">◐ INFERRED</span> · {st.expectAdjust.basis}</span>
            </div>
          </div>
          <div className="col" style={{ border: '1px solid var(--line-2)', borderRadius: 8, padding: '16px 18px', gap: 6 }}>
            <span className="muted" style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>⇄ ENDS CHANGE</span>
            <span className="pretty" style={{ color: 'var(--fg-2)' }}>{st.endsChange}</span>
          </div>
        </div>
      </section>

      {/* 03 Ours */}
      <section className="col" style={{ gap: 14 }}>
        <SectionHead n="03" sub="Verdicts are suggestions. Change any of them.">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--us)' }} />Our observed strategy
        </SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
          {st.ours.map((c, i) => {
            const cur = s.verdicts[i] ?? c.aiVerdict;
            return (
              <div key={i} className="card col" style={{ padding: 14, gap: 10 }}>
                <div className="row" style={{ gap: 4 }} role="radiogroup" aria-label={`Verdict for ${c.title}`}>
                  {(['Keep', 'Adjust', 'Abandon'] as Verdict[]).map((v) => {
                    const on = v === cur;
                    return (
                      <button
                        key={v}
                        role="radio"
                        aria-checked={on}
                        title={v === c.aiVerdict ? 'AI suggestion' : undefined}
                        onClick={() => patch({ verdicts: { ...s.verdicts, [i]: v } })}
                        style={{ flex: 1, height: 26, borderRadius: 4, border: `1px solid ${on ? 'var(--fg)' : 'var(--line-2)'}`, background: on ? 'var(--fg)' : 'transparent', color: on ? 'var(--bg)' : 'var(--fg-faint)', font: '600 11px var(--mono)', cursor: 'pointer' }}
                      >
                        {V_ICON[v]}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{c.title}</span>
                <div className="col" style={{ gap: 4 }}>
                  <EvidenceTag kind="observed" style={{ alignSelf: 'flex-start', height: 18, padding: '0 6px', fontSize: 9 }} />
                  <span className="pretty" style={{ color: 'var(--fg-3)', fontSize: 12 }}>{c.evidence}</span>
                </div>
                <div className="row" style={{ gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #23272c' }}>
                  <ConfChip conf={c.conf} />
                  <span className="mono muted" style={{ fontSize: 11 }}>n={c.n}</span>
                  <a href="#" onClick={viewRallies} className="push" style={{ fontSize: 12 }}>View rallies</a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 Theirs */}
      <section className="col" style={{ gap: 14 }}>
        <SectionHead n="04">
          <span style={{ width: 10, height: 10, borderRadius: 1, background: 'var(--them)' }} />Opponent observed strategy
        </SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.35fr)', gap: 14, alignItems: 'start' }}>
          <div className="col" style={{ gap: 10 }}>
            {st.theirs.map((c, i) => (
              <div key={i} className="card col" style={{ padding: 14, gap: 8 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</span>
                  <ConfChip conf={c.conf} style={{ marginLeft: 'auto' }} />
                </div>
                <span className="pretty" style={{ color: 'var(--fg-3)', fontSize: 12 }}>{c.evidence}</span>
                <div className="row" style={{ gap: 12, fontSize: 12 }}>
                  <span className="mono muted">n={c.n}</span>
                  <a href="#" onClick={viewRallies}>View rallies</a>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Who they attack</span>
              <span className="muted" style={{ fontSize: 12 }}>{st.series.caption}</span>
              <ConfChip conf={st.series.conf} style={{ marginLeft: 'auto' }} />
            </div>
            <TargetingChart />
            <div className="row muted" style={{ gap: 18, fontSize: 12, marginTop: 6 }}>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 18, height: 3, background: m.players[st.series.primary].color }} />{m.players[st.series.primary].name} · solid</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 18, height: 0, borderTop: `2px dashed ${m.players[st.series.partner].color}` }} />{m.players[st.series.partner].name} · dashed</span>
              <span>Rallies {st.series.excludedRallies.join(', ')} excluded</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="row" style={{ gap: 14, padding: '14px 18px', border: '1px solid var(--line-2)', borderRadius: 8, color: 'var(--fg-3)' }}>
        <span className="muted" style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>EVIDENCE</span>
        <span>{st.evidenceFooter.summary}</span>
        <span className="muted">{st.evidenceFooter.exclusions}</span>
      </footer>
    </main>
  );
}

