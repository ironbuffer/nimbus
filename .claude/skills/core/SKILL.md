# Core Skill — Nimbus

## What belongs in core/
A file belongs in `core/` if ALL three are true:
1. It is a singleton (services) or pure (utils/models)
2. It has no UI (no template, no HTML)
3. It is used by more than one feature

```
core/
  models/
    city.models.ts           ← SelectedCity
    weather.models.ts        ← all weather interfaces
  services/
    city.service.ts          ← selected city + localStorage
    weather.service.ts       ← HTTP + per-range signals
  utils/
    weather-display.utils.ts ← getWeatherEmoji, getWeatherDescription, getDayName
```

## CityService

### Signal API
```ts
selectedCity = signal<SelectedCity | null>(null)   // read-only via asReadonly()
```

### Public methods
```ts
setCity(city: SelectedCity): void   // updates signal + writes localStorage
clearCity(): void                    // resets signal + removes localStorage
```

### Behaviour
- Hydrates from localStorage in constructor (singleton scope = runs once)
- `try/catch` around all localStorage access (private browsing safe)
- Type guard `isValidCity()` rejects corrupted entries
- Storage key: `nimbus.selectedCity`

## WeatherService

### Signal API (3 triplets)
```ts
currentData   / currentLoading   / currentError
dailyData     / dailyLoading     / dailyError
hourlyData    / hourlyLoading    / hourlyError
```

### Public methods
```ts
loadCurrent(): void
loadDaily(days: 7 | 16): void
loadHourly(): void
```

### Behaviour
- Each load reads city via `inject(CityService).selectedCity()`
- Returns early if no city
- `effect()` in constructor watches `CityService.selectedCity()` → calls `clearAll()`
- No geocoding — city already has lat/long
- Per-range cleanup: switching city clears all 9 signals

## Models — weather.models.ts

### Raw API shapes
| Interface | Purpose |
|-----------|---------|
| `CurrentWeather` | Current conditions |
| `DailyForecast` | Raw parallel daily arrays |
| `HourlyForecast` | Raw parallel hourly arrays |
| `WeatherResponse` | Root response |
| `GeocodingResult` / `GeocodingResponse` | Geocoding API |

### Derived shapes (used by components)
| Interface | Purpose |
|-----------|---------|
| `DailyForecastDay` | Per-day, derived from arrays |
| `HourlyForecastHour` | Per-hour, derived from arrays |
| `CurrentWeatherData` | What detail/today consumes |
| `DailyWeatherData` | What 7-day / 16-day pages consume |
| `HourlyWeatherData` | What hourly page consumes |

## Models — city.models.ts

```ts
interface SelectedCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
```

Stores coordinates alongside name → weather calls don't re-geocode.

## Utils — weather-display.utils.ts

Pure functions. No state. No DI. Imported wherever needed.

```ts
getWeatherEmoji(code: number): string
getWeatherDescription(code: number): string
getDayName(isoDate: string, index: number): string
```

## Rules
- Never add UI to `core/`
- Never call `weatherService.load*()` from `app.component.ts`
- Update models first, then service, then components
- New services follow the same per-call signal triplet pattern
- New helpers: state/DI → service, no state/DI → util
