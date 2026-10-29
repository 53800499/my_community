# My Community — Documentation Officielle du Projet

Bienvenue dans la documentation d'architecture, de conception et de spécifications du projet **My Community** (Plateforme citoyenne multi-communautés, multi-associations et multi-plateformes).

**Version :** 2.1 (Système Complet en Architecture Hexagonale & Monorepo)  
**Date de Référence :** 21 octobre 2026  
**Stack Technologique :** Monorepo (pnpm + Turborepo) · NestJS · PostgreSQL (Prisma) · Next.js (Web) · Flutter (Mobile)  
**Paradigme Architectural :** Architecture Hexagonale (Ports & Adaptateurs) appliquée sur le Backend, le Web et le Mobile  
**Devise par défaut :** Franc CFA (`XOF`)  

---

## 🚀 Démarrage Rapide (Commandes Essentielles)

Consultez le [**Guide Opérationnel des Commandes & Démarrage Local**](file:///c:/Sikirou/eskay/my_community/docs/operations/guide-demarrage-et-commandes.md) pour la documentation exhaustive.

```powershell
# 1. Lancer les conteneurs Docker (PostgreSQL sur port 5434, Redis, MinIO)
pnpm run docker:up

# 2. Synchroniser le schéma Prisma avec la base de données
pnpm run db:push

# 3. Lancer le serveur NestJS en mode développement
pnpm run dev:api

# 4. Lancer les tests unitaires (24 tests de conformité SOLID)
pnpm run test:unit
```

* **API Locale :** `http://localhost:3000`
* **Documentation Interactive Swagger :** `http://localhost:3000/api/v1/docs`

---

## 🧭 Plan d'Orientation de la Documentation

### 1. Architecture Système & Structure Hexagonale
- [**Feuille de Route d'Implémentation Séquentielle**](file:///c:/Sikirou/eskay/my_community/docs/architecture/feuille-de-route-implementation-modules.md) : **(Gouvernance Opérationnelle)** Ordre topologique d'implémentation par niveau, protocole de verrouillage anti-chevauchement et anti-régression.
- [**Guide des Principes SOLID**](file:///c:/Sikirou/eskay/my_community/docs/architecture/principes-solid.md) : Déclinaison des 5 principes sur le Backend, le Web et le Mobile avec matrice de conformité.
- [**Guide des Design Patterns Pragmatiques**](file:///c:/Sikirou/eskay/my_community/docs/architecture/design-patterns-pragmatiques.md) : Les 6 patrons de conception clés autorisés et règles anti-sur-ingénierie (KISS / YAGNI).
- [**Architecture Hexagonale Globale (Ports & Adaptateurs)**](file:///c:/Sikirou/eskay/my_community/docs/architecture/hexagonal-architecture.md) : **(Document Majeur)** Modélisation détaillée des trois hexagones (Backend NestJS, Mobile Flutter, Web Next.js), ports entrants/sortants et adaptateurs primaires/secondaires.
- [**Cartographie Fonctionnelle de Référence**](file:///c:/Sikirou/eskay/my_community/docs/architecture/cartographie-fonctionnelle-reference.md) : **(Document Fondateur)** Définition des 12 domaines métier, arbitrages structurants, modèles relationnels utilisateurs/communautés et stratégie de passage à l'échelle.
- [**Étape 2 — Modèle Métier Utilisateurs & Communautés**](file:///c:/Sikirou/eskay/my_community/docs/architecture/etape-2-modele-metier-utilisateurs-communautes.md) : Découplage compte/profil, abonnements, blocages, gouvernance des communautés et adhésions.
- [**Étape 3 — Modèle Métier Contenus & Confidentialité**](file:///c:/Sikirou/eskay/my_community/docs/architecture/etape-3-modele-metier-contenus-confidentialite.md) : Rattachement des publications, moteur Zero-Trust de confidentialité, interactions, sécurisation des médias S3 et contrats d'API.
- [**Architecture Globale & Monorepo**](file:///c:/Sikirou/eskay/my_community/docs/architecture/architecture.md) : Schéma des conteneurs C4, structure complète du monorepo (`apps/api`, `apps/web`, `apps/mobile`, `packages/`), graphe des dépendances et flux de requêtes.
- [**Frontières des Modules & Règles de Dépendance**](file:///c:/Sikirou/eskay/my_community/docs/architecture/module-boundaries.md) : Cartographie des 13 domaines métier (`identity`, `territories`, `communities`, `associations`, `residences`, `finance`, `social`, etc.), ownership des données et règles d'importation.
- [**Intégration Modules Résidence & Finance**](file:///c:/Sikirou/eskay/my_community/docs/architecture/integration-residence-finance.md) : Gestion physique des hébergements, chambres, dettes locatives, loyers mensuels automatisés et rapprochements de paiement.
- [**Guide d'Architecture & Conventions de Code**](file:///c:/Sikirou/eskay/my_community/docs/08-documentation-code.md) : Découpage hexagonal par module (`domain/`, `application/`, `infrastructure/`, `presentation/`), architecture feature-first Flutter (Riverpod, Drift).

---

### 2. Charte Graphique & Système de Design (v1.0)
- [**Identité de Marque (Brand)**](file:///c:/Sikirou/eskay/my_community/docs/design-system/brand.md) : Direction artistique *Premium & Connected*, vision, positionnement et attributs de marque.
- [**Palette de Couleurs & Tokens**](file:///c:/Sikirou/eskay/my_community/docs/design-system/colors.md) : Indigo profond (`#3730A3`), Violet (`#7C3AED`), Corail (`#F97373`), Indigo nuit (`#171638`), thèmes clair et sombre.
- [**Typographie**](file:///c:/Sikirou/eskay/my_community/docs/design-system/typography.md) : Police unique *Inter*, échelle textuelle responsive et lisibilité mobile.
- [**Espacements & Grille**](file:///c:/Sikirou/eskay/my_community/docs/design-system/spacing-and-layout.md) : Grille modulaire 4/8 px, rayons, largeurs de contenu (1280 px) et breakpoints web/mobile.
- [**Composants d'Interface**](file:///c:/Sikirou/eskay/my_community/docs/design-system/components.md) : Spécifications et états des boutons, cartes de communauté, publications et avatars.
- [**Accessibilité (WCAG 2.2 AA)**](file:///c:/Sikirou/eskay/my_community/docs/design-system/accessibility.md) : Ratios de contraste obligatoires (4.5:1, 3:1), gestion du corail, cibles tactiles (44px) et navigation clavier.
- [**Tokens Partagés (JSON & TS)**](file:///c:/Sikirou/eskay/my_community/packages/design-tokens/tokens.json) : Source unique de vérité des tokens pour Next.js et Flutter.

---

### 3. Spécifications Fonctionnelles et Données
- [**01 — Document de Cadrage**](file:///c:/Sikirou/eskay/My%20community/doc/01-document-cadrage.md) : Vision, mission, les 5 décisions structurantes, acteurs et périmètre (MVP vs Post-MVP).
- [**02 — Cahier des Charges (MVP)**](file:///c:/Sikirou/eskay/My%20community/doc/02-cahier-des-charges.md) : Exigences fonctionnelles MC-01 à MC-09, checklist des 18 critères d'acceptation.
- [**03 — Spécifications Fonctionnelles**](file:///c:/Sikirou/eskay/My%20community/doc/03-specifications-fonctionnelles.md) : Workflows détaillés (proposition/approbation de communauté, adhésions multi-communautés, associations multi-localités, cotisations).
- [**04 — Architecture Technique Globale**](file:///c:/Sikirou/eskay/My%20community/doc/04-architecture-technique.md) : Monolithe modulaire, RBAC contextuel par ressource, contrats OpenAPI et politique hors ligne.
- [**05 — Spécifications Techniques**](file:///c:/Sikirou/eskay/My%20community/doc/05-specifications-techniques.md) : Conventions UUID/TIMESTAMPTZ/XOF, stockage S3 pré-signé, formats RFC 7807.
- [**Schéma de Base de Données Modernisé (Multi-Schémas v2.0)**](file:///c:/Sikirou/eskay/My%20community/doc/database/schema-modernise-postgresql.md) : **(Référence Technique)** Architecture PostgreSQL 16+ isolée en 7 schémas métier, DDL complet, UUID v7 temporels, Transactional Outbox et partitionnement.
- [**Dictionnaire de Données Modernisé**](file:///c:/Sikirou/eskay/My%20community/doc/database/data-model.md) : Inventaire complet des tables et dépendances multi-schémas.
- [**06 — Base de Données & Script SQL (MVP v1.0)**](file:///c:/Sikirou/eskay/My%20community/doc/06-base-de-donnees.md) : Diagramme ERD initial, script DDL PostgreSQL MVP et modèles historiques.
- [**07 — Spécification des APIs**](file:///c:/Sikirou/eskay/My%20community/doc/07-api.md) : Référentiel complet des routes RESTful v1.
- [**11 — Stratégie & Gouvernance**](file:///c:/Sikirou/eskay/My%20community/doc/11-doc-strategie-.md) : Ancrage territorial (Bénin / Afrique de l'Ouest) et décisions à figer avant migration.
- [**12 — Synthèse Fonctionnelle & Parcours**](file:///c:/Sikirou/eskay/My%20community/doc/12-doc-fonctionnelles.md) : Scénarios utilisateurs pas à pas.

---

### 4. Assurance Qualité, Sécurité et DevOps
- [**09 — Stratégie Complète de Tests Automatisés**](file:///c:/Sikirou/eskay/My%20community/doc/09-tests.md) : Tests unitaires Jest, intégration PostgreSQL réel via Testcontainers, tests de sécurité anti-IDOR, E2E Playwright et tests de cache mobile.
- [**Matrice des Tests d'Assurance Qualité**](file:///c:/Sikirou/eskay/My%20community/doc/testing/test-strategy.md) : Priorisation P0 à P3 et validation des critères d'acceptation.
- [**10 — Déploiement & Pipeline CI/CD**](file:///c:/Sikirou/eskay/My%20community/doc/10-deploiement.md) : Chaîne CI/CD automatisée, environnements, secrets et plan de continuité PRA/PCA.
- [**Sécurité & Audit**](file:///c:/Sikirou/eskay/My%20community/doc/security/security-audit.md) : Matrice des permissions RBAC, audit immuable et politiques PostgreSQL RLS.
- [**Supervision & Métriques**](file:///c:/Sikirou/eskay/My%20community/doc/operations/monitoring.md) : SLI/SLO, alertes et journalisation structurée.

---

### 5. Architecture Decision Records (ADRs)
- [**ADR-001**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-001-monorepo-pnpm-turborepo.md) : Monorepo pnpm workspaces + Turborepo.
- [**ADR-002**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-002-monolithe-modulaire-nestjs.md) : Monolithe modulaire NestJS.
- [**ADR-003**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-003-postgresql-et-migrations-prisma.md) : PostgreSQL 16+ et stratégie de migrations Prisma.
- [**ADR-004**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-004-frontieres-modules-regles-dependances.md) : Frontières des 12 modules métier et interdiction des dépendances circulaires.
- [**ADR-005**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-005-modele-autorisation-contextuelle.md) : Autorisation contextuelle par ressource (*Identité × Ressource × Statut × Rôle*).
- [**ADR-006**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-006-transactions-financieres-journal-audit.md) : Immutabilité des transactions financières en XOF et journal d'audit immuable.
- [**ADR-007**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-007-contrats-openapi-generation-nextjs-flutter.md) : Contrats d'API OpenAPI v3 et génération de clients typés (TypeScript / Dart).
- [**ADR-008**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-008-cache-prive-hors-ligne-flutter.md) : Cache privé hors ligne Flutter (Drift/SQLite) et purge intégrale à la déconnexion.
- [**ADR-009**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-009-architecture-hexagonale-systeme-complet.md) : **Généralisation de l'Architecture Hexagonale (Ports & Adaptateurs)** sur tout le système (Backend, Web et Mobile).
- [**ADR-010**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-010-decouplage-temporel-occupations-residences.md) : **Découplage Temporel des Personnes et Hébergements** via l'entité pivot `RoomOccupation`.
- [**ADR-011**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-011-principes-solid-architecture.md) : **Exigence Formelle des Principes SOLID** sur l'ensemble de l'architecture.
- [**ADR-012**](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-012-design-patterns-pragmatiques-anti-sur-ingenierie.md) : **Sélection de Design Patterns Pragmatiques & Prévention de la Sur-Ingénierie (KISS & YAGNI)**.
