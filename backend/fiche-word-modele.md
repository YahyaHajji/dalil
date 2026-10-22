# Modèle de la fiche Word : Dalil

Objectif : après la réponse du chat, l'utilisateur clique sur « Télécharger ma fiche » et reçoit un fichier DOCX propre, prêt à imprimer.

La fiche n'est PAS une demande officielle. C'est une checklist personnalisée.

## Données d'entrée

Le backend reçoit :
- `nom_complet` et `ville` : écrits par l'utilisateur dans deux champs Angular (jamais de CIN).
- `reponse` : le JSON renvoyé par Claude (demarche_id, reponse, documents, etapes, lien_officiel, a_verifier, avertissement).

La fiche est générée seulement si `peut_generer_fiche` est `true` ET si `documents` n'est pas vide.
Exemple : pour la CNIE sans cas connu, `documents` est vide, donc pas de fiche. Le bouton reste grisé.

## Structure de la page (A4, une page si possible)

1. **En-tête**
   - Titre : « Dalil | Fiche démarche »
   - Sous-titre : le nom de la démarche (ex : « Passeport biométrique »)
   - Ligne : « Préparée pour : {nom_complet}, {ville} · Date : {date du jour} »

2. **Résumé** : la valeur de `reponse`, en 1 ou 2 phrases.

3. **Documents à préparer** : liste avec cases à cocher (☐) :
   ☐ {documents[0]}
   ☐ {documents[1]}
   ...

4. **Étapes** : liste numérotée (1, 2, 3...) avec `etapes`.

5. **Lien officiel** : `lien_officiel`, en lien cliquable.

6. **À vérifier avant d'y aller** : liste à puces avec `a_verifier` (si la liste est vide, ne pas afficher la section).

7. **Pied de page** : « Informations indicatives. Vérifie toujours sur le site officiel. Fiche générée par Dalil. »

## Style (simple, pour que ça reste rapide)

- Police : Calibri ou Arial, 11 pt. Titre : 20 pt, gras.
- Une seule couleur d'accent (par exemple un vert foncé) pour les titres de sections.
- Marges : 2 cm. Pas d'image obligatoire.
- La fiche est en français. Option si tu as le temps : mêmes titres dans la langue de l'utilisateur.

## Exemple de rendu (passeport)

```
Dalil | Fiche démarche
Passeport biométrique
Préparée pour : Yahya, Casablanca · Date : 22/10/2026

Résumé
Pour renouveler ton passeport, prépare ces documents. L'e-timbre coûte 500 DH.

Documents à préparer
☐ Formulaire de demande de passeport biométrique, rempli, daté et signé
☐ Photocopie de la CNIE en cours de validité
☐ Photo d'identité conforme
☐ Code e-timbre à 16 chiffres (500 DH)
☐ L'ancien passeport

Étapes
1. Acheter l'e-timbre (500 DH) sur passeport.ma ou tax.gov.ma
2. Remplir le formulaire sur passeport.ma, puis l'imprimer
3. Rassembler les documents
4. Déposer le dossier à l'annexe administrative ou au caïdat

Lien officiel : https://www.passeport.ma

À vérifier avant d'y aller
• Nombre de photos demandées
• Délai de délivrance

Informations indicatives. Vérifie toujours sur le site officiel. Fiche générée par Dalil.
```

## Pour Claude Code (backend)

- Utilise la bibliothèque npm `docx` pour créer le fichier.
- Route : `POST /fiche` avec `{ nom_complet, ville, reponse }`.
- Réponse : le fichier DOCX en téléchargement (`Content-Disposition: attachment`).
- Valide les entrées : si `nom_complet` ou `ville` est vide, renvoie une erreur claire.
- Teste d'abord avec le JSON du passeport ci-dessus, puis avec la CNIE (cas « renouvellement »).
