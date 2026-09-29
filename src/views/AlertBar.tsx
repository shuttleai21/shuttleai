import { ConfChip, useMatch } from '../components/ui';
import type { Workspace } from '../state';

/** Sticky critical-alert bar shown above every Detailed tab. */
export function AlertBar({ ws }: { ws: Workspace }) {
  const m = useMatch();
  const { s, patch, viewRallies } = ws;
  const t = m.strategy.targeting;

  if (!t) {
    return (
      <div className="row muted" style={{ gap: 10, height: 34, padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'var(--bg-sunk)', fontSize: 12 }}>
        <span style={{ width: 10, height: 10, border: '1px dashed var(--fg-faint)', borderRadius: 2 }} />
        Targeting detection unavailable: hitter attribution Low.
        <span className="faint">{m.strategy.targetingUnavailable.barNote}</span>
      </div>
    );
  }

  const name = m.players[t.target].name;
  if (s.acked) {
    return (
      <div className="row muted" style={{ gap: 12, height: 30, padding: '0 24px', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
        <span style={{ font: '600 11px var(--mono)', color: 'var(--crit-soft)' }}>▲ CRITICAL · ACKNOWLEDGED</span>
        <span>Opponent is directing attacking play at {name} — {t.share}% vs {t.expected}% expected</span>
        <button className="link-btn" style={{ fontSize: 12 }} onClick={() => patch({ acked: false })}>Show</button>
      </div>
    );
  }

  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid var(--crit-bd)', background: '#241517' }}>
      <div className="row" style={{ gap: 8, padding: '0 16px 0 24px', background: 'var(--crit)', color: '#fff', font: '600 12px/1 var(--mono)', letterSpacing: '.06em' }}>▲ CRITICAL</div>
      <div className="row" style={{ gap: 18, padding: '11px 18px', flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Opponent is directing attacking play at {name}.</span>
        <span className="mono" style={{ minWidth: 0, fontSize: 12, color: 'var(--fg-2)' }}>{t.barSummary}</span>
        <ConfChip conf={t.conf} style={{ borderColor: '#4a3437', color: 'var(--fg)' }}>{t.conf.level} · n={parseInt(t.sampleLabel, 10)}</ConfChip>
        <span className="push muted nowrap" style={{ fontSize: 12 }}>+1 Opportunity</span>
      </div>
      <div className="row" style={{ gap: 8, padding: '0 24px 0 0' }}>
        <button className="btn btn-sm" style={{ borderColor: '#5a3a3d' }} onClick={viewRallies}>View rallies</button>
        <button className="btn btn-sm" style={{ borderColor: '#5a3a3d' }} onClick={() => patch({ tab: 'strategy' })}>Response options</button>
        <button className="btn btn-sm btn-primary" onClick={() => patch({ acked: true })}>Acknowledge</button>
      </div>
    </div>
  );
}
