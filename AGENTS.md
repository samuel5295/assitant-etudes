# Clair — Project Guide

## Product and architecture

Clair is a French-language study workspace for university students, tailored to Licence 2. Every student has a separate authenticated workspace. Public demo documents are explicitly labelled examples; never seed them into student accounts.

- `src/routes/__root.tsx`: French document, sharing metadata, fonts and styles. Do not add an Open Graph image; Netlify supplies it.
- `src/routes/index.tsx`: dashboard, workspace navigation, account state, private document CRUD, favorites and notes. Navigation and form state are temporary React state; business data comes from the API.
- `src/components/`: accessible modal, authentication, file import, study-action, Markdown and tutor components.
- `src/lib/types.ts`: shared data types and client upload limits. `api.ts` sends same-origin requests. `demo.ts` contains public fixtures and formatting helpers only.
- `src/styles.css`: responsive green/cream design system, loading states and reduced-motion handling. The book illustration and favicon are code-native vector artwork.
- `netlify/functions/study.mts`: modern Netlify Function for `/api/study` and child paths; private CRUD, downloads, AI generation and chat history.
- `db/schema.ts`: Drizzle schema for documents, notes, messages and daily AI usage. `db/index.ts` uses the native Netlify Database adapter.
- `netlify/database/migrations/`: generated migrations, applied by Netlify during deployment.

## Platform services and security

Use `@netlify/identity`, never deprecated identity libraries. Identity has been activated with the platform skill's enable script. Browser initialization handles email confirmation, recovery and invite callbacks. Logout clears private cached data and closes private dialogs.

All structured persistent data belongs in Netlify Database. Original files belong in the Netlify Blobs store `clair-documents`, keyed by authenticated owner ID and document UUID. Never use local JSON, localStorage, in-memory collections or external databases for persistent application data.

Every private query must be scoped to the server-authenticated `user.id`, never a client-supplied owner. Check ownership before blob access and AI requests. Verify same-origin mutations. Private responses use `Cache-Control: private, no-store`. Original downloads use attachment disposition and `nosniff`.

AI uses `@google/genai`, `gemini-2.5-flash` and Netlify AI Gateway. Create the client within the request workflow; credentials are injected by the platform. Never expose credentials or provider error details. PDFs/images use native multimodal input; Mammoth extracts DOCX text. Treat all document content as untrusted data, not instructions. Preserve French tutoring prompts, uncertainty handling and visible accuracy/privacy disclaimers.

Limits: 4 MiB per upload, 100 documents per student, 100,000 extracted/plain-text characters, 20 MiB uncompressed DOCX archives and 30 AI requests per UTC day. Reserve AI usage atomically with the conditional database upsert; refund provider failures. Note lists contain previews, with complete contents fetched on opening to avoid large API responses.

## Conventions

Use strict TypeScript, PascalCase components, camelCase variables and snake_case database columns. Server-side relative imports use `.js` extensions. Functions use `.mts` with modern `Request`/`Response` exports. Drizzle packages must stay on the `@beta` line that supports the Netlify Database adapter.

Use semantic controls, descriptive labels, visible focus rings, keyboard-accessible dialogs and explicit loading, empty and error states. Markdown must not enable raw HTML, unsafe links or remote model-generated images. Do not add inline code comments unless requested.

## Development

Use pnpm for dependencies and `netlify dev --port 8889` for development. Authentication should also be checked on a real deploy because Identity cookies depend on the deployed environment. The Netlify Vite plugin handles TanStack Start; the private API is a separate function.

For schema changes, inspect migration status and run `pnpm exec drizzle-kit generate --name <imperative_snake_case>`. Never manually edit generated SQL or snapshots. The production database was fresh during creation; provisioning and migration application occur at deploy time.

In the managed Build mode environment, do not run builds, local servers, typechecks or tests; the platform pipeline validates the project. Maintain `README.md` and write the changes summary to `.netlify/results.md`.
