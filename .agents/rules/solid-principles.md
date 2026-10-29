---
description: Exigence impérative de l'application des principes SOLID sur l'ensemble de l'architecture du système (Backend NestJS, Web Next.js, Mobile Flutter, Packages partagés)
globs: ["**/*.ts", "**/*.tsx", "**/*.dart", "**/*.js"]
---

# Règle d'Architecture : Exigence Absolue des Principes SOLID

Dans tout le projet **My Community**, l'application des principes **SOLID** est obligatoire et non négociable. Toute proposition d'architecture, classe, module, cas d'usage, composant ou fonction doit être rigoureusement conforme aux 5 principes suivants.

---

## 1. Single Responsibility Principle (SRP) — Responsabilité Unique

> **Une classe, un module ou un composant ne doit avoir qu'une seule et unique raison de changer.**

- **Backend (NestJS) :**
  - **Contrôleurs HTTP (`presentation/http/`) :** Rôle exclusif d'aiguillage HTTP (valider l'entrée DTO, invoquer le cas d'usage applicatif, mapper et sérialiser la réponse HTTP). **Interdiction formelle** d'y placer de la logique métier, des règles de calcul ou des accès BDD directs.
  - **Cas d'Usage (`application/commands/` & `application/queries/`) :** Un cas d'usage orchestre **un seul scénario métier** (ex: `ApproveCommunityUseCase`, `GetCommunityFeedQuery`). Il ne doit pas être un « God Service » fourre-tout.
  - **Domaine Pur (`domain/`) :** Les entités et politiques encapsulent exclusivement les invariants métier et les calculs de domaine, sans aucune dépendance technique.
  - **Repositories & Mappers (`infrastructure/`) :** Responsabilité unique de persistance et de conversion entre le modèle de stockage (Prisma/PostgreSQL) et l'entité du domaine.
- **Frontend Web (Next.js) :**
  - Séparer strictement les **Composants d'Affichage** (présentation pure sans effet de bord), les **Hooks personnalisés** (gestion d'état et orchestration), et les **Clients d'API** (appels réseau).
- **Mobile (Flutter) :**
  - Les Widgets sont strictement dédiés au rendu UI.
  - Les Notifiers Riverpod gèrent l'état d'un flux spécifique.
  - Les Datasources et Repositories isolent les opérations de cache Drift ou d'appels Dio.

---

## 2. Open/Closed Principle (OCP) — Ouvert à l'Extension, Fermé à la Modification

> **Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.**

- **Backend (NestJS) :**
  - Recourir au **Strategy Pattern** pour les comportements interchangeables (ex: passerelles de paiement MoMo, Celtiis, Stripe) au lieu de chaînes de `if/else` ou `switch`.
  - Publier des **Domain Events** (ex: `CommunityApprovedDomainEvent`) pour déclencher des effets secondaires (notifications, audit, indexation) sans modifier le cas d'usage initial.
  - Utiliser des Guards, Interceptors et Pipes NestJS configurables pour étendre les comportements sans modifier le code métier.
- **Frontend Web & Mobile :**
  - Privilégier la composition de composants (Compound Components, slots, pattern `asChild`) permettant d'ajouter des capacités sans altérer le composant existant.

---

## 3. Liskov Substitution Principle (LSP) — Substituabilité de Liskov

> **Les objets d'un programme doivent pouvoir être remplacés par des instances de leurs sous-types sans altérer la cohérence du programme.**

- **Backend (NestJS) :**
  - Toute implémentation concrète d'un Port (ex: `PrismaCommunityRepository`, `InMemoryCommunityRepository`, ou `PostgresRawCommunityRepository`) doit honorer scrupuleusement le contrat défini par la classe abstraite/interface `CommunityRepositoryPort`.
  - Interdiction pour une sous-classe ou implémentation concrète :
    - De renvoyer `undefined` si le contrat spécifie `Promise<CommunityEntity | null>`.
    - De lever des exceptions non prévues par le contrat abstrait.
    - De durcir les préconditions ou d'affaiblir les postconditions.
- **Frontend & Mobile :**
  - Les adaptateurs de cache local et les adaptateurs distants doivent satisfaire les mêmes contrats d'accès aux données.
  - Les mocks de test doivent se comporter exactement comme les adaptateurs réels en termes de signature et de garanties.

---

## 4. Interface Segregation Principle (ISP) — Ségrégation des Interfaces

> **Aucun client ne doit être contraint de dépendre de méthodes qu'il n'utilise pas.**

