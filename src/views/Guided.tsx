import { ConfChip, PlayerName, Term, useMatch, withGlossary } from '../components/ui';
import type { Workspace } from '../state';

const STEP_LABELS = ['The story', 'What went wrong', 'Their game', 'Your plan'];

export function Guided({ ws }: { ws: Workspace }) {
  const m = useMatch();
  const { s, patch } = ws;
  const g = m.guided;
  // V1: full-match analysis for the next match; goal picking returns in a later version.
  const goal = g.goals.find((x) => x.key === g.defaultGoal)!;
  const next = () => patch({ step: Math.min(3, s.step + 1) });
  const back = () => patch({ step: Math.max(0, s.step - 1) });

  return (
    <div className="col" style={{ maxWidth: 960, margin: '0 auto', padding: '28px 32px 72px', gap: 40 }}>
      <div className="row" style={{ gap: 8 }} role="tablist" aria-label="Steps">
        {STEP_LABELS.map((l, i) => {
          const reachable = true;
          return (
            <button
              key={l}
              role="tab"
              aria-selected={i === s.step}
              disabled={!reachable}
              onClick={() => reachable && patch({ step: i })}
              className="col"
              style={{ flex: 1, gap: 8, padding: 0, background: 'none', border: 'none', textAlign: 'left', cursor: reachable ? 'pointer' : 'default', color: i === s.step ? 'var(--fg)' : i < s.step ? 'var(--fg-3)' : 'var(--fg-faint)' }}
            >
              <span style={{ height: 3, borderRadius: 2, background: i <= s.step ? 'var(--fg)' : 'var(--line-2)' }} />
              <span className="nowrap" style={{ font: '500 12px var(--mono)' }}>0{i + 1} · {l}</span>
            </button>
          );
        })}
      </div>

      {s.step === 0 && (
        <section className="col" style={{ gap: 40 }}>
          <div className="col" style={{ gap: 16 }}>
            <span className="eyebrow">{g.eyebrow}</span>
            <h1 className="pretty" style={{ fontSize: 42, lineHeight: 1.15, fontWeight: 600, letterSpacing: '-.02em' }}>
              {g.headlineBefore}
              <PlayerName id={g.headlineTarget} size={12} gap={8} />
              {g.headlineAfter}
            </h1>
            <p className="pretty" style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--fg-3)', maxWidth: 720 }}>{g.subline}</p>
          </div>
          <NavButtons onBack={() => patch({ mode: 'detailed', tab: 'strategy' })} backLabel="Full analysis" onNext={next} nextLabel="What went wrong →" />
        </section>
      )}

      {s.step === 1 && (
        <section className="col" style={{ gap: 24 }}>
          <StepHead title="What went wrong" sub="The three things that cost the most points. Tap one to watch it happen." />
          <div className="col" style={{ gap: 10 }}>
            {g.wentWrong.map((w, i) => (
              <button
                key={i}
                onClick={ws.viewRallies}
                className="card-hover"
                style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', gap: 18, alignItems: 'center', padding: '20px 22px', borderRadius: 10, border: '1px solid var(--line-2)', background: 'var(--bg-card)' }}
              >
                <span className="muted" style={{ font: '600 28px var(--mono)' }}>{i + 1}</span>
                <span className="col" style={{ gap: 4 }}>
                  <span className="pretty" style={{ fontSize: 20, fontWeight: 600 }}>{withGlossary(w.title, w.glossary)}</span>
                  <span className="muted" style={{ fontSize: 14 }}>{w.detail}</span>
                </span>
                <span className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
                  <span className="nowrap" style={{ font: '600 22px var(--mono)' }}>{w.cost}</span>
                  <span className="nowrap" style={{ fontSize: 12, color: 'var(--fg-3)' }}>Watch ▸</span>
                </span>
              </button>
            ))}
          </div>
          <NavButtons onBack={back} onNext={next} nextLabel="Their game →" />
        </section>
      )}

      {s.step === 2 && (
        <section className="col" style={{ gap: 24 }}>
          <StepHead title="Their game" sub="What they did to us, and where they're open." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            <div className="col" style={{ gridColumn: '1 / -1', gap: 14, padding: 22, borderRadius: 10, border: '1px solid var(--crit-bd)', background: 'var(--crit-bg)' }}>
              <div className="row" style={{ gap: 10 }}>
                <span className="tag tag-crit">▲ WHAT THEY'RE DOING</span>
                <ConfChip conf={g.stand.doing.conf} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>{g.stand.doing.title}</span>
              <ShareMeter share={g.stand.doing.share} expected={g.stand.doing.expected} height={10} />
              <div className="row mono muted" style={{ justifyContent: 'space-between', font: '500 12px var(--mono)' }}>
                <span>● {m.players[g.headlineTarget].name} {g.stand.doing.share}%</span>
                <span>normal {g.stand.doing.expected}%</span>
                <span>{m.players[m.teams.us.find((p) => p !== g.headlineTarget)!].name} {100 - g.stand.doing.share}%</span>
              </div>
            </div>
            <div className="col" style={{ gap: 10, padding: 22, borderRadius: 10, border: '1px solid var(--opp-bd)', background: 'var(--opp-bg)' }}>
              <span className="tag tag-opp" style={{ alignSelf: 'flex-start' }}>◆ OUR OPENING</span>
              <span className="pretty" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>{g.stand.opening.title}</span>
              <span className="muted" style={{ fontSize: 13 }}>{g.stand.opening.note}</span>
            </div>
            <div className="col" style={{ gap: 10, padding: 22, borderRadius: 10, border: '1px solid var(--watch-bd)', background: 'var(--watch-bg)' }}>
              <span className="tag tag-watch" style={{ alignSelf: 'flex-start' }}>◌ WHAT THEY'LL TRY NEXT</span>
              <span className="pretty" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>
                {g.stand.next.titleBefore}<Term term={g.stand.next.term} def={g.stand.next.termDef} />{g.stand.next.titleAfter}
              </span>
              <span className="muted" style={{ fontSize: 13 }}>{g.stand.next.note}</span>
            </div>
          </div>
          <NavButtons onBack={back} onNext={next} nextLabel="Show my plan →" />
        </section>
      )}

      {s.step === 3 && (
        <section className="col" style={{ gap: 24 }}>
          <div className="col" style={{ gap: 10 }}>
            <span className="eyebrow">YOUR PLAN FOR THE NEXT MATCH</span>
            <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-.01em' }}>Take these into the next match</h2>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {goal.moves.map((idx, i) => {
              const mv = g.moves[idx];
              return (
                <div key={idx} className="paper" style={{ display: 'grid', gridTemplateColumns: '56px minmax(0,1fr)', gap: 18, padding: 24, borderRadius: 10 }}>
                  <span style={{ font: '600 44px/1 var(--mono)' }}>{i + 1}</span>
                  <div className="col" style={{ gap: 12 }}>
                    <span className="pretty" style={{ fontSize: 26, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-.01em' }}>{mv.title}</span>
                    <div className="col" style={{ gap: 4, padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 6 }}>
                      <span style={{ font: '600 10px var(--mono)', letterSpacing: '.08em', color: 'var(--ink-3)' }}>SAY IT LIKE THIS</span>
                      <span style={{ fontSize: 17, fontStyle: 'italic' }}>“{mv.say}”</span>
                    </div>
                    <div className="row" style={{ gap: 12, fontSize: 13, color: 'var(--ink-2)' }}>
                      <span>Why: {mv.why}</span>
                      <a href="#" onClick={ws.viewRallies} className="push nowrap" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>See the proof</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row" style={{ gap: 14, alignItems: 'flex-start', padding: '18px 20px', borderRadius: 10, border: '1px solid var(--watch-bd)', background: 'var(--watch-bg)' }}>
            <span style={{ flex: 'none', font: '600 11px var(--mono)', letterSpacing: '.06em', color: 'var(--watch)', paddingTop: 3 }}>◌ WATCH FOR</span>
            <span style={{ fontSize: 15 }}>{g.watchFor}</span>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-lg" onClick={back} style={{ padding: '0 18px' }}>Back</button>
            <button className="btn btn-lg btn-primary" onClick={() => window.print()}>Download courtside card (PDF)</button>
            <button className="link-btn push" style={{ color: 'var(--fg-muted)' }} onClick={() => patch({ mode: 'detailed', tab: 'strategy' })}>See the full analysis</button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="col" style={{ gap: 8 }}>
      <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</h2>
      <p style={{ fontSize: 16, color: 'var(--fg-3)' }}>{sub}</p>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel, backLabel = 'Back' }: { onBack: () => void; onNext: () => void; nextLabel: string; backLabel?: string }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <button className="btn btn-lg" onClick={onBack} style={{ padding: '0 18px' }}>{backLabel}</button>
      <button className="btn btn-lg btn-primary" onClick={onNext}>{nextLabel}</button>
    </div>
  );
}

export function ShareMeter({ share, expected, height, color = '#4f95f0' }: { share: number; expected: number; height: number; color?: string }) {
  return (
    <div className="meter" style={{ height, borderRadius: height / 2 }} role="img" aria-label={`${share}% versus ${expected}% expected`}>
      <div className="fill" style={{ width: `${share}%`, background: color, borderRadius: height / 2 }} />
      <div className="mark" style={{ left: `${expected}%`, top: -height / 2, height: height * 2 }} />
    </div>
  );
}
