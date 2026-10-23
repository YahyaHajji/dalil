import { Component, computed, inject } from '@angular/core';
import { LangueService, ThemeService } from './preferences';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" class="btn-icon" (click)="theme.basculer()" [attr.aria-label]="label()" [title]="label()">
      @if (sombre()) {
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      } @else {
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      }
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  private readonly langue = inject(LangueService);

  protected readonly sombre = computed(() => this.theme.theme() === 'dark');
  protected readonly label = computed(() =>
    this.sombre() ? this.langue.t().themeClair : this.langue.t().themeSombre
  );
}
