import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';

import {
  GeocodingResponse,
  GeocodingResult,
  WeatherData,
  WeatherResponse,
  DailyForecastDay,
} from '../models/weather.models';

// ── API base URLs ──────────────────────────────────────────────────────────
const GEO_API     = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

@Injectable({ providedIn: 'root' })
export class WeatherService {

  // inject() replaces constructor injection — modern Angular 17+ pattern
  private http = inject(HttpClient);

  // ── Signals ───────────────────────────────────────────────────────────────
  // Three signals cover every possible UI state.
  // Components read these directly — no subscribe() or async pipe needed.

  readonly weatherData = signal<WeatherData | null>(null);
  readonly isLoading   = signal<boolean>(false);
  readonly error       = signal<string | null>(null);

  // ── search() ──────────────────────────────────────────────────────────────
  // Entry point called by the forecast component.
  // Two HTTP calls happen in sequence:
  //   1. Geocoding API  → city name → lat / long
  //   2. Forecast API   → lat / long → weather data

  search(city: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.weatherData.set(null);

    const geoUrl = `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    this.http
      .get<GeocodingResponse>(geoUrl)
      .pipe(
        // switchMap chains two HTTP calls.
        // If search() is called again before this resolves,
        // switchMap cancels the in-flight request automatically.
        switchMap((geoRes) => {
          const place = this.extractPlace(geoRes, city);
          const weatherUrl = this.buildWeatherUrl(place.latitude, place.longitude);

          // Fetch weather AND carry `place` forward together.
          // Without this map, we'd lose the city/country name.
          return this.http
            .get<WeatherResponse>(weatherUrl)
            .pipe(map((weatherRes) => ({ place, weatherRes })));
        })
      )
      .subscribe({
        next: ({ place, weatherRes }) => {
          this.weatherData.set(this.toWeatherData(place, weatherRes));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Could not load weather. Please try another city.');
          this.isLoading.set(false);
        },
      });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  // Validates the geocoding response and returns the first result.
  // Throws so the error handler in subscribe() catches it.
  private extractPlace(geoRes: GeocodingResponse, city: string): GeocodingResult {
    if (!geoRes.results || geoRes.results.length === 0) {
      throw new Error(`City "${city}" not found.`);
    }
    return geoRes.results[0];
  }

  // Builds the Open Meteo forecast URL with every field we need.
  private buildWeatherUrl(lat: number, lon: number): string {
    const params = [
      `latitude=${lat}`,
      `longitude=${lon}`,
      `current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature`,
      `daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max`,
      `timezone=auto`,
      `forecast_days=7`,
    ].join('&');

    return `${WEATHER_API}?${params}`;
  }

  // Converts raw API response → the clean WeatherData shape components consume.
  private toWeatherData(place: GeocodingResult, res: WeatherResponse): WeatherData {
    return {
      city:      place.name,
      country:   place.country,
      timezone:  res.timezone,
      elevation: res.elevation,
      current:   res.current,
      daily:     this.toDailyForecastDays(res),
    };
  }

  // The core transformation:
  // Open Meteo returns parallel arrays (one value per day per field).
  // We zip them into one object per day so the template loops cleanly.
  //
  // Raw shape:                     After transformation:
  // daily.time[0]        = "Mon"   daily[0].date = "Mon"
  // daily.temp_max[0]    = 19      daily[0].maxTemp = 19
  // daily.temp_min[0]    = 13      daily[0].minTemp = 13
  //
  private toDailyForecastDays(res: WeatherResponse): DailyForecastDay[] {
    return res.daily.time.map((date, index) => ({
      date,
      maxTemp:                  Math.round(res.daily.temperature_2m_max[index]),
      minTemp:                  Math.round(res.daily.temperature_2m_min[index]),
      weatherCode:              res.daily.weather_code[index],
      precipitationProbability: res.daily.precipitation_probability_max[index],
    }));
  }
}
