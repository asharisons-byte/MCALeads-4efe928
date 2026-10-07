# Stitch redesign — change log

Target: Stitch "CA Executive Command Dashboard" (code.html + your screenshots).

## Foundation
- `src/index.css` — Stitch tokens (mca-* palette, neon glows, glass-panel, accent borders, scrollbars); legacy `--surface-*` / `hud-*` APIs re-pointed to the same palette.
- `src/main.tsx` — self-hosted Space Grotesk + JetBrains Mono, Font Awesome 6.

## Shell
- `Sidebar.tsx`, `Header.tsx` rewritten; new `QuickActionDock.tsx`; `App.tsx` wiring (dock, alerts badge, full-width p-5 content).

## Command Center / Dashboard
- New `ExecutiveTelemetryGrid.tsx` (10 KPI cards, real data); `ActivityCommandTimeline.tsx`.
- Rewritten: `ExecutiveOverviewView`, `SophiaExecutiveInsightsWidget`, `CallIntelligenceAndObjectionsWidget`; restyled `ActivityAndHealthSection`.
- `CommandCenter.tsx` restructured into Stitch order. `Dashboard.tsx` now opens with the same telemetry grid.
- Removed fabricated fallbacks (`|| 24`, `|| 18`, `|| 88`); Positive Mood is a real capped %.

## All other pages
- `tools/lighttodark.py`: converted ~45 light-theme files (≈3,700 class changes) to the dark palette.
- Zero-radius corners -> Stitch radii; indigo CTAs -> blue-600; Recharts recolored to neon palette.

## Preview-only (safe to delete)
- `src/preview/`, `preview.html`, `vite.preview.config.ts` — renders the real UI with mocked auth/API:
  `npx vite build --config vite.preview.config.ts`
