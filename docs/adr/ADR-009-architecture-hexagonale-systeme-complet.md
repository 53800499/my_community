# ADR-009 : Généralisation de l'Architecture Hexagonale sur Tout le Système

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
La complexité croissante des plateformes multi-clients (Web, Mobile, Backend) conduit souvent à une fuite de la logique métier dans les composants visuels (React, Flutter) ou dans les contrôleurs et ORMs (NestJS, Prisma). Cela rend les tests automatisés extrêmement lourds et crée un couplage fort avec les frameworks.

## Décision
Adopter formellement l'**Architecture Hexagonale (Ports & Adaptateurs)** comme paradigme architectural unique sur **l'ensemble des composants du système** :
1. **Backend NestJS :** Les 12 modules métier encapsulent leur Domaine et Cas d'Usage à l'intérieur d'un hexagone. Les contrôleurs HTTP sont des adaptateurs primaires (Driving) et Prisma/PostgreSQL/S3 sont des adaptateurs secondaires (Driven).
2. **Mobile Flutter :** Chaque feature isole son Domaine (Dart pur) et ses Cas d'Usage derrière des Ports. Les écrans/Widgets Flutter sont des adaptateurs primaires ; Dio et Drift (SQLite) sont des adaptateurs secondaires.
3. **Web Next.js :** La logique applicative et les règles d'affichage sont découplées des composants React via des Ports et Cas d'Usage.

## Conséquences
- **Positives :**
  - **Indépendance totale des frameworks :** Le cœur métier ne dépend d'aucune technologie d'interface ni de base de données.
  - **Testabilité exemplaire :** Les cas d'usage et entités peuvent être testés unitairement à 100% sans base de données ni serveur HTTP grâce à l'injection de bouchons sur les ports sortants.
  - **Uniformité conceptuelle :** Les équipes frontend, mobile et backend partagent le même modèle mental (`domain`, `application`, `infrastructure`, `presentation`).
- **Négatives :**
  - Création d'interfaces (ports) et de classes d'adaptateurs supplémentaires par rapport à une architecture CRUD directe.
