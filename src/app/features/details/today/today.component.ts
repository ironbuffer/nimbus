import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CityService } from '../../../core/services/city.service';
import { WeatherService } from '../../../core/services/weather.service';
import {
  getWeatherEmoji,
  getWeatherDescription,
} from '../../../core/utils/weather-display.utils';

@Component({
  selector: 'app-today',
  imports: [RouterLink],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayComponent {
  protected readonly cityService    = inject(CityService);
  protected readonly weatherService = inject(WeatherService);
  private readonly router           = inject(Router);

  // Bind helpers as protected fields so the template can call them.
  protected readonly emoji       = getWeatherEmoji;
  protected readonly description = getWeatherDescription;

  constructor() {
    // Redirect home if no city is selected (e.g. user lands on URL directly).
    // effect() also handles the case where city changes while on this page.
    effect(() => {
      const city = this.cityService.selectedCity();
      if (!city) {
        this.router.navigate(['/']);
        return;
      }
      this.weatherService.loadCurrent();
    });
  }
}
