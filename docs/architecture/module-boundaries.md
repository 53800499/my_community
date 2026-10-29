# My Community — Frontières des Modules et Règles de Dépendance

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document cible :** Architectes Logiciels, Lead Developers & Ingénieurs Backend  

---

## 1. Principes Directeurs d'Isolation

Le backend NestJS est organisé en **13 modules métier autonomes**. Pour préserver la maintenabilité et éviter que le système ne devienne un monolithe enchevêtré ("Big Ball of Mud"), chaque module doit respecter les règles suivantes :

1. **Propriété exclusive des données :** Chaque module possède ses tables PostgreSQL. Aucun module n'écrit directement dans les tables appartenant à un autre module.
2. **Façades et Contrats Publics :** Toute interaction inter-module s'effectue via une interface TypeScript publique (`public-api.ts` ou Port applicatif).
3. **Absence de dépendances circulaires :** Le graphe d'importation doit être un graphe acyclique orienté (DAG).
4. **Cohérence transactionnelle maîtrisée :** Une transaction PostgreSQL ne traverse pas arbitrairement tous les modules. Le module propriétaire de l'opération critique coordonne les écritures.

---

## 2. Cartographie Exhaustive des 13 Modules Métier

| Module | Responsabilité Principale | Entités dont il est Propriétaire | Dépendances Externes Autorisées | Dépendances Strictement Interdites |
| :--- | :--- | :--- | :--- | :--- |
| **`identity`** | Inscription, connexion, validation des identifiants, JWT, sessions, hachage Argon2id. | `users` (credentials), `user_sessions` | `platform/security`, `audit` | `communities`, `finance`, `social`, `residences` |
| **`users`** | Profil public, nom d'affichage, avatar S3, préférences personnelles, clôture de compte. | `users` (profil), `user_preferences` | `identity`, `audit` | `finance`, `associations`, `residences` |
| **`territories`** | Référentiel géographique hiérarchique sans cycle (Pays -> Département -> Commune -> Quartier/Village). | `territories` | Aucune (Module socle pur) | Tous les modules applicatifs |
| **`communities`** | Cycle de vie des propositions citoyennes, instruction admin, activation, suspension. | `community_proposals`, `communities` | `territories`, `users`, `audit`, `notifications` | `finance`, `social`, `residences` |
| **`memberships`** | Demandes d'adhésion aux communautés, validation par le manager, attribution des rôles locaux. | `community_memberships`, `community_membership_roles` | `communities`, `users`, `audit`, `notifications` | `finance`, `associations` (données internes) |
| **`associations`** | Déclaration de l'association unique, rattachements territoriaux multiples (N-N), adhésions associatives, rôles internes. | `associations`, `association_communities`, `association_memberships`, `association_membership_roles` | `communities`, `users`, `audit` | `finance` (accès direct tables), `social` |
| **`residences`** | Gestion physique et administrative des logements communautaires/associatifs (quartiers, bâtiments, chambres, occupations, résidents). | `quarters`, `buildings`, `rooms`, `room_occupations`, `residents`, `residence_access_requests` | `associations`, `territories`, `identity`, `audit`, `notifications` | `finance` (accès direct tables), `social` |
| **`social`** | Publications (`posts`), commentaires hiérarchisés, réactions (`LIKE`), construction du fil général agrégé et des fils locaux. | `posts`, `comments`, `reactions` | `communities`, `associations`, `memberships`, `moderation` | `finance`, `residences` |
| **`events`** | Création d'événements locaux ou associatifs, visibilité, calendrier, inscriptions. | `events`, `event_registrations` | `communities`, `associations`, `memberships`, `notifications` | `finance` |
| **`finance`** | Définition des cotisations, facturation des loyers de résidence, dettes locatives, dons, dépenses et livre des comptes en XOF. | `contribution_plans`, `member_dues`, `rent_settings`, `debts`, `rent_payments`, `spents`, `financial_transactions` | `associations`, `residences` (via `ResidentRepositoryPort`), `identity`, `audit` | `social`, `communities` (accès direct) |
| **`moderation`** | Signalements de contenus ou d'utilisateurs, assignation aux modérateurs locaux ou plateforme, sanctions. | `reports` | `social`, `communities`, `users`, `audit` | `finance`, `residences` |
| **`notifications`** | Notifications in-app, alertes événementielles, suivi de lecture. | `notifications` | `users`, `identity` | Logique métier des autres modules |
| **`audit`** | Traçabilité immuable des opérations sensibles (validation de communauté, mouvements de fonds, suspensions). | `audit_logs` | `users`, `identity` | Dépendance inverse vers d'autres modules |

---

## 3. Communication Inter-Modules : Les 3 Canaux Recommandés

### A. Appel Synchrone de Façade (Queries & Permissions)
Lorsqu'un module a besoin de consulter une information ou vérifier un droit appartenant à un autre domaine (ex: `social` vérifie si l'utilisateur est membre actif de la communauté via `memberships`) :
- Il injecte le service de façade du module cible (ex: `MembershipFacade.isActiveMember(userId, communityId)`).
- Il ne requêtes **jamais directement** la table `community_memberships` depuis le repository de `social`.

### B. Événements Métier Internes (Découplage Asynchrone)
Lorsqu'une action achevée entraîne des effets secondaires non bloquants (ex: l'approbation d'une communauté doit déclencher l'envoi d'une notification et l'écriture d'un log) :
- Le module émet un événement de domaine typé (ex: `CommunityApprovedEvent`).
- Le module `notifications` écoute l'événement et crée l'enregistrement.
- Si une garantie absolue de livraison est requise, le pattern **Transactional Outbox** est utilisé pour persister l'événement dans la même transaction que la mutation métier.

### C. Transactions Atomiques Délimitées
Pour les opérations multi-tables nécessitant une intégrité transactionnelle absolue (ex: Approbation d'une proposition $\rightarrow$ Création de la communauté $\rightarrow$ Manager initial) :
- Le module `communities` orchestre la transaction.
- Les étapes sont séquencées au sein d'un bloc transactionnel Prisma scoped.
- En cas d'échec de n'importe quelle étape, l'ensemble est annulé (`ROLLBACK`).

---

## 4. Règles d'Outillage et Contrôles Automatisés

Pour garantir le respect strict de ces frontières :
1. **Règles ESLint d'Importation :** Interdiction des imports relatifs profonds entre modules (ex: `import ... from '../finance/infrastructure/...'` est interdit ; seul `import ... from '../finance'` via l'index public est permis).
2. **Vérification du Graphe de Dépendances :** Utilisation d'outils comme `dependency-cruiser` ou `madge` exécutés dans la pipeline CI pour détecter et bloquer immédiatement toute dépendance circulaire ou illicite.
