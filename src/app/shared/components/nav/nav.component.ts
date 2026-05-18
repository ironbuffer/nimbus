import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CityService } from '../../../core/services/city.service';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, SearchModalComponent],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  // CityService is protected so the template can read selectedCity() directly.
  protected readonly cityService = inject(CityService);

  // Controls visibility of the search modal.
  readonly isSearchOpen = signal(false);

  openSearch(): void {
    this.isSearchOpen.set(true);
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
  }
}
