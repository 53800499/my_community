# ADR-001 : Adoption d'un Monorepo avec pnpm et Turborepo

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Le projet **My Community** comprend une API backend NestJS, une application Web Next.js, une application mobile Flutter et plusieurs bibliothèques partagées (validation, tokens, configurations de build). La gestion de dépôts multiples séparés entraînerait une désynchronisation rapide des contrats d'API, une duplication des configurations d'outillage (ESLint, Prettier, TypeScript) et une complexité accrue dans la CI/CD.

## Décision
Adopter une architecture **Monorepo** orchestrée par **pnpm workspaces** et **Turborepo** :
- `apps/api` : Backend NestJS.
- `apps/web` : Application Web Next.js.
- `apps/mobile` : Application mobile Flutter.
- `packages/*` : Bibliothèques partagées (contrats, tokens, validation).

## Conséquences
- **Positives :**
  - Unicité du dépôt pour toute l'équipe de développement.
  - Exécution incrémentale et mise en cache rapide des builds et tests via Turborepo.
  - Déploiements synchronisés et traçabilité atomique des changements transversaux.
- **Négatives :**
  - Les dépendances Flutter (Dart/Pub) ne sont pas gérées par pnpm et nécessitent une pipeline spécifique au sein du même dépôt.
