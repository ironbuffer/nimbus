# Nimbus — Claude Instructions

## Project Overview
Angular 19 weather app consuming the Open Meteo API (no API key required).
Two screens: city search → 7-day forecast.

**Path:** `D:\Vishal\Angular\nimbus`
**Run:** `ng serve` → http://localhost:4200
**Build:** `ng build`

## Architecture
```
src/app/
  core/              ← singletons: services, models (no UI)
  shared/            ← reusable UI components (future)
  features/
    search/          ← Screen 1: city search input
    forecast/        ← Screen 2: current weather + 7-day grid
  app.config.ts      ← global providers (HTTP, Router)
  app.routes.ts      ← top-level lazy routes
  app.component.ts   ← root shell with <router-outlet>
```

## Key Conventions
- Use `inject()` — never constructor injection
- State via `signal()` — no subscribe(), no async pipe in components
- All HTTP lives in `core/services/` — never in components
- All types/interfaces live in `core/models/` — no inline types
- Feature folders are self-contained: component + html + scss only
- Lazy-load every feature route — never eagerly import feature components in app.routes.ts

## API
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1`
- Forecast:  `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&...`
- No API key required for either endpoint

## Skill Files — Read BEFORE Exploring Code

| Domain | Skill File | Covers |
|--------|-----------|--------|
| Project structure | `.claude/skills/project/SKILL.md` | Folder layout, bootstrap chain, data flow |
| Core folder | `.claude/skills/core/SKILL.md` | Models, services, signals, HTTP patterns |
| Features | `.claude/skills/features/SKILL.md` | Feature anatomy, component rules, template patterns |
| Routing | `.claude/skills/routing/SKILL.md` | Lazy routes, query params, navigation, guards |
