# Clair

**Un peu plus clair, chaque jour.**

Clair est un espace de révision en français pour les étudiants à l’université, adapté à la licence 2. Il rassemble les cours, les TD et les exercices, et propose un assistant pédagogique pour comprendre les notions plutôt que simplement recopier des réponses.

## Fonctionnalités

- Comptes individuels, inscription avec confirmation par e-mail, connexion et récupération de mot de passe.
- Import de PDF, Word `.docx`, TXT, Markdown ou photos JPG, PNG et WebP.
- Bibliothèque privée : matières, recherche, tri, favoris, modification et suppression des documents.
- Résumés structurés : notions essentielles, définitions, exemples et questions de vérification.
- Aide aux TD et exercices : pistes, méthode, correction progressive et vérification du résultat.
- Explications simples et assistant conversationnel, avec ou sans document.
- Historique privé distinct par document et pour les discussions générales.
- Fiches enregistrées automatiquement, formules mathématiques, copie et téléchargement en Markdown.
- Interface responsive, fenêtres accessibles au clavier et exemples clairement identifiés pour les visiteurs.

## Technologies

**TanStack Start**, **React 19**, **TypeScript** et **Vite** constituent l’application. Les composants et styles sont personnalisés, avec **Lucide**, **React Markdown** et **KaTeX**, ainsi que les polices DM Sans et Manrope.

**Netlify Identity** gère les comptes via `@netlify/identity`. **Netlify Database**, avec **Drizzle ORM** et son adaptateur natif, conserve les données structurées. **Netlify Blobs** stocke les fichiers. **Gemini 2.5 Flash**, via `@google/genai` et **Netlify AI Gateway**, fournit les fonctions pédagogiques. Les clés ne sont jamais envoyées au navigateur.

## Démarrage local

Pré-requis : Node.js 22, pnpm et Netlify CLI. Liez le projet à votre site Netlify pour utiliser les services de la plateforme.

```bash
pnpm install
netlify dev --port 8889
```

Le serveur Vite fonctionne sur le port 3000 derrière le proxy Netlify sur le port 8889. Vérifiez également les flux de connexion, de confirmation d’e-mail et de récupération sur un déploiement Netlify : les cookies d’Identity dépendent de l’environnement déployé.

Identity a été activé pour ce projet. Les inscriptions nécessitent une confirmation par e-mail par défaut ; les réglages sont disponibles dans la configuration Identity du site.

## Base de données et déploiement

`db/schema.ts` définit les tables. La migration initiale a été générée dans `netlify/database/migrations/`. Netlify provisionne la base et applique les migrations au déploiement. Aucun serveur externe ni fichier local de données n’est nécessaire.

Pour faire évoluer le schéma :

```bash
netlify db status
pnpm exec drizzle-kit generate --name add_descriptive_change
```

Sur un site neuf, le statut peut indiquer qu’aucune branche de production n’existe avant le premier déploiement. Ne modifiez pas manuellement les migrations ou leurs snapshots. Les versions `@beta` de Drizzle sont nécessaires à l’adaptateur Netlify Database.

Le déploiement est configuré dans `netlify.toml`. Le pipeline réalise l’installation, la construction et la validation. Aucune construction, aucun test et aucun serveur local n’ont été lancés pendant la création dans l’environnement géré.

## Limites et confidentialité

Chaque fichier est limité à **4 Mo**, avec **100 documents par compte**. Les documents Word ou texte de plus de **100 000 caractères** doivent être séparés en chapitres. Les archives Word de plus de **20 Mo décompressés** sont refusées. Convertissez les anciens fichiers `.doc` en `.docx` ou PDF.

Chaque étudiant dispose de **30 demandes IA par jour**, renouvelées à minuit UTC. Une erreur du fournisseur ne consomme pas le quota. Les photos doivent être nettes et lisibles ; les contenus longs gagnent à être étudiés par section.

Les données sont isolées par compte et les accès sont vérifiés côté serveur. Le document sélectionné, la question et les derniers messages de contexte sont transmis au fournisseur IA via la passerelle Netlify. N’importez pas de données sensibles ou de documents que vous n’avez pas le droit d’utiliser. L’IA peut se tromper : vérifiez les informations importantes avec le cours ou votre enseignant.

Supprimer un document supprime son original, ses fiches liées et sa conversation. Les fiches et discussions sans document restent disponibles. Les exemples publics illustrent l’interface sans être ajoutés aux comptes.

## Structure

```text
src/routes/          Page principale et métadonnées
src/components/      Formulaires, fenêtres et assistant
src/lib/             Types, API et exemples publics
src/styles.css       Identité visuelle responsive
db/                  Schéma et connexion Drizzle
netlify/functions/   API privée et intégration IA
netlify/database/    Migrations générées
public/              Favicon vectoriel
```
