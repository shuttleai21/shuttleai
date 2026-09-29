// Data contract between the analysis pipeline and the coach workspace.
// Everything the UI shows comes from a MatchAnalysis object; the sample in
// src/data/sampleMatch.ts stands in for pipeline output until it exists.

export type Confidence = 'High' | 'Medium' | 'Low';
export type Side = 'us' | 'them';
export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  side: Side;
  /** Swatch colour. Our side = circles, opponent = squares. */
  color: string;
}

export interface Conf {
  level: Confidence;
  /** Why this level — shown on hover. Never omit: coaches need the reason. */
  reason: string;
}

export interface MatchMeta {
  discipline: string; // "Men's doubles"
  context: string; // "Next-game · plan for Game 2"
  scoreLine: string; // "G1 17–21"
  durationLabel: string; // "22 min"
  videoDurationLabel: string; // "22:04"
  videoFile: string;
  videoSpec: string; // "1080p · 60 fps"
  fps: number;
  clarity: Conf;
  session: { endsInLabel: string; downloadsTotal: number };
  rallyCounts: { total: number; analysed: number };
}

export interface Goal {
  key: 'close' | 'g2' | 'match';
  title: string;
  sub: string;
  verb: string;
  withPlan: string;
  without: string;
  conf: Conf;
  /** Indexes into guided.moves to include for this goal. */
  moves: number[];
  standLine: string;
}

export interface GuidedMove {
  title: string;
  say: string;
  why: string;
}

export interface WentWrong {
  title: string; // may reference a glossary term via {{term}}
  detail: string;
  cost: string;
  glossary?: { term: string; definition: string };
}

export interface Guided {
  eyebrow: string;
  headlineBefore: string;
  headlineTarget: PlayerId;
  headlineAfter: string;
  subline: string;
  goalsFootnote: string;
  defaultGoal: Goal['key'];
  goals: Goal[];
  wentWrong: WentWrong[];
  stand: {
    doing: { title: string; conf: Conf; share: number; expected: number };
    opening: { title: string; note: string };
    next: { titleBefore: string; term: string; termDef: string; titleAfter: string; note: string };
  };
  moves: GuidedMove[];
  watchFor: string;
}

export interface EvidenceLine {
  kind: 'observed' | 'inferred' | 'interpretation' | 'rec';
  text: string;
}

export interface ResponseOption {
  title: string;
  trade: string;
  conf: Conf;
  inPlanByDefault: boolean;
}

export interface TargetingAlert {
  target: PlayerId;
  subtitle: string;
  sampleLabel: string;
  conf: Conf;
  barSummary: string; // one-line for the sticky alert bar
  share: number; // 0–100
  expected: number;
  startedAt: string; // score, e.g. "9–11"
  startedRally: number;
  startedNote: string;
  lossWhenTargeted: number;
  lossOtherwise: number;
  lossNote: string;
  evidence: EvidenceLine[];
  responses: ResponseOption[];
  ralliesCount: number;
}

export interface OpportunityAlert {
  player: PlayerId;
  headline: string; // text after the player's name
  conf: Conf;
  stats: { label: string; value: string; note: string }[];
  evidence: EvidenceLine[];
  ralliesCount: number;
}

export interface PlanPriority {
  source: 'critical' | 'opportunity';
  title: string;
  detail: string;
  evidenceLabel: string;
}

export type Verdict = 'Keep' | 'Adjust' | 'Abandon';

export interface OurPattern {
  title: string;
  aiVerdict: Verdict;
  evidence: string;
  conf: Conf;
  n: number;
}

export interface TheirPattern {
  title: string;
  evidence: string;
  conf: Conf;
  n: number;
}

export interface TargetingSeries {
  /** Rally number each sample ends at, and target player's share (0–100). */
  points: { rally: number; share: number }[];
  primary: PlayerId;
  partner: PlayerId;
  excludedRallies: number[];
  conf: Conf;
  caption: string;
}

export interface Strategy {
  targeting: TargetingAlert | null; // null = detection unavailable
  targetingUnavailable: { reason: string; fix: string; barNote: string };
  opportunity: OpportunityAlert;
  plan: PlanPriority[];
  expectAdjust: { textBefore: string; player: PlayerId; textAfter: string; basis: string };
  endsChange: string;
  ours: OurPattern[];
  theirs: TheirPattern[];
  series: TargetingSeries;
  evidenceFooter: { summary: string; exclusions: string };
}

export type Outcome = 'won' | 'lost';

export interface ShotEvent {
  hitter: PlayerId;
  target: PlayerId | null; // null = rally-ending shot
  type: string;
  dir: string;
  zone: string;
  conf: Confidence;
  why?: string | null;
}

export interface Rally {
  n: number;
  outcome: Outcome;
  scoreBefore: string;
  scoreAfter: string;
  startSec: number;
  /** Reason the rally was excluded, or null if analysed. */
  excluded: string | null;
  targeted: boolean;
  mark: '' | '◆' | '✕';
  events: ShotEvent[];
  endLabel?: string;
}

export interface CoachNote {
  t: string;
  text: string;
}

export interface MatchAnalysis {
  meta: MatchMeta;
  players: Record<PlayerId, Player>;
  teams: { us: [PlayerId, PlayerId]; them: [PlayerId, PlayerId] };
  guided: Guided;
  strategy: Strategy;
  rallies: Rally[];
  notes: CoachNote[];
  video: { defaultRally: number; defaultEvent: number; frameOverlayNote: string };
}
