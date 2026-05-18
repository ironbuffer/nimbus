// ── SelectedCity ───────────────────────────────────────────────────────────
// The user's currently selected city, stored in localStorage so it survives
// page reloads. Coordinates are stored alongside the name so weather calls
// don't need to re-geocode on every page load.

export interface SelectedCity {
  name: string;       // e.g. "Berlin"
  country: string;    // e.g. "Germany"
  latitude: number;   // e.g. 52.52
  longitude: number;  // e.g. 13.41
  timezone: string;   // e.g. "Europe/Berlin"
}
