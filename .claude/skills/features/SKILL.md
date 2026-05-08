# Features Skill — Nimbus

## Feature folder anatomy
```
features/
  search/
    search.component.ts      ← logic: inject Router, handle submit
    search.component.html    ← template: input + button
    search.component.scss    ← styles scoped to this component only
  forecast/
    forecast.component.ts    ← logic: read route param, call service, read signals
    forecast.component.html  ← template: current card + 7-day grid
    forecast.component.scss  ← styles scoped to this component only
```

No subfolders inside a feature unless it has child components.
No `index.ts` barrel files — import directly.

## Component rules
- Always `standalone: true` — no NgModule
- Always `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `inject()` for all dependencies — no constructor injection
- Read signals in template with `()` call syntax: `{{ service.isLoading() }}`
- Never call `.subscribe()` inside a component
- Never put HTTP calls inside a component

## search.component — responsibilities
1. Render a text input and submit button
2. On submit: validate input is not empty
3. Navigate to `/forecast?city={value}` via `Router`
4. No service calls — search has no data needs of its own

```ts
// Pattern
private router = inject(Router);

onSearch(city: string): void {
  if (!city.trim()) return;
  this.router.navigate(['/forecast'], { queryParams: { city } });
}
```

## forecast.component — responsibilities
1. Read `?city` query param from `ActivatedRoute` on init
2. Call `weatherService.search(city)` once
3. Read signals: `weatherService.weatherData()`, `isLoading()`, `error()`
4. Render three states: loading / error / data

```ts
// Pattern
private route   = inject(ActivatedRoute);
private weather = inject(WeatherService);

ngOnInit(): void {
  const city = this.route.snapshot.queryParamMap.get('city') ?? '';
  this.weather.search(city);
}
```

## Template patterns

### Three-state rendering (loading / error / data)
```html
@if (weather.isLoading()) {
  <p>Loading…</p>
} @else if (weather.error()) {
  <p>{{ weather.error() }}</p>
} @else if (weather.weatherData(); as data) {
  <!-- render data -->
}
```

### Looping daily forecast
```html
@for (day of weather.weatherData()!.daily; track day.date) {
  <app-day-card [day]="day" />
}
```

### WMO weather code → emoji helper
Add a `getWeatherEmoji(code: number): string` method to the component.
Do NOT put this in the service — it is a display concern.

```ts
getWeatherEmoji(code: number): string {
  if (code === 0)              return '☀️';
  if (code <= 3)               return '⛅';
  if (code <= 48)              return '🌫️';
  if (code <= 55)              return '🌦️';
  if (code <= 65)              return '🌧️';
  if (code <= 75)              return '🌨️';
  if (code <= 82)              return '🌧️';
  if (code <= 86)              return '🌨️';
  return '⛈️';
}
```

## Rules
- One component = one screen. Never combine search + forecast in one component.
- Never import one feature component into another feature.
- Shared UI (used by 2+ features) → move to `shared/` folder.
- scss files: use BEM-style class names, no global selectors.
- `ChangeDetectionStrategy.OnPush` is mandatory — signals only update when read inside the template.
