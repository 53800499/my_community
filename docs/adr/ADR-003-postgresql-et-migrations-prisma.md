# ADR-003 : PostgreSQL et Stratégie de Migrations avec Prisma

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
La plateforme My Community manipule des relations complexes (multi-rattachements territoriaux, adhésions contextuelles) et des écritures financières exigeant une consistance transactionnelle absolue (ACID). Un SGBD NoSQL ne permettrait pas de garantir nativement ces contraintes relationnelles sans logique applicative complexe.

## Décision
Adopter **PostgreSQL 16+** comme base relationnelle unique, couplé à **Prisma ORM** pour la modélisation et la gestion des migrations :
- Identifiants de type `UUIDv4` générés via l'extension `pgcrypto`.
- Types énumérés stricts (`ENUM`) pour les statuts d'état.
- Migrations versionnées et reproductibles gérées via `prisma migrate deploy`.
- Les migrations et le schéma restent sous la responsabilité exclusive du backend dans `database/prisma/`. Les clients web et mobile n'accèdent jamais directement à PostgreSQL.

## Conséquences
- **Positives :**
  - Schéma déclaratif fort et génération automatique de types TypeScript pour le backend.
  - Transactions atomiques robustes (`prisma.$transaction`).
  - Index de performance et contraintes d'intégrité garantis par le moteur PostgreSQL.
- **Négatives :**
  - Prisma ne gère pas nativement toutes les fonctionnalités avancées de PostgreSQL comme les politiques Row-Level Security (RLS) complexes sans migrations SQL manuelles complémentaires.
