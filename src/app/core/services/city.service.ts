import { Injectable, signal } from '@angular/core';

import { SelectedCity } from '../models/city.models';

// localStorage key — namespaced to avoid collisions with other apps
// on the same domain (relevant if you ever host this alongside other tools).
const STORAGE_KEY = 'nimbus.selectedCity';

@Injectable({ providedIn: 'root' })
export class CityService {
  // ── State ────────────────────────────────────────────────────────────────
  // Backing writable signal kept private — outside code reads via the
  // read-only `selectedCity` exposure below. This prevents components from
  // mutating state directly; they must go through setCity()/clearCity().
  private readonly _selectedCity = signal<SelectedCity | null>(null);

  // Public read-only signal — components call `cityService.selectedCity()`
  // to read the current value reactively in templates.
  readonly selectedCity = this._selectedCity.asReadonly();

  constructor() {
    // Hydrate signal from localStorage on first instantiation (app boot).
    // Singleton scope means this runs exactly once per app lifetime.
    this.hydrateFromStorage();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Sets the currently selected city.
   * Updates the in-memory signal AND persists to localStorage.
   * Any component reading `selectedCity()` re-renders automatically.
   */
  setCity(city: SelectedCity): void {
    this._selectedCity.set(city);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    } catch {
      // Storage can fail in private browsing mode, when quota is full,
      // or when localStorage is disabled. We silently fall back to
      // in-memory only — the signal still works for this session.
    }
  }

  /**
   * Clears the selected city.
   * Returns the user to the empty state until they pick a new one.
   */
  clearCity(): void {
    this._selectedCity.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same fallback reasoning as setCity().
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Reads localStorage on boot and rehydrates the signal.
   * Wrapped in try/catch because:
   *  1. localStorage access can throw in some environments
   *  2. JSON.parse can throw on malformed/corrupt data
   * In either failure case, we treat it as "no city saved" — safe default.
   */
  private hydrateFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SelectedCity;

      // Light validation — reject anything that doesn't look like
      // a SelectedCity (e.g. user manually edited localStorage).
      if (this.isValidCity(parsed)) {
        this._selectedCity.set(parsed);
      } else {
        // Corrupt entry — clean it up so we don't keep failing every reload.
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Either localStorage threw or JSON was unparseable — treat as empty.
    }
  }

  /**
   * Type guard for hydrated values. Doesn't need to be exhaustive;
   * just enough to catch obviously broken / tampered data.
   */
  private isValidCity(value: unknown): value is SelectedCity {
    if (!value || typeof value !== 'object') return false;
    const c = value as Partial<SelectedCity>;
    return (
      typeof c.name === 'string' &&
      typeof c.country === 'string' &&
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      typeof c.timezone === 'string'
    );
  }
}
