import { Component, inject, input, output } from '@angular/core';
import { BrandLogo } from './brand-logo';
import { LangueService } from './preferences';

@Component({
  selector: 'app-welcome-screen',
  imports: [BrandLogo],
  template: `
    <section class="accueil" aria-labelledby="accueil-titre">
      <!-- Motif géométrique discret inspiré du zellige -->
      <svg class="motif" aria-hidden="true" focusable="false">
        <defs>
          <pattern id="zellige" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" stroke-width="1">
              <rect x="16" y="16" width="24" height="24" />
              <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
              <path d="M0 28h11M45 28h11M28 0v11M28 45v11" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige)" />
      </svg>

      <div class="tuile"><app-brand-logo [taille]="44" /></div>
      <h2 id="accueil-titre">{{ langue.t().bienvenue }}</h2>
      <p class="intro">{{ langue.t().intro }}</p>

      <h3 class="exemples-titre">{{ langue.t().exemples }}</h3>
      <ul class="exemples">
        @for (exemple of exemples(); track exemple) {
          <li>
            <button type="button" class="exemple" dir="auto" (click)="choisir.emit(exemple)" [disabled]="desactive()">
              {{ exemple }}
            </button>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .accueil {
      position: relative;
      isolation: isolate;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--s-6) 0;
    }
    .motif {
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      color: var(--c-motif);
      opacity: 0.09;
      mask-image: radial-gradient(ellipse 45% 40% at 50% 20%, #000 0%, transparent 75%);
    }
    .tuile {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      margin-bottom: var(--s-6);
      border-radius: var(--r-xl);
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      box-shadow: var(--shadow-md);
    }
    h2 {
      margin: 0;
      font-size: var(--fs-display);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      text-wrap: balance;
    }
    .intro {
      max-width: 34em;
      margin: var(--s-3) 0 0;
      font-size: 1.0625rem;
      color: var(--c-text-2);
      text-wrap: balance;
    }
    .exemples-titre {
      margin: var(--s-8) 0 var(--s-3);
      font-size: var(--fs-xs);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--c-text-2);
    }
    .exemples {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--s-2);
      max-width: 640px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .exemple {
      min-height: var(--tap);
      padding: var(--s-2) var(--s-4);
      border: 1px solid var(--c-border);
      border-radius: var(--r-full);
      background: var(--c-surface);
      color: var(--c-text);
      font-size: 0.9375rem;
      line-height: 1.35;
      box-shadow: var(--shadow-sm);
      transition:
        border-color var(--dur) ease,
        background-color var(--dur) ease,
        color var(--dur) ease;
    }
    .exemple:hover:not(:disabled) {
      border-color: var(--c-primary);
      background: var(--c-primary-soft);
      color: var(--c-primary-strong);
    }
    .exemple:disabled {
      opacity: 0.5;
    }
    @media (max-width: 767px) {
      .accueil {
        padding-top: var(--s-6);
      }
      .tuile {
        width: 60px;
        height: 60px;
        margin-bottom: var(--s-4);
      }
      .intro {
        font-size: var(--fs-body);
      }
      .exemples-titre {
        margin-top: var(--s-6);
      }
    }
  `,
})
export class WelcomeScreen {
  protected readonly langue = inject(LangueService);
  readonly exemples = input.required<string[]>();
  readonly desactive = input(false);
  readonly choisir = output<string>();
}
