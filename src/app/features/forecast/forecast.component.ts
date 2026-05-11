import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WeatherService } from '../../core/services/weather.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastComponent implements OnInit {
  // ── Dependencies ────────────────────────────────────────────────────────
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  protected readonly weather = inject(WeatherService);

  // ── Lifecycle ───────────────────────────────────────────────────────────
  // Read ?city from URL once on init, then trigger the service call.
  // Using snapshot (not observable) — the param won't change while this
  // component is alive; a fresh search creates a new instance.
  ngOnInit(): void {
    const city = this.route.snapshot.queryParamMap.get('city')?.trim();

    if (!city) {
      // Defensive — should not happen if user came from search,
      // but a direct URL hit could land here without a city.
      this.router.navigate(['/']);
      return;
    }

    this.weather.search(city);
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/']);
  }

  // ── Display helpers ─────────────────────────────────────────────────────

  // WMO weather code → emoji. Display concern, lives in the component, not the service.
  // Codes per https://open-meteo.com/en/docs (WMO Weather interpretation codes)
  getWeatherEmoji(code: number): string {
    if (code === 0)  return '☀️';   // Clear sky
    if (code <= 2)   return '⛅';   // Mainly clear / partly cloudy
    if (code === 3)  return '☁️';   // Overcast
    if (code <= 48)  return '🌫️';   // Fog
    if (code <= 55)  return '🌦️';   // Drizzle
    if (code <= 65)  return '🌧️';   // Rain
    if (code <= 75)  return '🌨️';   // Snow fall
    if (code <= 82)  return '🌧️';   // Rain showers
    if (code <= 86)  return '🌨️';   // Snow showers
    return '⛈️';                    // Thunderstorm
  }

  // Friendly weather description for the current conditions text.
  getWeatherDescription(code: number): string {
    if (code === 0)  return 'Clear sky';
    if (code <= 2)   return 'Partly cloudy';
    if (code === 3)  return 'Overcast';
    if (code <= 48)  return 'Foggy';
    if (code <= 55)  return 'Drizzle';
    if (code <= 65)  return 'Rainy';
    if (code <= 75)  return 'Snowy';
    if (code <= 82)  return 'Rain showers';
    if (code <= 86)  return 'Snow showers';
    return 'Thunderstorm';
  }

  // ISO date string → short weekday e.g. "Mon".
  // First day in the array is always today, so we label it specially.
  getDayName(isoDate: string, index: number): string {
    if (index === 0) return 'Today';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Full date for the city header.
  getTodayFullDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
