import { Component, inject } from '@angular/core';
import { BrandLogo } from './brand-logo';
import { LanguageSelector } from './language-selector';
import { LangueService } from './preferences';
import { ThemeToggle } from './theme-toggle';

@Component({
  selector: 'app-header',
  imports: [BrandLogo, LanguageSelector, ThemeToggle],
  template: `
    <header class="entete">
      <div class="marque">
        <app-brand-logo [taille]="34" />
        <div class="textes">
          <p class="nom"><span lang="fr" dir="ltr">Dalil</span> <span class="nom-ar" lang="ar">دليل</span></p>
          <p class="slogan">{{ langue.t().slogan }}</p>
        </div>
      </div>
      <div class="actions">
        <app-language-selector />
        <app-theme-toggle />
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      flex: none;
      background: color-mix(in srgb, var(--c-bg) 88%, transparent);
      border-bottom: 1px solid var(--c-border);
      backdrop-filter: saturate(1.4) blur(8px);
    }
    .entete {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      max-width: calc(var(--content-max) + 2 * var(--s-6));
      min-height: var(--header-h);
      margin-inline: auto;
      padding-inline: var(--s-6);
    }
    .marque {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      min-width: 0;
    }
    .textes {
      min-width: 0;
    }
    p {
      margin: 0;
    }
    .nom {
      font-size: 1.125rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }
    .nom-ar {
      font-family: var(--font-arabic);
      font-weight: 500;
      color: var(--c-primary);
      margin-inline-start: 2px;
    }
    .slogan {
      font-size: var(--fs-xs);
      color: var(--c-text-2);
      line-height: 1.35;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      flex: none;
    }
    @media (max-width: 767px) {
      .entete {
        padding-inline: var(--s-3);
      }
      .slogan {
        display: none;
      }
    }
  `,
})
export class AppHeader {
  protected readonly langue = inject(LangueService);
}
