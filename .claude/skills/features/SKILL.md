# Features Skill — Nimbus

## Feature folder structure
```
features/
  home/
    home.component.ts/.html/.scss   ← / route — dashboard
    summary-card/
      summary-card.component.ts/.html/.scss  ← reusable card
  details/
    today/         ← /details/today
    seven-days/    ← /details/seven-days
    sixteen-days/  ← /details/sixteen-days
    hourly/        ← /details/hourly
```

## Component rules
- Always `standalone: true` (default — no need to declare)
- Always `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `inject()` for all dependencies
- Use `input()` / `output()` (not `@Input()` / `@Output()`)
- Read signals in templates with `()`: `{{ service.selectedCity() }}`
- Never call `.subscribe()` inside a component
- Never put HTTP calls in components

## HomeComponent — responsibilities
1. Read `cityService.selectedCity()`
2. If no city → render empty state
3. If city → load current + 7-day + hourly via effect()
4. Render four `<app-summary-card>` with content projection
5. Use `computed()` for derived previews (nextThreeHours, weekAverageMax)

## Detail components — uniform pattern
Every detail page follows the same recipe:
```ts
constructor() {
  effect(() => {
    const city = this.cityService.selectedCity();
    if (!city) { this.router.navigate(['/']); return; }
    this.weatherService.loadXxx();
  });
}
```

Template structure:
```html
@let data = weatherService.xxxData();
<section class="detail">
  <a routerLink="/">← Back</a>
  <h1>...</h1>

  @if (loading) { ... }
  @else if (error) { ... }
  @else if (data) { ...render... }
</section>
```

## SummaryCard component
Reusable card used by home dashboard.

### Inputs (signal-based)
```ts
title = input.required<string>()
icon  = input.required<string>()
link  = input.required<string>()
loading = input<boolean>(false)
```

### Content projection
Parent provides preview content via `<ng-content />`.
Card handles: hover, routing, loading skeleton.

## Template patterns

### Three-state rendering with `@let`
```html
@let data = weatherService.dailyData();
@if (weatherService.dailyLoading()) { ... }
@else if (weatherService.dailyError()) { ... }
@else if (data) { ... }
```

### Looping
```html
@for (day of data.days; track day.date; let i = $index) {
  <div [class.day--today]="i === 0">...</div>
}
```

### Display helpers
Import from `core/utils/weather-display.utils.ts`:
```ts
protected readonly emoji       = getWeatherEmoji;
protected readonly description = getWeatherDescription;
```
Then use in template: `{{ emoji(code) }}`

## Rules
- One component = one screen (or one reusable widget)
- Never import one feature component into another feature
- Shared UI → move to `shared/components/`
- BEM scss classes; no global selectors
- `OnPush` is mandatory
- Pure display helpers go to `core/utils/`, not inline methods
