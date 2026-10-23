// Contrat de sortie du modèle (voir system-prompt.md)
export interface DalilReponse {
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

export interface Message {
  role: 'user' | 'assistant' | 'erreur';
  texte: string;
  data?: DalilReponse;
}
