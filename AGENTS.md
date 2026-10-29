# My Community — Directives Architecturales & Principes SOLID pour Agents et Développeurs

Ce fichier définit les directives obligatoires pour tout agent d'assistance au codage (Antigravity, Copilot, etc.) et tout contributeur du projet **My Community**.

---

## Règle Absolue : Application Intégrale des Principes SOLID

Dans tous les sous-systèmes du monorepo :
- **Backend (`apps/api`) :** Monolithe Modulaire NestJS + Architecture Hexagonale (Clean Architecture).
- **Web (`apps/web`) :** Application Next.js (React + TypeScript).
- **Mobile (`apps/mobile`) :** Application Flutter (Dart + Riverpod).
- **Packages Partagés (`packages/*`) :** Contrats, validation, tokens de design.

### Les 5 Principes Exigés :

1. **S — Single Responsibility Principle (SRP) :**
   - Une classe / fonction / composant n'a qu'une seule et unique raison de changer.
   - Les contrôleurs NestJS sont minces : ils délèguent immédiatement à des cas d'usage applicatifs uniques.
   - Les composants React / Widgets Flutter sont découplés de la logique réseau ou de calcul métier.

2. **O — Open/Closed Principle (OCP) :**
   - Ouvert à l'extension, fermé à la modification directe du code existant.
   - Utilisation systématique de patrons de conception adaptés : Strategy Pattern (passerelles de paiement, fournisseurs d'authentification), Domain Events pour les effets de bord (audit, notifications), et composition de composants.

3. **L — Liskov Substitution Principle (LSP) :**
   - Tout adaptateur concret implémentant un Port abstrait doit pouvoir être interchangé sans impacter le comportement attendu.
   - Les implémentations de test (InMemoryRepositories, Mocks) doivent strictement respecter les préconditions et postconditions des contrats.

4. **I — Interface Segregation Principle (ISP) :**
   - Bannissement des interfaces "God Object" ou des repositories avec 50 méthodes.
   - Ségrégation systématique des ports en interfaces fines et ciblées (ex: `CommunityReaderPort` pour les requêtes, `CommunityWriterPort` pour les mutations).
   - Props de composants UI restreintes au strict nécessaire.

5. **D — Dependency Inversion Principle (DIP) :**
   - Les couches de haut niveau (Domaine et Cas d'Usage Applicatifs) ne dépendent jamais des couches de bas niveau (Prisma, PostgreSQL, S3, Redis, framework HTTP).
   - Les deux dépendent d'abstractions (Ports). Les adaptateurs concrets implémentent ces ports et sont injectés par le conteneur IoC.

---

## Règle Complémentaire : Design Patterns Pragmatiques & Anti-Sur-Ingénierie (KISS & YAGNI)

L'usage des patrons de conception est exigé pour résoudre des besoins de découplage avérés, **sans jamais surcharger le projet** avec des abstractions prématurées :

1. **Les 6 Patterns Clés Recommandés :**
   - **Static Factory Method :** Instanciation contrôlée des entités (`Entity.create(props)`) garantissant les invariants.
   - **Strategy Pattern :** Découplage des fournisseurs interchangeables (passerelles de paiement XOF, SMS OTP).
   - **Observer / Domain Events :** Événements in-process découplés (`EventEmitter2`) pour les effets de bord (audit, notifications).
   - **Data Mapper :** Fonctions pures statiques pour convertir DTO $\leftrightarrow$ Entité $\leftrightarrow$ Modèle Prisma.
   - **Specification / Policy Pattern :** Règles métier pures et isolées (`Policy.canBeApproved()`).
   - **Adapter Pattern :** Encapsulation des SDKs tiers (S3, Dio, Drift) derrière les ports applicatifs.

2. **Exploiter les Mécanismes Natifs :**
   - S'appuyer sur l'IoC NestJS, les Guards, Interceptors et Pipes natifs plutôt que de réinventer des patrons maison.
   - S'appuyer sur la composition React (Compound Components, Custom Hooks) et les Providers Riverpod.

3. **Anti-Patterns Strictement Proscrits :**
   - ❌ Pas de *Builder Pattern* pour de simples objets de données.
   - ❌ Pas d'*Abstract Factory de Fabriques*.
   - ❌ Pas de *CQRS asynchrone complexe / Event Sourcing prématuré* (surdimensionné pour un monolithe modulaire).
   - ❌ Pas de hiérarchies de génériques à tiroirs (`BaseRepository<T, K, ID, Options>`).

---

## Règle Absolue d'Exécution : Feuille de Route Séquentielle (Anti-Chevauchement & Anti-Régression)

Pour interdire tout chevauchement et éviter de retoucher des modules déjà stabilisés :
1. **Suivre strictement l'ordre topologique des niveaux (L0 $\rightarrow$ L1 $\rightarrow$ L2 $\rightarrow$ L3 $\rightarrow$ L4 $\rightarrow$ L5) :**
   - **Niveau 0 :** `platform` $\rightarrow$ `audit` $\rightarrow$ `territories`
   - **Niveau 1 :** `identity` $\rightarrow$ `users` $\rightarrow$ `notifications`
   - **Niveau 2 :** `communities` $\rightarrow$ `memberships`
   - **Niveau 3 :** `associations` $\rightarrow$ `residences`
   - **Niveau 4 :** `social` $\rightarrow$ `events`
   - **Niveau 5 :** `finance` $\rightarrow$ `moderation`
2. **Règle de Gel (Gate Lock) :**
   - Un module ne peut être entamé que si ses prérequis sont à l'état **🟢 VERROUILLÉ**.
   - Lorsqu'un module est verrouillé (tests 100% verts, linter 0 erreur), sa façade publique (`index.ts`) est **figée**.
   - **Interdiction formelle de modifier le code ou les contrats d'un module verrouillé** pour satisfaire un module aval. Toute extension doit se faire par OCP (Domain Events, stratégies ou nouvelles routes).

Consultez la documentation complète :
- Feuille de route séquentielle : [docs/architecture/feuille-de-route-implementation-modules.md](file:///c:/Sikirou/eskay/my_community/docs/architecture/feuille-de-route-implementation-modules.md)
- Architecture globale : [docs/04-architecture-technique.md](file:///c:/Sikirou/eskay/my_community/docs/04-architecture-technique.md)
- Guide SOLID détaillé : [docs/architecture/principes-solid.md](file:///c:/Sikirou/eskay/my_community/docs/architecture/principes-solid.md)
- Guide Design Patterns Pragmatiques : [docs/architecture/design-patterns-pragmatiques.md](file:///c:/Sikirou/eskay/my_community/docs/architecture/design-patterns-pragmatiques.md)
- Décisions d'Architecture : [ADR-011 (SOLID)](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-011-principes-solid-architecture.md) · [ADR-012 (Patterns Pragmatiques)](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-012-design-patterns-pragmatiques-anti-sur-ingenierie.md)


