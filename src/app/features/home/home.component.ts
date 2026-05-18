import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';

import { CityService } from '../../core/services/city.service';
import { WeatherService } from '../../core/services/weather.service';
import { SummaryCardComponent } from './summary-card/summary-card.component';

@Component({
  selector: 'app-home',
  imports: [SummaryCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // Services exposed as protected so the template can read their signals.
  protected readonly cityService    = inject(CityService);
  protected readonly weatherService = inject(WeatherService);

  // ── Derived display helpers ────────────────────────────────────────────

  // Computed signals re-evaluate whenever their inputs change.
  // No subscribe(), no manual updates — Angular tracks dependencies.

  /** Next 3 hourly entries — used as a compact preview in the Hourly card. */
  readonly nextThreeHours = computed(() => {
    const hourly = this.weatherService.hourlyData();
    if (!hourly) return [];

    // Find the first hour at or after "now" so we don't show past hours.
    const now = Date.now();
    const upcoming = hourly.hours.filter((h) => new Date(h.time).getTime() >= now);
    return upcoming.slice(0, 3);
  });

  /** Average of max temps across the 7-day data — used in 7 Days card preview. */
  readonly weekAverageMax = computed(() => {
    const daily = this.weatherService.dailyData();
    if (!daily || daily.days.length === 0) return null;
    const sum = daily.days.reduce((acc, d) => acc + d.maxTemp, 0);
    return Math.round(sum / daily.days.length);
  });

  constructor() {
    // Auto-load weather data whenever the selected city changes.
    // The effect re-runs every time selectedCity() emits a new value
    // (including the initial value when home opens).
    effect(() => {
      const city = this.cityService.selectedCity();
      if (!city) return;

      // Three parallel loads — the service handles its own loading flags.
      this.weatherService.loadCurrent();
      this.weatherService.loadDaily(7);
      this.weatherService.loadHourly();
    });
  }

  // ── Display helpers ────────────────────────────────────────────────────

  getWeatherEmoji(code: number): string {
    if (code === 0)  return '☀️';
    if (code <= 2)   return '⛅';
    if (code === 3)  return '☁️';
    if (code <= 48)  return '🌫️';
    if (code <= 55)  return '🌦️';
    if (code <= 65)  return '🌧️';
    if (code <= 75)  return '🌨️';
    if (code <= 82)  return '🌧️';
    if (code <= 86)  return '🌨️';
    return '⛈️';
  }

  getWeatherDescription(code: number): string {
    if (code === 0)  return 'Clear';
    if (code <= 2)   return 'Partly cloudy';
    if (code === 3)  return 'Overcast';
    if (code <= 48)  return 'Foggy';
    if (code <= 55)  return 'Drizzle';
    if (code <= 65)  return 'Rainy';
    if (code <= 75)  return 'Snowy';
    if (code <= 82)  return 'Showers';
    if (code <= 86)  return 'Snow';
    return 'Storm';
  }
}
