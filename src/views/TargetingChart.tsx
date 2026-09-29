import { useMatch } from '../components/ui';

/** "Who they attack" line chart, derived from strategy.series. */
export function TargetingChart() {
  const m = useMatch();
  const st = m.strategy;
  const se = st.series;
  const total = m.meta.rallyCounts.total;
  const X0 = 40, X1 = 620, Y0 = 20, Y1 = 180;
  const x = (rally: number) => X0 + ((rally - 1) / (total - 1)) * (X1 - X0);
  const y = (share: number) => Y1 - (share / 100) * (Y1 - Y0);
  const prim = m.players[se.primary], part = m.players[se.partner];
  const pts = (fn: (s: number) => number) => se.points.map((p) => `${x(p.rally).toFixed(1)},${fn(p.share).toFixed(1)}`).join(' ');
  const last = se.points[se.points.length - 1];
  const bandX = st.targeting ? x(st.targeting.startedRally) : null;
  const ticks = [1, 11, 21, 31, total];

  return (
    <svg viewBox="0 0 700 220" style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'var(--mono)' }} role="img"
      aria-label={`${prim.name} received ${last.share}% of opponent attacks by the end of Game 1, versus 50% expected.`}>
      {bandX !== null && (
        <>
          <rect x={bandX} y={Y0} width={X1 - bandX} height={Y1 - Y0} fill="#e5484d" opacity=".09" />
          <line x1={bandX} y1={16} x2={bandX} y2={184} stroke="#e5484d" strokeWidth="1.5" />
          <text x={bandX + 5.4} y={32} fill="#f08a8d" fontSize="11">▲ targeting detected · from {st.targeting!.startedAt}</text>
        </>
      )}
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="#2a2f35" />
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="#3a4048" />
      <line x1={X0} y1={y(50)} x2={X1} y2={y(50)} stroke="#8b949e" strokeDasharray="2 4" />
      <text x={34} y={24} fill="#6b7580" fontSize="10" textAnchor="end">100%</text>
      <text x={34} y={104} fill="#6b7580" fontSize="10" textAnchor="end">50%</text>
      <text x={34} y={184} fill="#6b7580" fontSize="10" textAnchor="end">0%</text>
      <text x={44} y={94} fill="#9aa3ad" fontSize="10">expected 50%</text>
      <polyline points={pts((s) => y(100 - s))} fill="none" stroke={part.color} strokeWidth="2" strokeDasharray="6 4" />
      <polyline points={pts(y)} fill="none" stroke={prim.color} strokeWidth="2.5" />
      <circle cx={x(last.rally)} cy={y(last.share)} r="4" fill={prim.color} />
      <circle cx={x(last.rally)} cy={y(100 - last.share)} r="4" fill="#0f1113" stroke={part.color} strokeWidth="2" />
      <text x={630} y={y(last.share) - 2} fill="#e8eaed" fontSize="12" fontWeight="600">{prim.name}</text>
      <text x={630} y={y(last.share) + 12} fill="#9aa3ad" fontSize="11">{last.share}%</text>
      <text x={630} y={y(100 - last.share) - 2} fill="#e8eaed" fontSize="12" fontWeight="600">{part.name}</text>
      <text x={630} y={y(100 - last.share) + 12} fill="#9aa3ad" fontSize="11">{100 - last.share}%</text>
      {ticks.map((n, i) => (
        <text key={n} x={i === ticks.length - 1 ? x(n) - 14 : Math.max(X0, x(n) - 8)} y={200} fill="#6b7580" fontSize="10">R{n}</text>
      ))}
      <text x={X0} y={215} fill="#6b7580" fontSize="10">0–0</text>
      {st.targeting && <text x={bandX! - 8} y={215} fill="#9aa3ad" fontSize="10">{st.targeting.startedAt}</text>}
      <text x={X1 - 22} y={215} fill="#6b7580" fontSize="10">{m.rallies[total - 1]?.scoreAfter}</text>
    </svg>
  );
}
