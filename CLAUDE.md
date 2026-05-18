# Nimbus — Claude Instructions

## Project Overview
Angular 19 weather dashboard consuming the Open Meteo API (no API key required).
- Top nav with persistent city selector (modal search)
- Home dashboard with 4 summary cards
- 4 detail pages: Today / 7 Days / 16 Days / Hourly

**Path:** `D:\Vishal\Angular\nimbus`
**Run:** `ng serve` → http://localhost:4200
**Build:** `ng build`

## Architecture
```
src/app/
  core/
    models/        ← TypeScript interfaces (no behaviour)
    services/      ← singletons: CityService, WeatherService
    utils/         ← pure helper functions (WMO emoji/description)
  shared/
    components/    ← reusable UI: nav, search-modal
  features/
    home/          ← dashboard with 4 summary cards
    details/
      today/
      seven-days/
      sixteen-days/
      hourly/
  app.config.ts    ← global providers (HTTP, Router)
  app.routes.ts    ← lazy-loaded routes
  app.component.ts ← shell with <app-nav /> + <router-outlet />
```

## Key Conventions
- Use `inject()` — never constructor injection
- State via `signal()` / `computed()` / `effect()` — no subscribe(), no async pipe
- All HTTP lives in `core/services/` — never in components
- All types/interfaces live in `core/models/`
- Pure helper functions live in `core/utils/` (not services)
- Reusable UI in `shared/components/`
- Feature folders are self-contained
- `ChangeDetectionStrategy.OnPush` is mandatory
- All new component selectors prefixed with `app-`
- BEM-style scss class names

## Routing
| Path | Component |
|------|-----------|
| `/` | HomeComponent (dashboard) |
| `/details/today` | TodayComponent |
| `/details/seven-days` | SevenDaysComponent |
| `/details/sixteen-days` | SixteenDaysComponent |
| `/details/hourly` | HourlyComponent |

All routes lazy-loaded via `loadComponent`.

## State management
- `CityService` — selected city in signal, persisted to localStorage
- `WeatherService` — three per-range signal triplets: `current*`, `daily*`, `hourly*`
- `effect()` in WeatherService watches `CityService.selectedCity()` → clears stale data
- Each detail page has its own `effect()` to auto-load on mount and on city change

## API
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=5`
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&...`
- No API key required

## Skill Files

| Domain | Skill File | Covers |
|--------|-----------|--------|
| Project structure | `.claude/skills/project/SKILL.md` | Folder layout, bootstrap, data flow |
| Core | `.claude/skills/core/SKILL.md` | Models, services, signals, utils |
| Features | `.claude/skills/features/SKILL.md` | Home, details, templates, helpers |
| Routing | `.claude/skills/routing/SKILL.md` | Lazy routes, navigation patterns |
