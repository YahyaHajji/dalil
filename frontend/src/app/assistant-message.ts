import { Component, computed, inject, input, signal } from '@angular/core';
import { BrandLogo } from './brand-logo';
import { DalilReponse } from './dalil.model';
import { LANGUES, TEXTES, langueReponse } from './i18n';
import { LangueService } from './preferences';

// Prix à mettre en évidence : « 500 DH », « 75 DH », « 500 درهم »
const PRIX = /(\d+(?:[.,]\d+)?\s?(?:DH|Dh|dh|درهم))/;

@Component({
  selector: 'app-assistant-message',
  imports: [BrandLogo],
  templateUrl: './assistant-message.html',
  styleUrl: './assistant-message.css',
})
export class AssistantMessage {
  protected readonly ui = inject(LangueService);
  readonly data = input.required<DalilReponse>();

  // Les titres des sections suivent la langue de la réponse
  protected readonly code = computed(() =>
    langueReponse(this.data().langue, this.data().reponse, this.ui.langue())
  );
  protected readonly t = computed(() => TEXTES[this.code()]);
  protected readonly lang = computed(() => LANGUES.find((l) => l.code === this.code())!.lang);
  protected readonly dir = computed(() => (this.code() === 'ar' ? 'rtl' : 'ltr'));
  protected readonly uiLang = computed(() => LANGUES.find((l) => l.code === this.ui.langue())!.lang);

  protected readonly copie = signal(false);

  // Découpe un texte pour afficher les prix en évidence
  protected segments(texte: string) {
    return texte.split(PRIX).filter(Boolean).map((t) => ({ texte: t, prix: PRIX.test(t) }));
  }

  // Affiche la question seulement si elle n'est pas déjà dans la réponse (sans espaces ni casse)
  protected readonly afficherQuestion = computed(() => {
    const d = this.data();
    if (!d.question_de_clarification) return false;
    const normaliser = (t: string) => t.replace(/\s+/g, '').toLowerCase();
    return !normaliser(d.reponse).includes(normaliser(d.question_de_clarification));
  });

  protected domaine(lien: string) {
    try {
      return new URL(lien).hostname.replace(/^www\./, '');
    } catch {
      return lien;
    }
  }

  // Texte brut de la réponse, pour le presse-papiers
  private texteBrut() {
    const d = this.data();
    const t = this.t();
    const parties = [d.reponse];
    if (this.afficherQuestion()) parties.push(d.question_de_clarification!);
    if (d.documents?.length) parties.push(`${t.documents}\n${d.documents.map((x) => `- ${x}`).join('\n')}`);
    if (d.etapes?.length) parties.push(`${t.etapes}\n${d.etapes.map((x, i) => `${i + 1}. ${x}`).join('\n')}`);
    if (d.lien_officiel) parties.push(`${t.lienOfficiel} : ${d.lien_officiel}`);
    if (d.a_verifier?.length) parties.push(`${t.aVerifier}\n${d.a_verifier.map((x) => `- ${x}`).join('\n')}`);
    return parties.join('\n\n');
  }

  protected async copier() {
    const texte = this.texteBrut();
    try {
      await navigator.clipboard.writeText(texte);
    } catch {
      // Repli si l'API du presse-papiers n'est pas disponible (HTTP, ancien navigateur)
      const zone = document.createElement('textarea');
      zone.value = texte;
      zone.style.position = 'fixed';
      zone.style.opacity = '0';
      document.body.appendChild(zone);
      zone.select();
      document.execCommand('copy');
      zone.remove();
    }
    this.copie.set(true);
    setTimeout(() => this.copie.set(false), 2000);
  }
}
