// ── Raw Open Meteo response shapes ─────────────────────────────────────────

// Live conditions at time of request
export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
}

// Parallel daily arrays — one value per day per field
export interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
}

// Parallel hourly arrays — one value per hour per field
export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  relative_humidity_2m: number[];
}

// Root response shape from Open Meteo /v1/forecast
export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: CurrentWeather;
  daily: DailyForecast;
}

// ── Derived per-day & per-hour shapes ──────────────────────────────────────
// Service converts parallel arrays → these objects so templates loop cleanly.

export interface DailyForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface HourlyForecastHour {
  time: string;                         // raw ISO timestamp
  hour: string;                         // formatted "14:00"
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
}

// ── Geocoding (used by search modal) ───────────────────────────────────────

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  country: string;
  country_code: string;
  admin1?: string;                      // state / region — not always present
}

export interface GeocodingResponse {
  results?: GeocodingResult[];          // undefined when no city found
  generationtime_ms: number;
}

// ── Per-range resolved shapes consumed by components ───────────────────────
// Each detail page reads exactly one of these from WeatherService.

export interface CurrentWeatherData {
  city: string;
  country: string;
  timezone: string;
  elevation: number;
  current: CurrentWeather;
}

export interface DailyWeatherData {
  city: string;
  country: string;
  timezone: string;
  days: DailyForecastDay[];             // 7 or 16 entries depending on request
}

export interface HourlyWeatherData {
  city: string;
  country: string;
  timezone: string;
  hours: HourlyForecastHour[];          // 24 entries
}
