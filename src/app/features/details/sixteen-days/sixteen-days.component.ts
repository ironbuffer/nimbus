import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CityService } from '../../../core/services/city.service';
import { WeatherService } from '../../../core/services/weather.service';
import {
  getDayName,
  getWeatherDescription,
  getWeatherEmoji,
} from '../../../core/utils/weather-display.utils';

@Component({
  selector: 'app-sixteen-days',
  imports: [RouterLink],
  templateUrl: './sixteen-days.component.html',
  styleUrl: './sixteen-days.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SixteenDaysComponent {
  protected readonly cityService    = inject(CityService);
  protected readonly weatherService = inject(WeatherService);
  private readonly router           = inject(Router);

  protected readonly emoji       = getWeatherEmoji;
  protected readonly description = getWeatherDescription;
  protected readonly dayName     = getDayName;

  constructor() {
    effect(() => {
      const city = this.cityService.selectedCity();
      if (!city) {
        this.router.navigate(['/']);
        return;
      }
      this.weatherService.loadDaily(16);
    });
  }
}
