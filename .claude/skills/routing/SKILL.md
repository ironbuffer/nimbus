# Routing Skill — Nimbus

## Route map
| Path | Component | Notes |
|------|-----------|-------|
| `/` | HomeComponent | Dashboard with 4 cards or empty state |
| `/details/today` | TodayComponent | Current conditions |
| `/details/seven-days` | SevenDaysComponent | 7-day grid |
| `/details/sixteen-days` | SixteenDaysComponent | 16-day grid (4×4) |
| `/details/hourly` | HourlyComponent | 24-hour table |
| `**` | redirectTo `/` | Catch-all |

## app.routes.ts — lazy loading pattern
```ts
{
  path: 'details/today',
  loadComponent: () =>
    import('./features/details/today/today.component')
      .then(m => m.TodayComponent),
}
```

### Why lazy loading
Each feature ships as a separate JS chunk. The home page loads → only the home bundle downloads. User clicks "Today" → today bundle downloads on demand. Smaller initial payload, faster cold load.

## Navigation patterns

### Programmatic navigation
```ts
private router = inject(Router);

goHome(): void {
  this.router.navigate(['/']);
}
```

### Template links via routerLink
```html
<a routerLink="/details/today">View today</a>
```

### Auto-redirect when prerequisites missing
Every detail page redirects home if no city is selected:
```ts
effect(() => {
  const city = this.cityService.selectedCity();
  if (!city) { this.router.navigate(['/']); return; }
  this.weatherService.loadXxx();
});
```
This handles direct URL access without state.

## app.component shell
The root component has ONE job: provide `<app-nav />` + `<router-outlet />`.

```html
<app-nav />
<router-outlet />
```

No navigation logic in `app.component.ts`. The nav handles the search modal; routes handle their own data loads.

## City state vs route state
- **City lives in `CityService`** (signal + localStorage), NOT in route params
- Routes are stateless paths — they don't carry city in the URL
- Detail pages read city from `CityService`, not from `ActivatedRoute`
- This means the URL stays clean: `/details/today` (not `/details/today?city=Berlin`)

## Rules
- Never use `RouterModule.forRoot()` — use `provideRouter(routes)` in `app.config.ts`
- Always use `loadComponent` for feature routes
- Never store weather data in route state — always re-fetch from service
- Detail pages must redirect to `/` if `CityService` has no city
- One route = one component file (no nested route configs)
