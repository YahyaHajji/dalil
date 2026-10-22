import { Component, inject, signal } from '@angular/core';
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

  // Historique envoyé au backend à chaque message
  private historique: { role: 'user' | 'assistant'; content: string }[] = [];

  async envoyer() {
    const message = this.texte().trim();
    if (!message || this.envoiEnCours()) return;

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
}
