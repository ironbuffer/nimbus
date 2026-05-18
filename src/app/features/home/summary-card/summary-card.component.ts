import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * A reusable summary card for the home dashboard.
 *
 * Layout / interaction concerns live here (hover, routing, structure).
 * Content (preview text, charts, etc.) is projected via <ng-content>.
 * This keeps the card dumb and reusable for any preview style.
 */
@Component({
  selector: 'app-summary-card',
  imports: [RouterLink],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  // input() is the modern signal-based input API (Angular 17.1+).
  readonly title    = input.required<string>();
  readonly icon     = input.required<string>();
  readonly link     = input.required<string>();          // e.g. "/details/today"
  readonly loading  = input<boolean>(false);             // optional loading state
}
