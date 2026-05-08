// Represents the units metadata returned alongside current conditions
export interface CurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  weather_code: string;
  wind_speed_10m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
}

// Represents live/current weather conditions at time of request
export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
}

// Represents the units metadata returned alongside daily forecast
export interface DailyUnits {
  time: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  weather_code: string;
  precipitation_probability_max: string;
}

// Represents 7-day forecast arrays — each index = one day
export interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
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
  current_units: CurrentUnits;
  current: CurrentWeather;
  daily_units: DailyUnits;
  daily: DailyForecast;
}

// A single day's forecast — derived from DailyForecast arrays by index
// Used by the forecast feature component to render one card per day
export interface DailyForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
}

// ── Geocoding ──────────────────────────────────────────────────────────────
// Open Meteo geocoding API returns a list of matching cities

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  country: string;
  country_code: string;
  admin1?: string; // state / region — not always present
}

export interface GeocodingResponse {
  results?: GeocodingResult[]; // undefined when no city found
  generationtime_ms: number;
}

// ── Resolved weather data ──────────────────────────────────────────────────
// What the service exposes to components after all API calls are done

export interface WeatherData {
  city: string;          // display name e.g. "Berlin"
  country: string;       // e.g. "Germany"
  timezone: string;      // e.g. "Europe/Berlin"
  elevation: number;
  current: CurrentWeather;
  daily: DailyForecastDay[];
}
