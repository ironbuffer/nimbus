import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CityService } from '../../../core/services/city.service';
import { WeatherService } from '../../../core/services/weather.service';
import {
  getWeatherDescription,
  getWeatherEmoji,
} from '../../../core/utils/weather-display.utils';

@Component({
  selector: 'app-hourly',
  imports: [RouterLink],
  templateUrl: './hourly.component.html',
  styleUrl: './hourly.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HourlyComponent {
  protected readonly cityService    = inject(CityService);
  protected readonly weatherService = inject(WeatherService);
  private readonly router           = inject(Router);

  protected readonly emoji       = getWeatherEmoji;
  protected readonly description = getWeatherDescription;

  /**
   * Filter to only upcoming hours starting from "now".
   * Open Meteo returns the full day so the first few entries are in the past.
   */
  readonly upcomingHours = computed(() => {
    const hourly = this.weatherService.hourlyData();
    if (!hourly) return [];

    const now = Date.now();
    return hourly.hours.filter((h) => new Date(h.time).getTime() >= now);
  });

  constructor() {
    effect(() => {
      const city = this.cityService.selectedCity();
      if (!city) {
        this.router.navigate(['/']);
        return;
      }
      this.weatherService.loadHourly();
    });
  }
}
