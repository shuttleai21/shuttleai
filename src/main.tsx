import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { sampleMatch } from './data/sampleMatch';
import type { MatchAnalysis } from './types';
import type { Mode, Tab } from './state';
import './styles.css';

// Query params let you open specific states while developing:
//   ?mode=detailed&tab=video      — start in Detailed › Video
//   ?targeting=off                — simulate low hitter attribution (no targeting alert)
const q = new URLSearchParams(location.search);
const match: MatchAnalysis =
  q.get('targeting') === 'off' ? { ...sampleMatch, strategy: { ...sampleMatch.strategy, targeting: null } } : sampleMatch;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App match={match} defaultMode={(q.get('mode') as Mode) || undefined} defaultTab={(q.get('tab') as Tab) || undefined} />
  </StrictMode>,
);
