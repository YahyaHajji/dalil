import { Component, ElementRef, afterRenderEffect, inject, input, model, output, viewChild } from '@angular/core';
import { LangueService } from './preferences';

const HAUTEUR_MAX = 180;

@Component({
  selector: 'app-message-composer',
  template: `
    <form class="saisie" (submit)="soumettre($event)">
      <label for="question" class="sr-only">{{ langue.t().taQuestion }}</label>
      <textarea
        #champ
        id="question"
        name="question"
        rows="1"
        dir="auto"
        maxlength="2000"
        autocomplete="off"
        enterkeyhint="send"
        aria-describedby="aide-saisie"
        [placeholder]="langue.t().placeholder"
        [value]="texte()"
        (input)="texte.set(champ.value)"
        (keydown)="clavier($event)"
      ></textarea>
      <span id="aide-saisie" class="sr-only">{{ langue.t().aideSaisie }}</span>
      <button
        type="submit"
        class="envoyer"
        [disabled]="occupe() || !texte().trim()"
        [attr.aria-label]="occupe() ? langue.t().envoiEnCours : langue.t().envoyer"
        [title]="langue.t().envoyer"
      >
        @if (occupe()) {
          <span class="spinner" aria-hidden="true"></span>
        } @else {
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
        }
      </button>
    </form>
  `,
  styles: `
    .saisie {
      display: flex;
      align-items: flex-end;
      gap: var(--s-2);
      padding: var(--s-2);
      padding-inline-start: var(--s-4);
      background: var(--c-surface);
      border: 1px solid var(--c-border-strong);
      border-radius: var(--r-xl);
      box-shadow: var(--shadow-md);
      transition:
        border-color var(--dur) ease,
        box-shadow var(--dur) ease;
    }
    .saisie:focus-within {
      border-color: var(--c-primary);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--c-primary) 18%, transparent),
        var(--shadow-md);
    }
    textarea {
      flex: 1;
      min-width: 0;
      min-height: var(--tap);
      max-height: 180px;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: var(--fs-body);
      line-height: 1.5;
      resize: none;
      overflow-y: auto;
      unicode-bidi: plaintext;
    }
    textarea:focus-visible {
      outline: none;
    }
    textarea::placeholder {
      color: var(--c-text-2);
      opacity: 1;
    }
    .envoyer {
      display: grid;
      place-items: center;
      flex: none;
      width: var(--tap);
      height: var(--tap);
      border: none;
      border-radius: var(--r-md);
      background: var(--c-primary);
      color: var(--c-on-primary);
      transition:
        background-color var(--dur) ease,
        opacity var(--dur) ease;
    }
    .envoyer:hover:not(:disabled) {
      background: var(--c-primary-strong);
    }
    .envoyer:disabled {
      opacity: 0.4;
    }
    .envoyer .icon {
      stroke-width: 2.2;
    }
    .spinner {
      width: 18px;
      height: 18px;
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
  `,
})
export class MessageComposer {
  protected readonly langue = inject(LangueService);
  readonly texte = model('');
  readonly occupe = input(false);
  readonly envoyer = output<void>();

  private readonly champ = viewChild.required<ElementRef<HTMLTextAreaElement>>('champ');

  constructor() {
    // Le champ grandit avec le texte (et revient à une ligne après l'envoi)
    afterRenderEffect(() => {
      this.texte();
      const champ = this.champ().nativeElement;
      champ.style.height = 'auto';
      champ.style.height = `${Math.min(champ.scrollHeight, HAUTEUR_MAX)}px`;
    });
  }

  focus() {
    this.champ().nativeElement.focus();
  }

  protected soumettre(event: Event) {
    event.preventDefault();
    if (!this.occupe() && this.texte().trim()) this.envoyer.emit();
  }

  // Entrée envoie, Maj + Entrée va à la ligne (sauf pendant une saisie IME)
  protected clavier(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      this.soumettre(event);
    }
  }
}
