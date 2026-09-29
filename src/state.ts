import { useCallback, useState } from 'react';
import type { CoachNote, Goal, MatchAnalysis, PlayerId, Verdict } from './types';
import type { Corrections } from './lib/recalc';

export type Mode = 'simple' | 'detailed';
export type Tab = 'overview' | 'strategy' | 'video' | 'report' | 'highlights';
export type OverlayKey = 'zones' | 'labels' | 'trails' | 'shuttle' | 'shots' | 'notes';

export interface WorkspaceState {
  mode: Mode;
  tab: Tab;
  // guided
  step: number;
  goal: Goal['key'] | null;
  // strategy
  acked: boolean;
  oppAcked: boolean;
  plan: boolean[];
  verdicts: Record<number, Verdict>;
  // video
  rally: number;
  ev: number;
  frame: number;
  ov: Record<OverlayKey, boolean>;
  view: 'analysed' | 'original';
  speed: number;
  playing: boolean;
  outcome: 'All' | 'Won' | 'Lost';
  tgtOnly: boolean;
  corr: Corrections;
  picker: string | null;
  toast: string | null;
  notes: CoachNote[];
  draft: string;
}

export interface WorkspaceOptions {
  defaultMode?: Mode;
  defaultTab?: Tab;
}

export function initialState(m: MatchAnalysis, o: WorkspaceOptions = {}): WorkspaceState {
  return {
    mode: o.defaultMode ?? 'simple',
    tab: o.defaultTab ?? 'strategy',
    step: 0,
    goal: null,
    acked: false,
    oppAcked: false,
    plan: m.strategy.targeting?.responses.map((r) => r.inPlanByDefault) ?? [],
    verdicts: {},
    rally: m.video.defaultRally,
    ev: m.video.defaultEvent,
    frame: 0,
    ov: { zones: true, labels: true, trails: false, shuttle: true, shots: true, notes: true },
    view: 'analysed',
    speed: 1,
    playing: false,
    outcome: 'All',
    tgtOnly: false,
    corr: {},
    picker: null,
    toast: null,
    notes: m.notes,
    draft: '',
  };
}

export type Patch = Partial<WorkspaceState> | ((s: WorkspaceState) => Partial<WorkspaceState>);

export function useWorkspace(m: MatchAnalysis, o?: WorkspaceOptions) {
  const [s, set] = useState(() => initialState(m, o));
  const patch = useCallback((p: Patch) => set((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })), []);
  /** Jump to Video with the targeting band selected — every "View rallies" link. */
  const viewRallies = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      patch({ mode: 'detailed', tab: 'video', tgtOnly: true, rally: m.video.defaultRally, ev: m.video.defaultEvent, picker: null, toast: null });
    },
    [m, patch],
  );
  return { s, patch, viewRallies };
}

export type Workspace = ReturnType<typeof useWorkspace>;
export type { PlayerId };
