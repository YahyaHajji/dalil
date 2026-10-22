import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Contrat de sortie du modèle (voir system-prompt.md)
interface DalilReponse {
  langue: string;
  demarche_id: string;
  reponse: string;
  documents?: string[];
  etapes?: string[];
  lien_officiel: string | null;
  a_verifier?: string[];
  question_de_clarification: string | null;
  peut_generer_fiche: boolean;
  champs_manquants: string[];
  avertissement: string;
}

interface Message {
  role: 'user' | 'assistant' | 'erreur';
  texte: string;
  data?: DalilReponse;
}

// Prix à mettre en évidence : « 500 DH », « 75 DH », « 500 درهم »
const PRIX = /(\d+(?:[.,]\d+)?\s?(?:DH|Dh|dh|درهم))/;

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);

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

  constructor() {
    effect(() => {
      this.messages();
      this.envoiEnCours();
      this.telechargementEnCours();
      setTimeout(() => this.defiler());
    });
  }

  private defiler() {
    const zone = this.zone()?.nativeElement;
    if (!zone) return;
    const elements = zone.querySelectorAll('.fil > .message, .fil > .reponse, .fil > .chargement');
    const dernier = elements[elements.length - 1];
    // Une réponse de Dalil s'affiche depuis son début ; le reste défile jusqu'en bas
    if (dernier?.classList.contains('reponse')) {
      dernier.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      zone.scrollTo({ top: zone.scrollHeight, behavior: 'smooth' });
    }
  }

  protected envoyerExemple(exemple: string) {
    this.texte.set(exemple);
    this.envoyer();
  }

  // Découpe un texte pour afficher les prix en évidence
  protected segments(texte: string) {
    return texte.split(PRIX).filter(Boolean).map((t) => ({ texte: t, prix: PRIX.test(t) }));
  }

  protected domaine(lien: string) {
    try {
      return new URL(lien).hostname.replace(/^www\./, '');
    } catch {
      return lien;
    }
  }

  async envoyer() {
    const message = this.texte().trim();
    if (!message || this.envoiEnCours() || this.telechargementEnCours()) return;

    this.messages.update((m) => [...m, { role: 'user', texte: message }]);
    this.texte.set('');
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
        (err instanceof HttpErrorResponse && err.error?.erreur) || 'Impossible de joindre le serveur.';
      this.messages.update((m) => [...m, { role: 'erreur', texte: erreur }]);
    } finally {
      this.envoiEnCours.set(false);
    }
  }

  async telechargerFiche() {
    const reponse = this.derniereReponse();
    if (!reponse || !this.peutGenererFiche() || this.telechargementEnCours()) return;

    this.ficheErreur.set('');
    if (!this.nomComplet().trim() || !this.ville().trim()) {
      this.ficheErreur.set('Écris ton nom complet et ta ville pour créer la fiche.');
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
      let erreur = 'Impossible de créer la fiche.';
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
