# Project Skill — Nimbus

## Solution Layout
```
nimbus/
  src/
    main.ts                  ← bootstrapApplication() — never touch after setup
    index.html               ← single HTML shell, contains <app-root>
    styles.scss              ← global styles only (resets, CSS variables)
    app/
      app.config.ts          ← global providers: HTTP, Router
      app.routes.ts          ← top-level routes (lazy-loaded)
      app.component.ts       ← root shell — contains <router-outlet> only
      core/                  ← singletons with no UI
      shared/                ← reusable UI components
      features/              ← one folder per screen/domain
  angular.json               ← build config, asset paths, style injection
  tsconfig.json              ← base TypeScript config
```

## Bootstrap Chain
```
index.html  →  <app-root>
main.ts     →  bootstrapApplication(AppComponent, appConfig)
                    ├── AppComponent     → app.component.ts
                    └── appConfig        → app.config.ts
                            ├── provideHttpClient()
                            └── provideRouter(routes) → app.routes.ts
```
`main.ts` never changes. All wiring is in `app.config.ts`.

## Data Flow (end to end)
```
User types city
  → search.component navigates to /forecast?city=Berlin
    → forecast.component reads ?city from ActivatedRoute
      → calls WeatherService.search("Berlin")
        → HTTP: geocoding API → lat/long
          → HTTP: forecast API → WeatherResponse
            → transform: DailyForecast[] → DailyForecastDay[]
              → weatherData signal updated
                → forecast.component template re-renders
```

## Where Each Concern Lives

| Concern | Location | Rule |
|---------|----------|------|
| Global providers | `app.config.ts` | Singletons only |
| Route definitions | `app.routes.ts` | Top level; features lazy-loaded |
| HTTP calls | `core/services/` | Never in components |
| TypeScript types | `core/models/` | Never inline in components/services |
| Reusable UI | `shared/` | Only if used by 2+ features |
| Screen logic | `features/{name}/` | Self-contained per screen |
| Global styles | `styles.scss` | CSS variables, resets |
| Feature styles | `features/{name}/*.scss` | Scoped to component |

## Do Not
- Import feature components eagerly in `app.routes.ts`
- Put HTTP calls in components
- Use constructor injection (use `inject()`)
- Use `.subscribe()` in components (read signals directly)
- Create a `SharedModule` or `CoreModule` (standalone architecture)
