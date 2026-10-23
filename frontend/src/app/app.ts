import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppHeader } from './app-header';
import { AssistantMessage } from './assistant-message';
import { DalilReponse, Message } from './dalil.model';
import { FicheForm } from './fiche-form';
import { MessageComposer } from './message-composer';
import { LangueService } from './preferences';
import { WelcomeScreen } from './welcome-screen';

@Component({
  selector: 'app-root',
  imports: [AppHeader, AssistantMessage, FicheForm, MessageComposer, WelcomeScreen],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);
  protected readonly langue = inject(LangueService);

  protected readonly messages = signal<Message[]>([]);
  protected readonly texte = signal('');
  protected readonly envoiEnCours = signal(false);

  // Fiche Word : basée sur la dernière réponse de Dalil
  protected readonly nomComplet = signal('');
  protected readonly ville = signal('');
  protected readonly ficheErreur = signal('');
  protected readonly telechargementEnCours = signal(false);
  protected readonly derniereReponse = computed(
    () => [...this.messages()].reverse().find((m) => m.data)?.data
  );
  protected readonly peutGenererFiche = computed(() => {
    const d = this.derniereReponse();
    return !!d?.peut_generer_fiche && !!d.documents?.length;
  });
  protected readonly occupe = computed(() => this.envoiEnCours() || this.telechargementEnCours());

  // Historique envoyé au backend à chaque message
  private historique: { role: 'user' | 'assistant'; content: string }[] = [];

  protected readonly exemples = [
    'bghit nbdel passeport',
    'chno khassni bach ndir CNIE ?',
    'Comment obtenir un acte de naissance ?',
    'كيف أجدد جواز السفر؟',
  ];

  // Défilement automatique vers le dernier message
  private readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
  private readonly composer = viewChild.required(MessageComposer);

  constructor() {
    effect(() => {
      this.messages();
      this.envoiEnCours();
      setTimeout(() => this.defiler());
    });
  }

  private defiler() {
    const zone = this.zone()?.nativeElement;
    if (!zone) return;
    const elements = zone.querySelectorAll('[data-defil]');
    const dernier = elements[elements.length - 1];
    // Une réponse de Dalil s'affiche depuis son début ; le reste défile jusqu'en bas
    if (dernier?.matches('app-assistant-message')) {
      dernier.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      zone.scrollTo({ top: zone.scrollHeight, behavior: 'smooth' });
    }
  }

  protected envoyerExemple(exemple: string) {
    this.texte.set(exemple);
    this.envoyer();
  }

  envoyer() {
    const message = this.texte().trim();
    if (!message || this.occupe()) return;

    this.messages.update((m) => [...m, { role: 'user', texte: message }]);
    this.texte.set('');
    this.demander(message);
  }

  // Renvoie la dernière question après une erreur
  protected reessayer() {
    const messages = this.messages();
    const question = [...messages].reverse().find((m) => m.role === 'user');
    if (!question || messages.at(-1)?.role !== 'erreur' || this.occupe()) return;

    this.messages.set(messages.slice(0, -1));
    this.demander(question.texte);
  }

  private async demander(message: string) {
    this.envoiEnCours.set(true);
    try {
      const data = await firstValueFrom(
        this.http.post<DalilReponse>('/api/chat', { message, historique: this.historique })
      );
      this.historique.push(
        { role: 'user', content: message },
        { role: 'assistant', content: JSON.stringify(data) }
      );
      this.messages.update((m) => [...m, { role: 'assistant', texte: data.reponse, data }]);
    } catch (err) {
      const erreur =
        (err instanceof HttpErrorResponse && err.error?.erreur) || this.langue.t().erreurServeur;
      this.messages.update((m) => [...m, { role: 'erreur', texte: erreur }]);
    } finally {
      this.envoiEnCours.set(false);
      // Sur mobile, on n'ouvre pas le clavier automatiquement
      if (matchMedia('(pointer: fine)').matches) this.composer().focus();
    }
  }

  async telechargerFiche() {
    const reponse = this.derniereReponse();
    if (!reponse || !this.peutGenererFiche() || this.telechargementEnCours()) return;

    this.ficheErreur.set('');
    if (!this.nomComplet().trim() || !this.ville().trim()) {
      this.ficheErreur.set(this.langue.t().ficheChamps);
      return;
    }

    this.telechargementEnCours.set(true);
    try {
      const fichier = await firstValueFrom(
        this.http.post('/api/fiche', { nom_complet: this.nomComplet(), ville: this.ville(), reponse },
          { responseType: 'blob' })
      );
      const url = URL.createObjectURL(fichier);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `fiche-dalil-${reponse.demarche_id}.docx`;
      lien.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // L'erreur du backend arrive sous forme de Blob (JSON)
      let erreur = this.langue.t().ficheErreur;
      if (err instanceof HttpErrorResponse && err.error instanceof Blob) {
        try {
          erreur = JSON.parse(await err.error.text()).erreur || erreur;
        } catch {}
      }
      this.ficheErreur.set(erreur);
    } finally {
      this.telechargementEnCours.set(false);
    }
  }
}
