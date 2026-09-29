import type { MatchAnalysis } from './types';
import { MatchContext } from './components/ui';
import { useWorkspace, type Mode, type Tab, type Workspace } from './state';
import { Guided } from './views/Guided';
import { AlertBar } from './views/AlertBar';
import { StrategyView } from './views/Strategy';
import { VideoView } from './views/Video';

export interface AppProps {
  match: MatchAnalysis;
  defaultMode?: Mode;
  defaultTab?: Tab;
}

export default function App({ match, defaultMode, defaultTab }: AppProps) {
  const ws = useWorkspace(match, { defaultMode, defaultTab });
  return (
    <MatchContext.Provider value={match}>
      <div className="app">
        <SessionBar m={match} />
        <Header m={match} ws={ws} />
        {ws.s.mode === 'simple' ? <Guided ws={ws} /> : <Detailed ws={ws} />}
      </div>
    </MatchContext.Provider>
  );
}

function SessionBar({ m }: { m: MatchAnalysis }) {
  return (
    <div className="row" style={{ gap: 20, height: 32, padding: '0 24px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--fg-3)' }}>
      <span className="row" style={{ gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-3)' }} />
        Nothing is saved. Download your outputs within 24 hours.
      </span>
      <span className="mono muted">Session ends in {m.meta.session.endsInLabel}</span>
      <span className="mono muted push">Downloaded 0 of {m.meta.session.downloadsTotal}</span>
      <a href="#export" style={{ color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Go to downloads</a>
    </div>
  );
}

function Header({ m, ws }: { m: MatchAnalysis; ws: Workspace }) {
  const { s, patch } = ws;
  const [u1, u2] = m.teams.us.map((id) => m.players[id].name);
  const [t1, t2] = m.teams.them.map((id) => m.players[id].name);
  const modes: [Mode, string, string][] = [
    ['simple', 'Simple', 'The story and the plan, in plain words'],
    ['detailed', 'Detailed', 'Full analysis, video and evidence'],
  ];
  return (
    <header className="row" style={{ gap: 28, padding: '14px 24px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ font: "700 17px/1 'IBM Plex Sans'", letterSpacing: '-.01em' }}>
        shuttle<span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>AI</span>
      </div>
      <div style={{ width: 1, height: 28, background: 'var(--line-2)' }} />
      <div className="col" style={{ gap: 3 }}>
        <div className="row" style={{ gap: 10, fontWeight: 600, fontSize: 14 }}>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--us)' }} />
            {u1} &amp; {u2}
          </span>
          <span className="faint" style={{ fontWeight: 400 }}>vs</span>
          <span className="row" style={{ gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 1, background: 'var(--them)' }} />
            {t1} &amp; {t2}
          </span>
        </div>
        <div className="row mono muted" style={{ gap: 14, fontSize: 12 }}>
          <span>{m.meta.discipline}</span>
          <span>{m.meta.context}</span>
          <span>{m.meta.scoreLine}</span>
          <span>{m.meta.durationLabel}</span>
          <span title={m.meta.clarity.reason} className="nowrap" style={{ cursor: 'help', flex: 'none' }}>Clarity {m.meta.clarity.level} ▾</span>
        </div>
      </div>
      <div className="row push" style={{ gap: 10 }}>
        <div className="seg" style={{ borderRadius: 5 }} role="group" aria-label="View mode">
          {modes.map(([k, label, tip]) => (
            <button key={k} title={tip} className={s.mode === k ? 'on' : ''} aria-pressed={s.mode === k} onClick={() => patch({ mode: k })} style={{ height: 32, padding: '0 14px', fontSize: 13 }}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ height: 34, padding: '0 16px', borderRadius: 5 }}>Export &amp; end</button>
      </div>
    </header>
  );
}

const TABS: Tab[] = ['overview', 'strategy', 'video', 'report', 'highlights'];
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);

function Detailed({ ws }: { ws: Workspace }) {
  const { s, patch } = ws;
  return (
    <>
      <nav className="row" style={{ gap: 4, padding: '0 24px', borderBottom: '1px solid var(--line)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => patch({ tab: t })}
            aria-current={t === s.tab ? 'page' : undefined}
            style={{ height: 44, padding: '0 14px', background: 'none', border: 'none', borderBottom: `2px solid ${t === s.tab ? 'var(--fg)' : 'transparent'}`, color: t === s.tab ? 'var(--fg)' : 'var(--fg-muted)', fontSize: 14, fontWeight: t === s.tab ? 600 : 400, cursor: 'pointer' }}
          >
            {cap(t)}
          </button>
        ))}
      </nav>
      <AlertBar ws={ws} />
      {s.tab === 'strategy' && <StrategyView ws={ws} />}
      {s.tab === 'video' && <VideoView ws={ws} />}
      {s.tab !== 'strategy' && s.tab !== 'video' && (
        <div className="col" style={{ maxWidth: 560, margin: '80px auto', padding: 28, border: '1px dashed var(--line-4)', borderRadius: 8, color: 'var(--fg-muted)', gap: 8 }}>
          <span style={{ font: '600 11px var(--mono)', letterSpacing: '.06em' }}>NOT IN THIS PASS</span>
          <span style={{ fontSize: 18, color: 'var(--fg)', fontWeight: 600 }}>{cap(s.tab)} tab</span>
          <span>Strategy and Video are built first. This tab follows the same system in the next pass.</span>
        </div>
      )}
    </>
  );
}

