import { Component, inject } from '@angular/core';
import { LANGUES, Langue } from './i18n';
import { LangueService } from './preferences';

// Liste native : accessible au clavier et aux lecteurs d'écran, adaptée au mobile
@Component({
  selector: 'app-language-selector',
  template: `
    <label class="selecteur">
      <span class="sr-only">{{ service.t().langueInterface }}</span>
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <select [value]="service.langue()" (change)="choisir($event)" [title]="service.t().langueInterface">
        @for (l of langues; track l.code) {
          <option [value]="l.code" [selected]="l.code === service.langue()" [attr.lang]="l.lang">{{ l.nom }}</option>
        }
      </select>
      <svg class="icon chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
    </label>
  `,
  styles: `
    .selecteur {
      position: relative;
      display: inline-flex;
      align-items: center;
      color: var(--c-text-2);
    }
    .icon {
      position: absolute;
      inset-inline-start: 10px;
      width: 18px;
      height: 18px;
      pointer-events: none;
    }
    .chevron {
      inset-inline-start: auto;
      inset-inline-end: 8px;
      width: 16px;
      height: 16px;
    }
    select {
      appearance: none;
      min-height: var(--tap);
      padding-block: 0;
      padding-inline: 34px 28px;
      border: 1px solid var(--c-border);
      border-radius: var(--r-md);
      background: var(--c-surface);
      color: var(--c-text);
      font-size: var(--fs-small);
      font-weight: 500;
      cursor: pointer;
      transition: border-color var(--dur) ease;
    }
    select:hover {
      border-color: var(--c-border-strong);
    }
  `,
})
export class LanguageSelector {
  protected readonly service = inject(LangueService);
  protected readonly langues = LANGUES;

  protected choisir(event: Event) {
    this.service.choisir((event.target as HTMLSelectElement).value as Langue);
  }
}
