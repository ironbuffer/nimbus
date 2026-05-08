# Core Skill — Nimbus

## What belongs in core/
A file belongs in `core/` if ALL three are true:
1. It is a singleton (one instance app-wide)
2. It has no UI (no template, no HTML)
3. It is used by more than one feature

```
core/
  models/
    weather.models.ts    ← all TypeScript interfaces
  services/
    weather.service.ts   ← all HTTP calls + signal state
```

## Models — weather.models.ts

### Interfaces (raw API shapes)
| Interface | Purpose |
|-----------|---------|
| `CurrentUnits` | Unit labels returned by Open Meteo alongside current data |
| `CurrentWeather` | Live conditions: temp, humidity, wind, feels-like |
| `DailyUnits` | Unit labels for daily forecast |
| `DailyForecast` | Raw parallel arrays from API (one value per day per field) |
| `WeatherResponse` | Root API response — contains current + daily + metadata |
| `GeocodingResult` | One city result from geocoding API |
| `GeocodingResponse` | Root geocoding response — results array |

### Derived interfaces (component-ready shapes)
| Interface | Purpose |
|-----------|---------|
| `DailyForecastDay` | One day object — produced by service, consumed by template |
| `WeatherData` | Full resolved state — what service exposes via signal |

`DailyForecast` → `DailyForecastDay[]` conversion happens in the service, never in components.

## WeatherService — weather.service.ts

### Signals (read-only to consumers)
```ts
weatherData = signal<WeatherData | null>(null)
isLoading   = signal<boolean>(false)
error       = signal<string | null>(null)
```
Components read signals directly: `weatherService.isLoading()` — no subscribe().

### Public API
```ts
search(city: string): void
```
Triggers geocode → forecast chain. Updates all three signals.

### Internal flow
1. `extractPlace()` — validates geocoding response, throws if city not found
2. `buildWeatherUrl()` — constructs forecast URL with all required params
3. `toWeatherData()` — maps raw response + place → `WeatherData`
4. `toDailyForecastDays()` — zips parallel arrays → `DailyForecastDay[]` using index

### RxJS pattern
```ts
geocodingHttp$
  .pipe(
    switchMap(geoRes => forecastHttp$.pipe(map(res => ({ place, res }))))
  )
  .subscribe({ next, error })
```
`switchMap` cancels in-flight requests on re-search. Never use `mergeMap` or `concatMap` for search.

## Rules
- Never add UI concerns to `core/`
- Never call `weatherService.search()` from `app.component.ts` — only from `forecast.component.ts`
- Add new API fields to `weather.models.ts` first, then update service
- New services follow the same signal pattern: `data`, `isLoading`, `error`
