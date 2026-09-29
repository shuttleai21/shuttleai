# shuttleAI Workspace (web)

Coach workspace UI built from the Claude Design prototype `shuttleAI Workspace v2`.
It covers Simple mode (the 4-step guided story), Detailed › Strategy, Detailed › Video,
and the critical-alert bar. Overview, Report and Highlights are stubs, same as the design.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run typecheck  # type-check only
```

Dev query params:

- `?mode=detailed&tab=video` opens Detailed › Video.
- `?targeting=off` simulates low hitter attribution, so no targeting alert shows.

## Structure

```
src/
  types.ts            MatchAnalysis: the contract the CV/analysis pipeline must emit
  data/sampleMatch.ts sample Game 1 output (rally 24 is hand-authored; other shot lists are placeholders)
  state.ts            workspace UI state (mode, tab, plan picks, verdicts, corrections, notes)
  lib/recalc.ts       re-computes the targeting share after a coach corrects a hitter
  components/ui.tsx   confidence chip, evidence tags, player swatches, segmented control
  views/              Guided, AlertBar, Strategy, TargetingChart, Video
```

Every number and sentence on screen comes from `MatchAnalysis`. To wire in the real
pipeline, produce that JSON and pass it to `<App match={...} />`.

## Not done yet

- The video frame is a placeholder with hard-coded overlay geometry. Real overlays need
  per-frame tracking data, which isn't in the schema yet.
- Play steps through the shot list on a timer. There is no real video element.
- "Download courtside card (PDF)" opens the browser print dialog. "Export & end" does nothing yet.
- The Shot type, Formation, Error and Confidence filters are visual only.
- With `targeting` set to null, the Plan, chart and opponent cards still show
  targeting-derived content from the sample data. The pipeline should omit that content
  when detection is unavailable.

## Deploy (Render)

`render.yaml` is a Render Blueprint for a static site:

1. In Render, go to **New → Blueprint** and pick this repo. Render reads `render.yaml`.
2. It runs `npm ci && npm run build` on Node 22 (type-check + build) and serves `dist/`.
3. Every push to `main` redeploys, and pull requests get preview URLs.

Commit `package-lock.json` whenever dependencies change; `npm ci` fails if it's out of sync.
