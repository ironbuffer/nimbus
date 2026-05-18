# Project Skill — Nimbus

## Solution Layout
```
nimbus/
  src/
    main.ts                  ← bootstrapApplication() — never touch after setup
    index.html               ← single HTML shell, contains <app-root>
    styles.scss              ← global styles only
    app/
      app.config.ts          ← global providers: HTTP, Router
      app.routes.ts          ← top-level lazy routes
      app.component.ts       ← shell: <app-nav /> + <router-outlet />
      core/
        models/              ← TypeScript interfaces only
        services/            ← singletons, no UI
        utils/               ← pure functions (no state, no DI)
      shared/
        components/          ← reusable UI (nav, modals)
      features/
        home/                ← / route — dashboard
        details/             ← /details/* routes
```

## Bootstrap Chain
```
index.html  →  <app-root>
main.ts     →  bootstrapApplication(AppComponent, appConfig)
                    ├── AppComponent  → app.component.ts
                    │     ├── <app-nav />
                    │     └── <router-outlet />
                    └── appConfig     → app.config.ts
                            ├── provideHttpClient()
                            └── provideRouter(routes)
```

## Data Flow (end to end)
```
User clicks "Search" in nav
  → SearchModal opens
    → User types → debounced geocoding API call
      → User clicks a result → CityService.setCity()
        → CityService persists to localStorage + signal updates
          → WeatherService effect() detects change → clearAll()
            → Detail page effect() detects city → loadCurrent/Daily/Hourly()
              → HTTP call → signal updates
                → Template re-renders via OnPush
```

## Where Each Concern Lives

| Concern | Location |
|---------|----------|
| Global providers | `app.config.ts` |
| Route definitions | `app.routes.ts` |
| HTTP calls | `core/services/weather.service.ts` |
| City state + persistence | `core/services/city.service.ts` |
| TypeScript types | `core/models/` |
| Pure display helpers (emoji, formatters) | `core/utils/` |
| Reusable UI | `shared/components/` |
| Screen logic | `features/{home,details}/` |
| Global styles | `styles.scss` |
| Feature styles | feature folder scss files (BEM-scoped) |

## Do Not
- Import feature components eagerly in `app.routes.ts`
- Put HTTP calls in components
- Use constructor injection (use `inject()`)
- Use `.subscribe()` in components (read signals directly)
- Create a `SharedModule` or `CoreModule` (standalone architecture)
- Add helpers to services if they have no state or DI — use `core/utils/`
