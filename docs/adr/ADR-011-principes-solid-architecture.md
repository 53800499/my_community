# ADR-011 : Exigence Formelle des Principes SOLID sur Tout le Système

- **Statut :** Accepté
- **Date :** 22 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Avec l'adoption de l'architecture hexagonale (ADR-009) et l'expansion conjointe des trois briques majeures du système (**Backend NestJS**, **Web Next.js**, **Mobile Flutter**), le risque de dette technique lié à de mauvais réflexes de conception est élevé :
- Des contrôleurs ou services NestJS accumulant trop de responsabilités ("God Services").
- Des modifications dans un module cassant des comportements existants par manque d'extensibilité (violation OCP).
- Des implémentations d'adaptateurs (base de données, passerelles de paiement, caches) qui introduisent des comportements imprévus ou incompatibles (violation LSP).
- Des interfaces monolithiques de repositories imposant des dizaines de méthodes inutilisées à des cas d'usage simples (violation ISP).
- Des dépendances directes vers les outils techniques (Prisma, Express, Dio, Drift) au cœur des logiques métier ou des interfaces graphiques (violation DIP).

Pour garantir la pérennité, la testabilité à 100% et la maintenabilité du système sur le long terme, une exigence stricte et universelle des **principes SOLID** doit être formalisée et appliquée comme règle d'or d'ingénierie logicielle.

---

## Décision

Nous imposons l'application formelle et obligatoire des **5 principes SOLID** à travers **l'ensemble de l'architecture du système** :

### 1. Single Responsibility Principle (SRP)
- **Backend :** Chaque classe a une seule raison de changer. Contrôleurs minces (routage HTTP uniquement), Cas d'Usage applicatifs dédiés à un seul scénario, Entités de domaine encapsulant leurs seuls invariants, et Repositories dédiés à la persistance.
- **Web & Mobile :** Séparation étanche entre Rendu UI (Widgets/Composants purs), Gestion d'état (Hooks/Riverpod Notifiers), et Communication externe (Clients d'API et Repositories).

### 2. Open/Closed Principle (OCP)
- Le système doit être ouvert à l'extension sans nécessiter la modification des modules et cas d'usage stabilisés.
- Recours au **Strategy Pattern** pour les comportements interchangeables (ex: passerelles de paiement `MoMo`, `Celtiis`, `Stripe` ; fournisseurs d'envoi OTP).
- Émission de **Domain Events** pour déclencher les effets secondaires (audit, notifications, indexation) de façon asynchrone et découplée.
- Composition de composants UI (Compound components, slots).

### 3. Liskov Substitution Principle (LSP)
- Toute implémentation concrète d'un Port (ex: `PrismaCommunityRepository` vs `InMemoryCommunityRepository` pour les tests unitaire) doit pouvoir se substituer à son abstraction sans changer la sémantique ni provoquer de régression.
- Respect rigoureux des contrats (types de retour, nullabilité explicite, gestion unifiée des erreurs du domaine).

### 4. Interface Segregation Principle (ISP)
- Proscription absolue des interfaces géantes ("Fat Interfaces").
- Ségrégation systématique des ports d'accès aux données en ports fins : séparation de la lecture (`ReaderPort`) et de l'écriture (`WriterPort`).
- Ségrégation des interfaces transversales (ports d'audit, de notification, de géolocalisation).
- Props de composants UI strictement réduites aux données réellement consommées.

### 5. Dependency Inversion Principle (DIP)
- Les modules de haut niveau (Domaine métier et Cas d'usage applicatifs) ne doivent jamais dépendre des modules de bas niveau (Prisma, PostgreSQL, S3, Redis, Next.js, Flutter).
- Tous deux dépendent d'abstractions définies dans la couche applicative (`application/ports/`).
- Les adaptateurs concrets sont injectés via le conteneur IoC (NestJS Providers ou Riverpod Providers).

---

## Conséquences

### Positives
- **Découplage maximal :** Possibilité de remplacer ou de faire évoluer une technologie d'infrastructure (ex: changer de passerelle de paiement, passer de Prisma à un autre ORM, ou faire évoluer SQLite) sans toucher à la moindre ligne de logique métier.
- **Testabilité unitaire complète :** Grâce à l'injection d'abstractions (DIP) et à la substituabilité (LSP), les tests unitaires peuvent s'exécuter à la vitesse de la lumière sans instancier de base de données ni de serveur réseau.
- **Clarté et lisibilité du code :** Chaque fichier a un périmètre d'action restreint et compréhensible (SRP), avec des interfaces ciblées (ISP).
- **Évolutivité sans régression :** Les nouvelles fonctionnalités s'ajoutent par de nouveaux cas d'usage, de nouvelles stratégies ou de nouveaux composants sans impacter le code en production (OCP).

### Négatives / Contraintes acceptées
- Augmentation du nombre de fichiers par fonctionnalité (interfaces, implémentations, cas d'usage, mappers).
- Nécessité d'une rigueur absolue lors des revues de code et de l'encadrement par des règles de linter et d'outillage automatisé.
