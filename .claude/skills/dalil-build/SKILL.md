---
name: "dalil-build"
description: "Construire l'application Dalil (Angular + Express + API Claude) par petites étapes testées pendant le Build Day. À utiliser pour construire, continuer ou corriger Dalil."
---

# Dalil : plan de construction

Dalil (دليل) est un assistant web qui explique les démarches administratives marocaines en darija, français, arabe ou anglais, et génère une fiche Word personnalisée.

## Fichiers du projet (déjà prêts)
- `demarches.json` : la base des 5 démarches (passeport, CNIE, acte de naissance, CNSS, certificat de résidence). Source de vérité.
- `system-prompt.md` : le prompt système. N'envoie à l'API que le texte situé sous la première ligne `---`.
- `fiche-word-modele.md` : le modèle de la fiche Word.

Ne modifie pas ces trois fichiers sans demande explicite.

## Stack
- `frontend/` : Angular (CLI 21, Node 22, Windows).
- `backend/` : Node + Express, SDK `@anthropic-ai/sdk`, bibliothèque `docx`.
- Modèle : `claude-opus-5-5`.

## Règles
1. Une étape à la fois. Après chaque étape : lance l'application, teste, montre le résultat, fais un commit Git, puis arrête-toi et attends la suite.
2. La clé API est seulement dans `backend/.env` (`ANTHROPIC_API_KEY`). Jamais dans Angular, jamais dans Git (ajoute `.env` au `.gitignore`).
3. Change le minimum. Pas de base de données, pas de connexion utilisateur, pas de fonction non demandée.
4. Ne jamais inventer de données administratives : tout vient de `demarches.json`.
5. Le backend garde l'historique de la conversation (sinon « tjdid » n'est pas compris après la question sur la CNIE).
6. Le backend extrait le JSON entre le premier `{` et le dernier `}` de la réponse, avec try/catch, et renvoie une erreur claire si le JSON est invalide.
7. Le frontend affiche toujours cet avertissement fixe : « Informations indicatives. Vérifie toujours sur le site officiel. »
8. Ne demande jamais de CIN, de mot de passe ou de carte bancaire dans le chat.

## Étapes

### Étape 1 : le chat
- Backend : route `POST /chat`. Elle lit le message et l'historique, envoie à `claude-opus-5-5` le prompt système (texte sous la première ligne `---`) suivi de `<base_demarches>` contenant `demarches.json`, puis renvoie le JSON.
- Frontend : page « Dalil » avec zone de messages, champ de texte et bouton envoyer. Configure CORS ou un proxy.
- Terminé quand : « salam » donne une réponse affichée.

### Étape 2 : l'affichage
- Affiche en cartes : `reponse`, « Documents à préparer », « Étapes » (liste numérotée), lien officiel cliquable, « À vérifier » seulement si la liste n'est pas vide.
- Si `langue` = `ar`, affiche le texte de droite à gauche.
- Terminé quand : « bghit nbdel passeport » affiche 5 documents, 4 étapes et le prix de 500 DH.

### Étape 3 : la fiche Word
- Lis `fiche-word-modele.md`. Route `POST /fiche` avec `{ nom_complet, ville, reponse }`, génération avec `docx`, téléchargement en DOCX.
- Angular : deux champs (nom complet, ville) et un bouton « Télécharger ma fiche », grisé si `peut_generer_fiche` est faux ou si `documents` est vide.
- Terminé quand : le DOCX du passeport s'ouvre et contient le nom, la ville, les cases à cocher et l'avertissement.

### Étape 4 : les finitions
- Indicateur de chargement, message d'erreur clair, phrase d'accueil, titre « Dalil ».
- Terminé quand : une erreur d'API ou un JSON invalide ne casse pas la page.

### Étape 5 : la démo
- Utilise le skill `dalil-test-checklist` et corrige seulement ce qui échoue.

## Si le temps manque
Supprime d'abord la fiche Word (étape 3), puis les finitions. Garde toujours le chat et l'affichage : c'est le cœur de la démo.

## Petits bugs
Corrige seulement le point demandé, sans reformater ni changer le reste.