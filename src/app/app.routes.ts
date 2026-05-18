import { Routes } from '@angular/router';

// Lazy-loaded routes — each feature ships as its own JS chunk,
// only downloaded when the user visits that route.
export const routes: Routes = [
  // ── Home dashboard ────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },

  // ── Detail pages ──────────────────────────────────────────────────────
  {
    path: 'details/today',
    loadComponent: () =>
      import('./features/details/today/today.component').then(m => m.TodayComponent),
  },
  {
    path: 'details/seven-days',
    loadComponent: () =>
      import('./features/details/seven-days/seven-days.component').then(m => m.SevenDaysComponent),
  },
  {
    path: 'details/sixteen-days',
    loadComponent: () =>
      import('./features/details/sixteen-days/sixteen-days.component').then(m => m.SixteenDaysComponent),
  },
  {
    path: 'details/hourly',
    loadComponent: () =>
      import('./features/details/hourly/hourly.component').then(m => m.HourlyComponent),
  },

  // Catch-all
  { path: '**', redirectTo: '' },
];
