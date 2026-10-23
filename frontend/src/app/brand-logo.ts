import { Component, input } from '@angular/core';

// Logo Dalil : étoile à huit branches (motif du zellige) et la lettre « د »
@Component({
  selector: 'app-brand-logo',
  template: `
    <svg viewBox="0 0 40 40" [attr.width]="taille()" [attr.height]="taille()" aria-hidden="true">
      <g class="etoile">
        <rect x="7" y="7" width="26" height="26" rx="4" />
        <rect x="7" y="7" width="26" height="26" rx="4" transform="rotate(45 20 20)" />
      </g>
      <path class="dal" d="M16.5 13.5 Q24.5 18 24 25.5 L15 25.5" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    .etoile {
      fill: var(--c-primary);
    }
    .dal {
      fill: none;
      stroke: var(--c-on-primary);
      stroke-width: 3.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class BrandLogo {
  readonly taille = input(32);
}
