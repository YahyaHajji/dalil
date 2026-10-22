// Génère la fiche Word (voir fiche-word-modele.md)
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Footer,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const VERT = '1B5E20';
const CM = 567; // 1 cm en twips

const titreSection = (texte) =>
  new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: texte, bold: true, color: VERT, size: 26 })],
  });

export function genererFiche({ nom_complet, ville, reponse, nomDemarche }) {
  const date = new Date().toLocaleDateString('fr-FR');
  const enfants = [
    // 1. En-tête
    new Paragraph({ children: [new TextRun({ text: 'Dalil | Fiche démarche', bold: true, size: 40 })] }),
    new Paragraph({ children: [new TextRun({ text: nomDemarche, bold: true, color: VERT, size: 28 })] }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun(`Préparée pour : ${nom_complet}, ${ville} · Date : ${date}`)],
    }),

    // 2. Résumé
    titreSection('Résumé'),
    new Paragraph(reponse.reponse),

    // 3. Documents à préparer (cases à cocher)
    titreSection('Documents à préparer'),
    ...reponse.documents.map((doc) => new Paragraph({ children: [new TextRun(`☐ ${doc}`)] })),
  ];

  // 4. Étapes (liste numérotée)
  if (reponse.etapes?.length) {
    enfants.push(
      titreSection('Étapes'),
      ...reponse.etapes.map((etape) => new Paragraph({ text: etape, numbering: { reference: 'etapes', level: 0 } }))
    );
  }

  // 5. Lien officiel (cliquable)
  if (reponse.lien_officiel) {
    enfants.push(
      new Paragraph({
        spacing: { before: 240 },
        children: [
          new TextRun({ text: 'Lien officiel : ', bold: true, color: VERT }),
          new ExternalHyperlink({
            link: reponse.lien_officiel,
            children: [new TextRun({ text: reponse.lien_officiel, style: 'Hyperlink' })],
          }),
        ],
      })
    );
  }

  // 6. À vérifier (seulement si la liste n'est pas vide)
  if (reponse.a_verifier?.length) {
    enfants.push(
      titreSection("À vérifier avant d'y aller"),
      ...reponse.a_verifier.map((point) => new Paragraph({ text: point, bullet: { level: 0 } }))
    );
  }

  const doc = new Document({
    creator: 'Dalil',
    title: `Dalil | ${nomDemarche}`,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    numbering: {
      config: [
        {
          reference: 'etapes',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 360, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 2 * CM, right: 2 * CM, bottom: 2 * CM, left: 2 * CM } } },
        footers: {
          // 7. Pied de page
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Informations indicatives. Vérifie toujours sur le site officiel. Fiche générée par Dalil.',
                    italics: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: enfants,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
