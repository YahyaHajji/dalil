import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { LANGUES, Langue, TEXTES } from './i18n';

export type Theme = 'light' | 'dark';

const CLE_LANGUE = 'dalil-langue';
const CLE_THEME = 'dalil-theme';

function lire(cle: string) {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

function ecrire(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur);
  } catch {}
}

// Langue de l'interface (n'influence pas l'API ni la langue des réponses)
@Injectable({ providedIn: 'root' })
export class LangueService {
  private readonly doc = inject(DOCUMENT);

  readonly langue = signal<Langue>(
    LANGUES.some((l) => l.code === lire(CLE_LANGUE)) ? (lire(CLE_LANGUE) as Langue) : 'fr'
  );
  readonly t = computed(() => TEXTES[this.langue()]);
  readonly rtl = computed(() => this.langue() === 'ar');

  constructor() {
    effect(() => {
      const code = this.langue();
      const html = this.doc.documentElement;
      html.lang = LANGUES.find((l) => l.code === code)!.lang;
      html.dir = this.rtl() ? 'rtl' : 'ltr';
    });
  }

  choisir(langue: Langue) {
    this.langue.set(langue);
    ecrire(CLE_LANGUE, langue);
  }
}

// Thème clair / sombre : préférence enregistrée, sinon celle du système
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly systeme = this.doc.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private choisi = lire(CLE_THEME);

  readonly theme = signal<Theme>(
    this.choisi === 'light' || this.choisi === 'dark'
      ? this.choisi
      : this.systeme?.matches
        ? 'dark'
        : 'light'
  );

  constructor() {
    // Suit le système tant que l'utilisateur n'a rien choisi
    this.systeme?.addEventListener('change', (e) => {
      if (!this.choisi) this.theme.set(e.matches ? 'dark' : 'light');
    });
    effect(() => this.doc.documentElement.setAttribute('data-theme', this.theme()));
  }

  basculer() {
    const theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.choisi = theme;
    this.theme.set(theme);
    ecrire(CLE_THEME, theme);
  }
}
