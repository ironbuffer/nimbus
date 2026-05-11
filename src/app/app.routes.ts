import { Routes } from '@angular/router';

// Lazy-loaded routes:
// loadComponent() splits each feature into its own JS bundle
// downloaded only when the user visits that route.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'forecast',
    loadComponent: () =>
      import('./features/forecast/forecast.component').then(m => m.ForecastComponent),
  },
  // Catch-all: any unknown URL goes back to /
  { path: '**', redirectTo: '' },
];
