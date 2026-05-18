import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  WeatherResponse,
  DailyForecastDay,
  CurrentWeatherData,
  DailyWeatherData,
  HourlyWeatherData,
  HourlyForecastHour,
} from '../models/weather.models';
import { CityService } from './city.service';
import { SelectedCity } from '../models/city.models';

// ── API base URL ──────────────────────────────────────────────────────────
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

@Injectable({ providedIn: 'root' })
export class WeatherService {

  private http = inject(HttpClient);
  private cityService = inject(CityService);

  // ── Per-range signals ─────────────────────────────────────────────────────
  // Each range has its own data + loading + error triplet so that one slow
  // call doesn't block another, and detail pages can show independent states.

  readonly currentData      = signal<CurrentWeatherData | null>(null);
  readonly currentLoading   = signal<boolean>(false);
  readonly currentError     = signal<string | null>(null);

  readonly dailyData        = signal<DailyWeatherData | null>(null);
  readonly dailyLoading     = signal<boolean>(false);
  readonly dailyError       = signal<string | null>(null);

  readonly hourlyData       = signal<HourlyWeatherData | null>(null);
  readonly hourlyLoading    = signal<boolean>(false);
  readonly hourlyError      = signal<string | null>(null);

  constructor() {
    // When the selected city changes (or clears), invalidate every cached
    // range so consumers see fresh data on next read.
    effect(() => {
      this.cityService.selectedCity();
      this.clearAll();
    });
  }

  // ── Current conditions ────────────────────────────────────────────────────
  loadCurrent(): void {
    const city = this.cityService.selectedCity();
    if (!city) return;

    this.currentLoading.set(true);
    this.currentError.set(null);

    const url = this.buildUrl(city, {
      current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature',
    });

    this.http.get<WeatherResponse>(url).subscribe({
      next: (res) => {
        this.currentData.set({
          city: city.name,
          country: city.country,
          timezone: res.timezone,
          elevation: res.elevation,
          current: res.current,
        });
        this.currentLoading.set(false);
      },
      error: () => {
        this.currentError.set('Could not load current weather.');
        this.currentLoading.set(false);
      },
    });
  }

  // ── Daily forecast (7 or 16 days) ─────────────────────────────────────────
  loadDaily(days: 7 | 16): void {
    const city = this.cityService.selectedCity();
    if (!city) return;

    this.dailyLoading.set(true);
    this.dailyError.set(null);

    const url = this.buildUrl(city, {
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
      forecast_days: String(days),
    });

    this.http.get<WeatherResponse>(url).subscribe({
      next: (res) => {
        this.dailyData.set({
          city: city.name,
          country: city.country,
          timezone: res.timezone,
          days: this.toDailyForecastDays(res),
        });
        this.dailyLoading.set(false);
      },
      error: () => {
        this.dailyError.set('Could not load forecast.');
        this.dailyLoading.set(false);
      },
    });
  }

  // ── Hourly forecast (next 24 hours) ───────────────────────────────────────
  loadHourly(): void {
    const city = this.cityService.selectedCity();
    if (!city) return;

    this.hourlyLoading.set(true);
    this.hourlyError.set(null);

    const url = this.buildUrl(city, {
      hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m',
      forecast_days: '1',
    });

    this.http.get<WeatherResponse & { hourly?: any }>(url).subscribe({
      next: (res) => {
        this.hourlyData.set({
          city: city.name,
          country: city.country,
          timezone: res.timezone,
          hours: this.toHourlyForecastHours(res),
        });
        this.hourlyLoading.set(false);
      },
      error: () => {
        this.hourlyError.set('Could not load hourly forecast.');
        this.hourlyLoading.set(false);
      },
    });
  }

  // ── Private: URL builder ──────────────────────────────────────────────────

  /**
   * Builds an Open Meteo URL from a SelectedCity (which already has lat/long)
   * plus a map of extra query parameters specific to the range being fetched.
   */
  private buildUrl(city: SelectedCity, extras: Record<string, string>): string {
    const base = `${WEATHER_API}?latitude=${city.latitude}&longitude=${city.longitude}&timezone=auto`;
    const extra = Object.entries(extras)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `${base}&${extra}`;
  }

  // ── Private: transformations ──────────────────────────────────────────────

  // Zips parallel daily arrays into per-day objects.
  private toDailyForecastDays(res: WeatherResponse): DailyForecastDay[] {
    return res.daily.time.map((date, index) => ({
      date,
      maxTemp:                  Math.round(res.daily.temperature_2m_max[index]),
      minTemp:                  Math.round(res.daily.temperature_2m_min[index]),
      weatherCode:              res.daily.weather_code[index],
      precipitationProbability: res.daily.precipitation_probability_max[index],
    }));
  }

  // Zips parallel hourly arrays into per-hour objects.
  private toHourlyForecastHours(res: any): HourlyForecastHour[] {
    const h = res.hourly;
    if (!h?.time) return [];

    return h.time.map((time: string, i: number) => ({
      time,
      hour: this.formatHour(time),
      temperature:              Math.round(h.temperature_2m[i]),
      weatherCode:              h.weather_code[i],
      precipitationProbability: h.precipitation_probability[i],
      windSpeed:                h.wind_speed_10m[i],
      humidity:                 h.relative_humidity_2m[i],
    }));
  }

  // ISO timestamp → "14:00"
  private formatHour(isoTime: string): string {
    return isoTime.split('T')[1]?.slice(0, 5) ?? isoTime;
  }

  // ── Private: state cleanup ────────────────────────────────────────────────

  /**
   * Resets every cached range to its empty/idle state.
   * Called whenever the selected city changes — prevents stale data from
   * one city briefly flashing under another's name in the dashboard.
   */
  private clearAll(): void {
    this.currentData.set(null);
    this.currentLoading.set(false);
    this.currentError.set(null);

    this.dailyData.set(null);
    this.dailyLoading.set(false);
    this.dailyError.set(null);

    this.hourlyData.set(null);
    this.hourlyLoading.set(false);
    this.hourlyError.set(null);
  }
}
