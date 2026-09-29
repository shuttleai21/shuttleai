import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import type { Conf, Confidence, EvidenceLine, MatchAnalysis, PlayerId } from '../types';

export const MatchContext = createContext<MatchAnalysis | null>(null);
export function useMatch(): MatchAnalysis {
  const m = useContext(MatchContext);
  if (!m) throw new Error('useMatch outside MatchContext');
  return m;
}

/** Three-bar confidence meter. Low = dashed border when `dashedLow`. */
export function ConfBars({ level, small }: { level: Confidence; small?: boolean }) {
  const on = 'var(--fg)', off = 'var(--line-4)';
  const h = small ? [4, 7, 10] : [5, 8, 11];
  return (
    <span className="conf-bars" aria-hidden>
      <span style={{ height: h[0], background: on }} />
      <span style={{ height: h[1], background: level === 'Low' ? off : on }} />
      <span style={{ height: h[2], background: level === 'High' ? on : off }} />
    </span>
  );
}

export function ConfChip({ conf, children, style, small }: { conf: Conf; children?: ReactNode; style?: CSSProperties; small?: boolean }) {
  return (
    <span
      className="chip conf"
      title={conf.reason}
      aria-label={`Confidence ${conf.level}. ${conf.reason}`}
      style={{
        ...(small ? { height: 20, padding: '0 6px', gap: 5, fontSize: 10, borderStyle: conf.level === 'Low' ? 'dashed' : 'solid' } : {}),
        ...style,
      }}
    >
      <ConfBars level={conf.level} small={small} />
      {children ?? conf.level}
    </span>
  );
}

/** Player swatch: circle for our side, square for opponents. */
export function Swatch({ id, size = 9 }: { id: PlayerId; size?: number }) {
  const p = useMatch().players[id];
  if (!p) return null;
  return <span className="dot" style={{ width: size, height: size, background: p.color, borderRadius: p.side === 'us' ? '50%' : 1 }} />;
}

export function PlayerName({ id, size = 11, gap = 7, suffix = '' }: { id: PlayerId; size?: number; gap?: number; suffix?: string }) {
  const p = useMatch().players[id];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Swatch id={id} size={size} />
      {p?.name}
      {suffix}
    </span>
  );
}

const EV_LABEL: Record<EvidenceLine['kind'], string> = {
  observed: '● OBSERVED',
  inferred: '◐ INFERRED',
  interpretation: '◇ INTERPRETATION',
  rec: '→ REC',
};

export function EvidenceTag({ kind, style }: { kind: EvidenceLine['kind']; style?: CSSProperties }) {
  return <span className={`ev-tag ev-${kind}`} style={style}>{EV_LABEL[kind]}</span>;
}

export function Term({ term, def }: { term: string; def: string }) {
  return <span className="term" title={def}>{term}</span>;
}

/** Render a string containing {{term}} with a glossary tooltip. */
export function withGlossary(text: string, g?: { term: string; definition: string }) {
  if (!g) return text;
  const [a, b] = text.split(`{{${g.term}}}`);
  return (
    <>
      {a}
      <Term term={g.term} def={g.definition} />
      {b}
    </>
  );
}

export function Segmented<T extends string | number>({
  items, value, onChange, format, height = 30, fontSize = 12, mono,
}: {
  items: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string;
  height?: number; fontSize?: number; mono?: boolean;
}) {
  return (
    <div className="seg" role="group">
      {items.map((v) => (
        <button
          key={String(v)}
          className={v === value ? 'on' : ''}
          aria-pressed={v === value}
          onClick={() => onChange(v)}
          style={{ height, fontSize, fontFamily: mono ? 'var(--mono)' : undefined, fontWeight: mono ? 500 : undefined }}
        >
          {format ? format(v) : String(v)}
        </button>
      ))}
    </div>
  );
}

export function fmtTime(s: number) {
  const r = Math.round(s);
  return Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
}
