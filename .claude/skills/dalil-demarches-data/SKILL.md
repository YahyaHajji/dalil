---
name: "dalil-demarches-data"
description: "Ajouter ou vérifier une démarche dans demarches.json pour Dalil, et garder une darija simple et correcte dans le prompt. À utiliser pour modifier la base ou le prompt."
---

# Dalil : données et darija

`demarches.json` est la source de vérité. Le modèle ne doit jamais inventer une information qui n'y est pas.

## Structure d'une démarche
- `id` : court, sans espace (ex : `passeport`).
- `nom_fr` : nom clair.
- `mots_cles` : darija en lettres latines, français, anglais ET arabe.
- `documents` : liste. Si la démarche a plusieurs situations, utilise `cas` (chaque cas a `nom` et `documents`) et laisse `documents` vide.
- `etapes` : liste ordonnée.
- `lien_officiel` : site officiel.
- `a_verifier` : tout ce qui n'est pas confirmé (prix, délai, nombre de photos...).
- `demarches_liees` : ids des démarches nécessaires (ex : certificat de résidence pour la CNIE).

## Ajouter une démarche
1. Cherche d'abord la source officielle (portail de l'administration concernée). Un blog ou un article de presse ne suffit pas pour un prix ou une liste de documents.
2. Écris seulement ce que la source confirme. Le reste va dans `a_verifier`.
3. Ne mets pas de prix ni de délai si tu n'as pas de source récente.
4. Ajoute l'id dans la liste `demarche_id` du fichier `system-prompt.md`, et dans la phrase d'exemple « démarche non couverte ».
5. Vérifie que le JSON est valide, puis lance le skill `dalil-test-checklist`.

## Règles pour la darija (dans le prompt)
- Darija simple + mots français pour les termes administratifs (rendez-vous, dossier, formulaire, e-timbre, caïdat).
- Écris dans la même écriture que l'utilisateur (lettres latines avec 3, 7, 9, ou écriture arabe).
- Formes validées : `3emmer` (remplir), `khod` (prendre), `sir` (aller), `chri` (acheter), `men ba3d` (ensuite), `Khassek tjib ...` (tu dois apporter ...), `S-salahiya dyalha 10 snin` (valable 10 ans), `li 3ndo 12 l3am wla akther` (qui a 12 ans ou plus), `tjdid` (renouveler).
- Si le modèle hésite sur un verbe ou une phrase, il garde le mot français au lieu de l'inventer.
- Attention : `tba3` peut vouloir dire suivre ou imprimer. Écris le verbe en français.
- Toute nouvelle forme de darija doit être validée par Yahya avant d'être ajoutée comme « validée ».

## Contrat de sortie du modèle
Le modèle renvoie un JSON seul avec : `langue`, `demarche_id`, `reponse`, `documents`, `etapes`, `lien_officiel`, `a_verifier`, `question_de_clarification`, `peut_generer_fiche`, `champs_manquants`, `avertissement`. Si `demarche_id` = `inconnue` : `lien_officiel` = null, listes vides, `peut_generer_fiche` = false. Ne change pas ce contrat sans mettre à jour le backend et le frontend.