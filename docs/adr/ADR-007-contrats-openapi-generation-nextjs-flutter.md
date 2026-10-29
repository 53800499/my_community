# ADR-007 : Contrats d'API OpenAPI et Génération Multi-Plateforme (Next.js & Flutter)

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Avec une interface Web développée en **Next.js (TypeScript)** et une application mobile en **Flutter (Dart)**, le risque de dérive entre les types attendus par l'API NestJS et ceux utilisés par les clients est critique. Le partage direct de code TypeScript n'est pas possible avec Dart.

## Décision
Faire de la spécification **OpenAPI v3** (`/api/v1/swagger-json`) la source de vérité unique pour les contrats de communication :
- Le backend NestJS documente précisément ses DTOs et endpoints avec `@nestjs/swagger`.
- Génération automatique du client TypeScript pour le Web (`@my-community/api-client`) via `openapi-typescript-codegen` ou Orval.
- Génération automatique du client Dart pour l'application Flutter via `openapi_generator_cli`.
- Validation d'entrée côté serveur via `class-validator` pour NestJS et validation de formulaires côté client via Zod (Web) et validateurs Dart (Mobile).

## Conséquences
- **Positives :**
  - Typage fort de bout en bout sur le web et le mobile sans écriture manuelle de modèles DTO redondants.
  - Détection immédiate à la compilation de tout changement de contrat d'API cassant.
- **Négatives :**
  - Nécessite d'intégrer l'étape de génération de code dans le script de build et dans la CI.
