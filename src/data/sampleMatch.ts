// Sample pipeline output: Game 1 of a men's doubles match, 17–21 loss.
// Replace with real analysis JSON once the CV pipeline emits MatchAnalysis.
import type { MatchAnalysis, Rally, ShotEvent, Confidence } from '../types';

const conf = (level: Confidence, reason: string) => ({ level, reason });

// ---------------------------------------------------------------------------
// Rallies. Rally 24 is hand-authored; the rest are deterministic placeholders
// so the timeline and shot list have realistic shape.
// ---------------------------------------------------------------------------
const SEQ = 'WLWWLLWLWLLWWLWLLWLL' + 'LLWLWLLWLWLWLLWWWL';
const EXCLUDED: Record<number, string> = {
  6: 'Players occluded by a line judge walking past the camera.',
  14: 'Occluded: net post blocked the far-side hitter.',
  27: 'Skipped in Review Queue: rally boundary unconfirmed.',
  33: 'Skipped in Review Queue: partner attribution unconfirmed.',
};

const RALLY_24: ShotEvent[] = [
  { hitter: 'sameer', target: 'vikram', type: 'Low serve', dir: 'Straight', zone: 'Front T', conf: 'High' },
  { hitter: 'vikram', target: 'rahul', type: 'Lift', dir: 'Straight', zone: 'Rear left', conf: 'High' },
  { hitter: 'rahul', target: 'vikram', type: 'Smash', dir: 'Body', zone: 'Mid left', conf: 'High' },
  { hitter: 'vikram', target: 'sameer', type: 'Block', dir: 'Cross', zone: 'Front right', conf: 'Medium', why: 'Shuttle partly blurred at contact' },
  { hitter: 'sameer', target: 'vikram', type: 'Push', dir: 'Straight', zone: 'Mid left', conf: 'High' },
  { hitter: 'vikram', target: 'rahul', type: 'Lift', dir: 'Straight', zone: 'Rear left', conf: 'High' },
  { hitter: 'rahul', target: 'vikram', type: 'Smash', dir: 'Backhand side', zone: 'Mid left', conf: 'Low', why: 'Shuttle lost in motion blur for 6 frames; direction estimated' },
  { hitter: 'vikram', target: null, type: 'Defence', dir: 'Into net', zone: 'Net', conf: 'High' },
];

function placeholderEvents(i: number, targeted: boolean): ShotEvent[] {
  const types = ['Serve', 'Lift', 'Smash', 'Block', 'Drive', 'Push', 'Net shot', 'Clear', 'Drop'];
  const dirs = ['Straight', 'Cross', 'Body'];
  const zones = ['Front left', 'Mid right', 'Rear left', 'Mid left', 'Front right', 'Rear right'];
  const us = i % 2 ? ['arun', 'vikram'] : ['vikram', 'arun'];
  const them = ['rahul', 'sameer'];
  const n = 4 + ((i * 7) % 5);
  const list: ShotEvent[] = [];
  for (let k = 0; k < n; k++) {
    const oppHits = (k + i) % 2 === 0;
    const hitter = oppHits ? them[(k + i) % 2] : us[k % 2];
    const tg = oppHits ? (targeted && k % 3 !== 2 ? 'vikram' : 'arun') : them[(k * 3 + i) % 2];
    const c: Confidence = k === n - 1 && i % 3 === 0 ? 'Low' : k % 3 === 2 ? 'Medium' : 'High';
    list.push({
      hitter,
      target: k === n - 1 ? null : tg,
      type: k === 0 ? 'Serve' : types[(k * 5 + i) % types.length],
      dir: dirs[(k + i) % 3],
      zone: zones[(k * 2 + i) % 6],
      conf: c,
      why: c !== 'High' ? 'Motion blur in drive exchange' : null,
    });
  }
  return list;
}

