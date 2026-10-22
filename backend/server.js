import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const dossier = import.meta.dirname;

// Clé API : seulement dans backend/.env
try {
  process.loadEnvFile(path.join(dossier, '.env'));
} catch {
  console.warn('Fichier backend/.env introuvable.');
}

// Prompt système : uniquement le texte sous la première ligne "---"
const lignes = fs.readFileSync(path.join(dossier, 'system-prompt.md'), 'utf8').split(/\r?\n/);
const separateur = lignes.findIndex((l) => l.trim() === '---');
if (separateur === -1) throw new Error('system-prompt.md : ligne "---" introuvable');
const prompt = lignes.slice(separateur + 1).join('\n').trim();

const demarches = fs.readFileSync(path.join(dossier, 'demarches.json'), 'utf8').trim();
JSON.parse(demarches); // échoue au démarrage si la base est invalide

const systeme = `${prompt}\n\n<base_demarches>\n${demarches}\n</base_demarches>`;

const MAX_HISTORIQUE = 20;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || null });

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/chat', async (req, res) => {
  const { message, historique = [] } = req.body ?? {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ erreur: 'Le message est vide.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ erreur: 'Le message est trop long (2000 caractères maximum).' });
  }
  if (!Array.isArray(historique)) {
    return res.status(400).json({ erreur: "L'historique doit être une liste." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ erreur: 'Clé API manquante : ajoute ANTHROPIC_API_KEY dans backend/.env.' });
  }

  // Historique de la conversation (pour comprendre « tjdid » après la question sur la CNIE)
  const messages = historique
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content)
    .slice(-MAX_HISTORIQUE)
    .map((m) => ({ role: m.role, content: m.content }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  messages.push({ role: 'user', content: message.trim() });

  let reponse;
  try {
    reponse = await client.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      system: [{ type: 'text', text: systeme, cache_control: { type: 'ephemeral' } }],
      messages,
    });
  } catch (err) {
    console.error('Erreur API :', err);
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(502).json({ erreur: 'Clé API invalide : vérifie backend/.env.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(503).json({ erreur: 'Trop de demandes. Réessaie dans un moment.' });
    }
    return res.status(502).json({ erreur: "Le service de l'assistant ne répond pas. Réessaie plus tard." });
  }

  if (reponse.stop_reason === 'refusal') {
    return res.status(502).json({ erreur: "L'assistant n'a pas pu répondre à cette demande." });
  }

  const texte = reponse.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // JSON entre le premier "{" et le dernier "}"
  const debut = texte.indexOf('{');
  const fin = texte.lastIndexOf('}');
  try {
    if (debut === -1 || fin <= debut) throw new Error('aucun objet JSON');
    const data = JSON.parse(texte.slice(debut, fin + 1));
    if (typeof data?.reponse !== 'string') throw new Error('champ "reponse" manquant');
    return res.json(data);
  } catch (err) {
    console.error('JSON invalide :', err.message, '\n', texte);
    return res.status(502).json({ erreur: "La réponse de l'assistant est invalide. Réessaie." });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Backend Dalil : http://localhost:${port}`));
