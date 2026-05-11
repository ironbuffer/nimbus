import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  // Router is injected via the modern inject() function (no constructor).
  private router = inject(Router);

  // Inline validation signal — drives the error message in the template.
  // Using a signal (not a plain property) keeps OnPush change detection happy.
  readonly hasError = signal(false);

  /**
   * Called on form submit or button click.
   * Validates the input is non-empty, then navigates to /forecast?city=...
   * Letting the router carry the city keeps this component stateless.
   */
  onSearch(rawCity: string): void {
    const city = rawCity.trim();

    if (!city) {
      this.hasError.set(true);
      return;
    }

    this.hasError.set(false);
    this.router.navigate(['/forecast'], { queryParams: { city } });
  }
}
