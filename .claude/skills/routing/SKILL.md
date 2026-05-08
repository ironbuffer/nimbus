# Routing Skill — Nimbus

## Route map
| Path | Component | How city is passed |
|------|-----------|--------------------|
| `/` | SearchComponent | — |
| `/forecast` | ForecastComponent | `?city=Berlin` query param |

## app.routes.ts — lazy loading pattern
```ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search/search.component')
        .then(m => m.SearchComponent),
  },
  {
    path: 'forecast',
    loadComponent: () =>
      import('./features/forecast/forecast.component')
        .then(m => m.ForecastComponent),
  },
];
```

### Why lazy loading
`loadComponent` means the feature's JS bundle is only downloaded when the route is visited.
- User lands on `/` → only `search` bundle downloads
- User searches → `forecast` bundle downloads on demand
- Never use `component:` (eager) for feature routes

## app.component.ts — the shell
The root component has ONE job: provide `<router-outlet>`.
```html
<!-- app.component.html -->
<router-outlet />
```
No navigation, no logic, no service calls in `app.component.ts`.

## Navigating from search → forecast
```ts
// Inside search.component.ts
this.router.navigate(['/forecast'], { queryParams: { city: 'Berlin' } });
```
Produces URL: `/forecast?city=Berlin`

## Reading the query param in forecast
```ts
// Inside forecast.component.ts
const city = this.route.snapshot.queryParamMap.get('city') ?? '';
```
Use `snapshot` because the param only needs to be read once on init.
Use `queryParamMap.get()` — never access `queryParams` directly (always string-safe).

## Back navigation
```ts
// Inside forecast.component.ts
this.router.navigate(['/']);
```
No browser history manipulation needed.

## Rules
- Never use `RouterModule.forRoot()` — use `provideRouter(routes)` in `app.config.ts`
- Never pass weather data through router state — always re-fetch from service
- Query params are strings — always parse/validate after reading
- If city param is missing or empty, redirect to `/` immediately
