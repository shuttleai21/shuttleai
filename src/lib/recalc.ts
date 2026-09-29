import type { MatchAnalysis, PlayerId } from '../types';

export type Corrections = Record<string, PlayerId>; // key = `${rally}-${eventIndex}`

/**
 * Share of opponent shots aimed at `target` from `fromRally` onward, using
 * coach-corrected hitters where present. A shot only counts as an opponent
 * shot if its (corrected) hitter is on the opposing side.
 */
export function targetShare(m: MatchAnalysis, target: PlayerId, fromRally: number, corr: Corrections) {
  let atTarget = 0, total = 0;
  for (const r of m.rallies) {
    if (r.excluded || r.n < fromRally) continue;
    r.events.forEach((e, k) => {
      const hitter = corr[`${r.n}-${k}`] ?? e.hitter;
      if (m.players[hitter]?.side !== 'them' || !e.target) return;
      total++;
      if (e.target === target) atTarget++;
    });
  }
  return total ? (atTarget / total) * 100 : 0;
}

/**
 * Recompute the headline targeting share after hitter corrections. The
 * pipeline's headline number is the baseline; we apply the delta that the
 * corrections make over the shot-level data we hold.
 */
export function recalcTargeting(m: MatchAnalysis, before: Corrections, after: Corrections) {
  const t = m.strategy.targeting;
  if (!t) return null;
  const d = targetShare(m, t.target, t.startedRally, after) - targetShare(m, t.target, t.startedRally, before);
  const base = t.share + (targetShare(m, t.target, t.startedRally, before) - targetShare(m, t.target, t.startedRally, {}));
  const was = Math.round(base);
  const now = Math.round(base + d);
  // Alert threshold: meaningfully above the expected even split.
  const fires = now >= t.expected + 15;
  return { was, now, fires };
}
