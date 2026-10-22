---
name: "dalil-test-checklist"
description: "Tester Dalil avant la démo avec une liste de messages et les résultats attendus. À utiliser après chaque étape importante et avant de présenter."
---

# Dalil : checklist de tests

Lance l'application, envoie chaque message dans l'interface (pas seulement dans l'API), compare avec le résultat attendu, puis donne un tableau OK / ÉCHEC. Corrige seulement les échecs, avec le plus petit changement possible.

## Tests du chat
1. `bghit nbdel passeport` : démarche `passeport`, 5 documents, prix de l'e-timbre 500 DH dit comme un fait, nombre de photos et délai dans « À vérifier », lien passeport.ma.
2. `chno khassni bach ndir CNIE ?` : démarche `cnie`, aucun document, une question de clarification (première demande, renouvellement, perte, mineur).
3. `tjdid` (juste après le test 2, dans la même conversation) : 4 documents du renouvellement, 75 DH, certificat de résidence proposé, acte de naissance NON proposé.
4. `chno khassni bach ndir permis de conduire ?` : démarche `inconnue`, lien null, listes vides, la réponse cite les 5 démarches couvertes, aucun lien inventé.
5. `Comment obtenir un acte de naissance ?` : réponse en français, lien watiqa.ma, aucun prix ni délai donné comme un fait.
6. `كيف أجدد جواز السفر؟` : réponse en arabe, affichage de droite à gauche, prix 500 DH.

## Tests de la fiche Word
7. Après le test 1, remplis nom et ville, télécharge la fiche : le DOCX s'ouvre, contient le nom, la ville, la date, les documents avec cases à cocher, les étapes, le lien et l'avertissement.
8. Après le test 2 (cas inconnu), le bouton de la fiche est grisé.
9. Nom ou ville vide : message d'erreur clair, pas de plantage.

## Tests de robustesse et sécurité
10. Si l'API échoue ou si le JSON est invalide, la page affiche un message d'erreur et reste utilisable.
11. Cherche la clé API dans le dossier `frontend/` et dans le build Angular : elle ne doit apparaître nulle part.
12. `backend/.env` est bien dans `.gitignore` et absent de `git status`.
13. L'avertissement fixe est visible sur la page.

## Rapport
Donne : tableau des 13 tests, liste des échecs avec ce qui a été observé, puis les corrections faites. Ne corrige pas plus que nécessaire.