- **Backend (NestJS) :**
  - **Interdiction des "God Repositories"** contenant 40 méthodes.
  - Séparer systématiquement les interfaces de lecture et d'écriture :
    - `CommunityReaderPort` (recherches, lectures, listes).
    - `CommunityWriterPort` (création, mise à jour, changement de statut, suppression).
  - Les Cas d'Usage de consultation (Queries) ne doivent dépendre que de `CommunityReaderPort`.
  - Ségréguer les ports transversaux : un port pour l'audit (`AuditLoggerPort`), un port pour les notifications (`NotificationEmitterPort`), plutôt qu'un port géant fourre-tout.
- **Frontend Web & Mobile :**
  - Interfaces de Props minimales : ne jamais passer un modèle complet de données (ex: `User`) à un composant visuel qui n'a besoin que d'un `avatarUrl` et d'un `displayName`.

---

## 5. Dependency Inversion Principle (DIP) — Inversion des Dépendances

> **1. Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.**  
> **2. Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions.**

- **Backend (NestJS) :**
  - Le Domaine et l'Application ne doivent **jamais** importer ni dépendre de Prisma, PostgreSQL, Redis, S3, Express ou de modules NestJS d'infrastructure.
  - L'Application définit ses besoins sous forme de **Ports abstraits** (`application/ports/`).
  - L'Infrastructure implémente ces ports via des **Adaptateurs concrets** (`infrastructure/persistence/prisma-community.repository.ts`).
  - L'injection de dépendance NestJS utilise des Tokens/Symboles ou des classes abstraites pour injecter l'adaptateur sans couplage fort.
- **Frontend Web & Mobile :**
  - Les pages et composants ne doivent jamais invoquer directement `fetch()` ou instancier `Dio()`.
  - La récupération de données se fait à travers des abstractions injectées (Hooks/Services/Providers Riverpod).

---

## 6. Utilisation Pragmatique des Design Patterns (Anti-Sur-Ingénierie)

L'utilisation des Design Patterns est encouragée pour résoudre des problèmes avérés de couplage ou de testabilité, mais **sans jamais surcharger le projet** :

1. **Les 6 Patterns Clés Autorisés :**
   - **Static Factory Method :** Pour instancier les entités avec validation des invariants (`CommunityEntity.create(props)`).
   - **Strategy Pattern :** Pour les passerelles interchangeables (paiements MTN MoMo / Celtiis / Stripe).
   - **Observer / Domain Events :** Pour déclencher des effets de bord sans alourdir le Cas d'Usage (`EventEmitter2`).
   - **Data Mapper :** Pour convertir DTO $\leftrightarrow$ Entité $\leftrightarrow$ Modèle Prisma.
   - **Specification / Policy :** Pour isoler les règles d'éligibilité et de validation métier.
   - **Adapter :** Pour encapsuler les SDKs tiers (S3, Dio, Drift).

2. **Exploiter les Capacités Natives :**
   - Toujours privilégier l'IoC NestJS, les Guards, Interceptors et Pipes natifs plutôt que de réinventer des patrons maison.
   - Toujours privilégier la composition React et les Hooks plutôt que des architectures frontend surdimensionnées.

3. **Anti-Patterns Strictement Bannis (KISS / YAGNI) :**
   - ❌ Pas de Builder pour de simples objets ou DTOs.
   - ❌ Pas d'Abstract Factory de Fabriques.
   - ❌ Pas de CQRS avec bus asynchrone / Event Sourcing prématuré.
   - ❌ Pas de hiérarchie de génériques abstraits à 4 niveaux.

---

## Check-list Obligatoire pour toute Revue de Code

- [ ] **S** : Chaque classe/fichier a-t-il une seule responsabilité bien délimitée ?
- [ ] **O** : L'ajout d'une variante ou d'un cas connexe nécessite-t-il de modifier le code existant ou peut-il se faire par extension/composition ?
- [ ] **L** : Les implémentations de remplacement (mocks de test, alternatives d'infra) respectent-elles le contrat sans surprise ?
- [ ] **I** : Les interfaces sont-elles fines et spécifiques, évitant aux appelants des méthodes inutilisées ?
- [ ] **D** : Les flux de dépendance pointent-ils tous vers des abstractions/ports et jamais vers des outils d'infrastructure concrets ?
- [ ] **Pragmatisme (Anti-Sur-Ingénierie)** : Le code évite-t-il les abstractions prématurées (Builders inutiles, CQRS complexe, usines à gaz) ?

