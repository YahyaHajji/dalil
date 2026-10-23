import { Component, inject, input, model, output } from '@angular/core';
import { LangueService } from './preferences';

// Formulaire de la fiche Word ; le téléchargement reste géré par App
@Component({
  selector: 'app-fiche-form',
  template: `
    <form class="fiche" (submit)="$event.preventDefault(); telecharger.emit()" aria-labelledby="fiche-titre">
      <div class="entete">
        <span class="badge" aria-hidden="true">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>
        </span>
        <div>
          <h2 id="fiche-titre">{{ t().ficheTitre }}</h2>
          <p class="aide" id="fiche-aide">{{ disponible() ? t().ficheAide : t().ficheIndispo }}</p>
        </div>
      </div>
      <div class="champs">
        <label class="field">
          {{ t().nomComplet }}
          <input name="nomComplet" autocomplete="off" dir="auto" maxlength="100" [value]="nom()"
            (input)="nom.set($any($event.target).value)" [attr.aria-invalid]="!!erreur() && !nom().trim()" />
        </label>
        <label class="field">
          {{ t().ville }}
          <input name="ville" autocomplete="off" dir="auto" maxlength="100" [value]="ville()"
            (input)="ville.set($any($event.target).value)" [attr.aria-invalid]="!!erreur() && !ville().trim()" />
        </label>
        <button type="submit" class="btn-primary" [disabled]="!disponible() || enCours()" aria-describedby="fiche-aide">
          @if (enCours()) {
            <span class="spinner" aria-hidden="true"></span>
            {{ t().telechargement }}
          } @else {
            {{ t().telecharger }}
          }
        </button>
      </div>
      @if (erreur()) {
        <p class="erreur" role="alert">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.5" /></svg>
          {{ erreur() }}
        </p>
      }
    </form>
  `,
  styles: `
    .fiche {
      padding: var(--s-4) var(--s-6) var(--s-6);
      background: var(--c-surface);
      border: 1px dashed var(--c-border-strong);
      border-radius: var(--r-lg);
    }
    .entete {
      display: flex;
      gap: var(--s-3);
      align-items: flex-start;
    }
    .badge {
      display: grid;
      place-items: center;
      flex: none;
      width: 36px;
      height: 36px;
      border-radius: var(--r-md);
      background: var(--c-primary-soft);
      color: var(--c-primary);
    }
    h2 {
      margin: 0;
      font-size: var(--fs-title);
      font-weight: 650;
      line-height: 1.4;
    }
    .aide {
      margin: 2px 0 0;
      font-size: var(--fs-small);
      color: var(--c-text-2);
    }
    .champs {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--s-3);
      margin-top: var(--s-4);
    }
    .field {
      flex: 1 1 180px;
      min-width: 0;
    }
    .btn-primary {
      flex: 0 1 auto;
    }
    .erreur {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin: var(--s-3) 0 0;
      font-size: var(--fs-small);
      font-weight: 500;
      color: var(--c-danger);
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-inline-end-color: transparent;
      border-radius: 50%;
      animation: tourne 0.8s linear infinite;
    }
    @keyframes tourne {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 767px) {
      .fiche {
        padding: var(--s-4);
      }
      .btn-primary {
        flex-basis: 100%;
      }
    }
  `,
})
export class FicheForm {
  protected readonly t = inject(LangueService).t;
  readonly nom = model('');
  readonly ville = model('');
  readonly disponible = input(false);
  readonly enCours = input(false);
  readonly erreur = input('');
  readonly telecharger = output<void>();
}