function buildRallies(): Rally[] {
  let us = 0, them = 0;
  const out: Rally[] = [];
  for (let i = 1; i <= SEQ.length; i++) {
    const won = SEQ[i - 1] === 'W';
    const before = `${us}–${them}`;
    won ? us++ : them++;
    const excluded = EXCLUDED[i] ?? null;
    const targeted = !excluded && (i >= 21 ? i % 4 !== 1 : i % 3 === 0);
    out.push({
      n: i,
      outcome: won ? 'won' : 'lost',
      scoreBefore: before,
      scoreAfter: `${us}–${them}`,
      startSec: 20 + (i - 1) * 34.3,
      excluded,
      targeted,
      mark: [7, 13, 29, 35].includes(i) ? '◆' : [11, 24, 31].includes(i) ? '✕' : '',
      events: excluded ? [] : i === 24 ? RALLY_24 : placeholderEvents(i, targeted),
      endLabel: i === 24 ? 'Rally lost' : 'Rally end',
    });
  }
  return out;
}

export const sampleMatch: MatchAnalysis = {
  meta: {
    discipline: "Men's doubles",
    context: 'Full match · prep for next match',
    scoreLine: 'G1 17–21',
    durationLabel: '22 min',
    videoDurationLabel: '22:04',
    videoFile: 'match_game1.mp4',
    videoSpec: '1080p · 60 fps',
    fps: 60,
    clarity: conf('Medium', 'Medium: motion blur in drive exchanges; far-side player scale Medium'),
    session: { endsInLabel: '23 h 41 min', downloadsTotal: 4 },
    rallyCounts: { total: 38, analysed: 34 },
  },
  players: {
    arun: { id: 'arun', name: 'Arun', side: 'us', color: '#8cc4ff' },
    vikram: { id: 'vikram', name: 'Vikram', side: 'us', color: '#4f95f0' },
    rahul: { id: 'rahul', name: 'Rahul', side: 'them', color: '#f5b867' },
    sameer: { id: 'sameer', name: 'Sameer', side: 'them', color: '#dd8a33' },
  },
  teams: { us: ['arun', 'vikram'], them: ['rahul', 'sameer'] },
  guided: {
    eyebrow: 'GAME 1 · LOST 17–21',
    headlineBefore: 'It was close until 9–11. Then they started aiming almost every attack at ',
    headlineTarget: 'vikram',
    headlineAfter: ', and it worked.',
    subline: 'They won 10 of the last 18 points. Three changes to take into the next match.',
    goalsFootnote: 'Estimates from 34 rallies of one game. A guide, not a promise.',
    defaultGoal: 'g2',
    goals: [
      { key: 'close', title: 'Keep it close', sub: 'Lose by 4 or fewer. Build confidence.', verb: 'keep it close', withPlan: '71%', without: '48%', conf: conf('Medium', 'Medium: based on 34 rallies from one game'), moves: [0, 1], standLine: 'Two changes will keep Game 2 tight.' },
      { key: 'g2', title: 'Win Game 2', sub: 'Level the match at one game each.', verb: 'win Game 2', withPlan: '42%', without: '24%', conf: conf('Medium', 'Medium: based on 34 rallies from one game'), moves: [0, 1, 2], standLine: 'Win Game 2 and it goes to a decider.' },
      { key: 'match', title: 'Win the match', sub: 'Win Game 2, then the decider.', verb: 'win the match', withPlan: '23%', without: '11%', conf: conf('Low', 'Low: Game 3 not seen yet; assumes they adapt'), moves: [0, 1, 2, 3], standLine: 'You need to win the next two games.' },
    ],
    wentWrong: [
      { title: "We kept {{lifting}} the shuttle to Vikram's side.", glossary: { term: 'lifting', definition: 'Hitting the shuttle high and deep, which gives the other side time to smash' }, detail: '11 of 14 times, it came straight back as a smash at him.', cost: '−9 pts' },
      { title: 'Vikram was left to defend most attacks on his own.', detail: 'Arun stayed on his half while shots to the middle went to Vikram.', cost: '−6 pts' },
      { title: 'We rarely made Sameer go to the back of the court.', detail: 'He struggles there, but we only sent him back 9 of 30 times we could.', cost: '21 missed' },
    ],
    stand: {
      doing: { title: '3 of every 4 attacks go to Vikram. Normally it would be 2 of 4.', conf: conf('High', 'High: 31 attacking shots, hitters clearly identified'), share: 74, expected: 50 },
      opening: { title: "Sameer loses 6 of every 10 points when he's pushed to the back.", note: "Medium confidence: he's on the far side, so he's smaller in the video." },
      next: { titleBefore: "If Vikram holds up, they'll probably switch to Arun's ", term: 'backhand', termDef: 'The non-racket side of the body; usually harder to hit powerfully from', titleAfter: '.', note: 'A guess, based on 6 points where they briefly tried it.' },
    },
    moves: [
      { title: 'Arun guards the middle. Vikram only covers his straight line.', say: 'Vikram, just your line. Arun, the middle is yours.', why: 'takes the pressure off Vikram.' },
      { title: "Stop hitting high to Vikram's side. Play it short over the net.", say: 'No high balls to the left. Drop it short.', why: '11 of 14 high balls there came back as a smash.' },
      { title: 'Push Sameer to the back before you attack.', say: 'Deep to Sameer first. Then attack.', why: 'he loses 6 of 10 points from the back.' },
      { title: 'Game 3: expect them to go after Arun.', say: 'If they go at Arun, Vikram takes the middle.', why: 'they briefly tried it in 6 points of Game 1.' },
    ],
    watchFor: "If they start going after Arun's backhand, swap: Vikram takes the middle, Arun takes his line.",
  },
  strategy: {
    targeting: {
      target: 'vikram',
      subtitle: "Targeting · and it's working",
      sampleLabel: '31 attacking shots · 18 rallies',
      conf: conf('High', 'High: hitter attribution High, 31 attacking shots, pattern held for 18 consecutive rallies'),
      barSummary: '74% of attacks vs 50% expected · since 9–11 · rally loss 65% vs 38%',
      share: 74,
      expected: 50,
      startedAt: '9–11',
      startedRally: 21,
      startedNote: 'Rally 21 of 38 · held through end of game',
      lossWhenTargeted: 65,
      lossOtherwise: 38,
      lossNote: '13 of 20 rallies lost when Vikram was the target',
      evidence: [
        { kind: 'observed', text: 'Rahul and Sameer sent 23 of 31 attacking shots at Vikram while you defended side-by-side.' },
        { kind: 'inferred', text: "Deliberate choice: share rose from 52% to 76% at 9–11 and didn't drop back." },
        { kind: 'interpretation', text: "They are playing their smashes to Vikram's backhand side, where your lifts land, and winning the follow-up." },
      ],
      responses: [
        { title: 'Rotate the defence: Arun covers the middle, Vikram takes straight', trade: "leaves more of Arun's cross-court open.", conf: conf('High', 'High: 20 targeted rallies, hitter attribution High'), inPlanByDefault: true },
        { title: "Block to the net instead of lifting to Vikram's side", trade: 'Arun must be ready to cover the net reply.', conf: conf('High', 'High: 11 of 14 lifts there were smashed back at Vikram'), inPlanByDefault: true },
        { title: 'Leave side-by-side sooner: counter-drive flat', trade: 'higher risk, and drive exchanges were harder to track.', conf: conf('Medium', 'Medium: shuttle visibility Medium in drive exchanges'), inPlanByDefault: false },
      ],
      ralliesCount: 20,
    },
    targetingUnavailable: {
      reason: 'Reason: hitter attribution Low. Arun and Vikram wore similar shirts and overlapped at the far end, so shots couldn\'t be credited reliably.',
      fix: 'Fix for next time: distinguishing note in Player Tagging, or 60 fps recording.',
      barNote: "Partners couldn't be told apart at the far end. Other alerts still ran.",
    },
    opportunity: {
      player: 'sameer',
      headline: 'loses 61% of rallies when forced to the rear court. We sent play there on only 30% of chances.',
      conf: conf('Medium', 'Medium: far-side player scale Medium; 18 rear-court rallies'),
      stats: [
        { label: 'RALLY LOSS, REAR', value: '61%', note: '11 of 18 rallies' },
        { label: 'CHANCES USED', value: '30%', note: '9 of 30 chances' },
      ],
      evidence: [
        { kind: 'observed', text: 'From the rear, Sameer mostly clears cross-court, and those clears land short.' },
        { kind: 'rec', text: "Lift or push to Sameer's rear before attacking. Plan priority 3." },
      ],
      ralliesCount: 18,
    },
    plan: [
      { source: 'critical', title: 'Arun covers more of the middle in defence. Vikram takes straight.', detail: "Takes the body and middle smashes off Vikram's backhand side.", evidenceLabel: 'High · 20 rallies' },
      { source: 'critical', title: "Replace defensive lifts to Vikram's side with blocks to the net.", detail: '11 of 14 lifts there were smashed straight back at Vikram.', evidenceLabel: 'High · 14 rallies' },
      { source: 'opportunity', title: 'Push Sameer to the rear court before attacking.', detail: 'He loses 61% of rallies from there; we used 30% of chances.', evidenceLabel: 'Medium · 18 rallies' },
    ],
    expectAdjust: { textBefore: "If Vikram holds up early, they'll likely switch to attacking ", player: 'arun', textAfter: ' backhand.', basis: "From 6 rallies in Game 1 where they briefly tested Arun's backhand after two held defences." },
    endsChange: "Game 2 starts with ends swapped. You'll be on the far side of the camera. Your colours stay the same.",
    ours: [
      { title: 'Side-by-side defence', aiVerdict: 'Adjust', evidence: 'Held 62% of attacking rallies before 9–11, 35% after.', conf: conf('High', 'High: 19 defensive rallies, clear formation detection'), n: 19 },
      { title: 'Low serve to the T', aiVerdict: 'Keep', evidence: 'Won 58% of rallies on our serve. Opponent rarely attacked the first reply.', conf: conf('Medium', 'Medium: service-line contact partly blurred'), n: 18 },
      { title: "Defensive lifts to Vikram's side", aiVerdict: 'Abandon', evidence: '11 of 14 lifts to rear left were followed by a smash at Vikram.', conf: conf('High', 'High: trajectories and hitters both High'), n: 14 },
      { title: 'Front-back after a drive', aiVerdict: 'Keep', evidence: 'Won 7 of 9 rallies where Arun reached the front after a drive.', conf: conf('Medium', 'Medium: small sample, drive exchanges blurred'), n: 9 },
    ],
    theirs: [
      { title: 'Attack aimed at Vikram in defence', evidence: '23 of 31 attacking shots at Vikram since 9–11, mostly to the backhand side and body.', conf: conf('High', 'High: hitter attribution High'), n: 31 },
      { title: 'Rahul back, Sameer front', evidence: 'Rahul played 71% of rear-court attacking shots; Sameer stayed at the net after serve.', conf: conf('High', 'High: formation clear in 34 rallies'), n: 34 },
      { title: 'Sameer clears cross-court from the rear', evidence: 'When pushed back, 9 of 12 replies were cross-court clears landing mid-court.', conf: conf('Medium', 'Medium: far-side player scale Medium'), n: 12 },
    ],
    series: {
      points: [
        { rally: 4, share: 52 }, { rally: 8, share: 47 }, { rally: 12, share: 55 }, { rally: 16, share: 50 },
        { rally: 20, share: 58 }, { rally: 24, share: 71 }, { rally: 28, share: 76 }, { rally: 32, share: 74 },
        { rally: 36, share: 78 }, { rally: 38, share: 75 },
      ],
      primary: 'vikram',
      partner: 'arun',
      excludedRallies: [6, 14, 27, 33],
      conf: conf('High', 'High: hitter attribution High across 31 attacking shots'),
      caption: 'Opponent attacking-shot share per player, rolling 4 rallies, Game 1',
    },
    evidenceFooter: {
      summary: 'Built from 34 rallies in 1 match. Treat as a starting hypothesis.',
      exclusions: '4 of 38 rallies excluded: 2 occluded, 2 skipped in review.',
    },
  },
  rallies: buildRallies(),
  notes: [{ t: '13:31', text: "Vikram's racket prep is late on body smashes. Training item." }],
  video: { defaultRally: 24, defaultEvent: 2, frameOverlayNote: '▲ 3rd attack in a row at Vikram this rally' },
};
