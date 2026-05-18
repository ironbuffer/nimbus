import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

import { CityService } from '../../../core/services/city.service';
import {
  GeocodingResponse,
  GeocodingResult,
} from '../../../core/models/weather.models';
import { SelectedCity } from '../../../core/models/city.models';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchModalComponent implements OnInit, OnDestroy {
  // Output event — parent (nav) listens to know when to close the modal.
  // output() is the modern signal-based output API (Angular 17.3+).
  readonly close = output<void>();

  // Direct DOM reference for autofocusing the input on open.
  @ViewChild('searchInput', { static: true })
  searchInput!: ElementRef<HTMLInputElement>;

  // ── Dependencies ────────────────────────────────────────────────────────
  private http = inject(HttpClient);
  private cityService = inject(CityService);

  // ── State ───────────────────────────────────────────────────────────────
  readonly query    = signal('');
  readonly results  = signal<GeocodingResult[]>([]);
  readonly loading  = signal(false);
  readonly searched = signal(false); // true once user has typed enough chars

  // Subject feeds the debounced search pipeline below.
  private querySubject = new Subject<string>();

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Lock body scroll while modal is open — prevents background scrolling.
    document.body.style.overflow = 'hidden';

    // Focus the input shortly after open so the keyboard appears on mobile
    // and desktop users can start typing immediately.
    setTimeout(() => this.searchInput.nativeElement.focus(), 50);

    // Debounced geocoding pipeline:
    //  - debounceTime: wait 300 ms after the last keystroke
    //  - distinctUntilChanged: skip if the query hasn't actually changed
    //  - switchMap: cancel previous in-flight request when a new query arrives
    this.querySubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < 2) {
            // Don't hit the API for single characters — too noisy.
            this.loading.set(false);
            return of<GeocodingResult[]>([]);
          }
          this.loading.set(true);
          return this.geocode(q).pipe(catchError(() => of<GeocodingResult[]>([])));
        })
      )
      .subscribe((res) => {
        this.results.set(res);
        this.loading.set(false);
        this.searched.set(true);
      });
  }

  ngOnDestroy(): void {
    // Restore body scroll when modal closes.
    document.body.style.overflow = '';
    this.querySubject.complete();
  }

  // ── Event handlers ──────────────────────────────────────────────────────

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.querySubject.next(value);
  }

  selectCity(result: GeocodingResult): void {
    // Convert geocoding result → SelectedCity shape we persist.
    const city: SelectedCity = {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    };
    this.cityService.setCity(city);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close when the click is on the backdrop itself, not its children.
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  // Esc key globally closes the modal — modern HostListener for keyboard UX.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  // ── Private ─────────────────────────────────────────────────────────────

  /**
   * Hits Open Meteo geocoding API.
   * Returns up to 5 matches so users can disambiguate cities with the same name.
   */
  private geocode(query: string) {
    const url = `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    return this.http
      .get<GeocodingResponse>(url)
      .pipe(switchMap((res) => of(res.results ?? [])));
  }
}
