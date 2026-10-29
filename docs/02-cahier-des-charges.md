# My Community — Cahier des Charges Fonctionnel et Technique (MVP)

**Version :** 1.0  
**Date de référence :** 21 octobre 2026  
**Type de document :** Référentiel contractuel et technique de développement  

---

## 1. Présentation Générale du Produit

**My Community** est une plateforme applicative conçue pour fédérer les communautés locales et les associations citoyennes. Elle offre un modèle multi-tenant logique sécurisé dans lequel :
- Chaque territoire géographique peut abriter des communautés numériques validées.
- Chaque association peut intervenir dans une ou plusieurs communautés sans redondance.
- Chaque membre dispose d'une étanchéité stricte sur ses adhésions et ses données privées.

---

## 2. Spécification Détaillée des Modules Fonctionnels

### MC-01 — Identité, Authentification et Profils
- **MC-01.1 : Inscription multi-canal :** Prise en charge de l'inscription par E-mail ou Téléphone (format E.164, ex: Bénin `+229XXXXXXXX`), avec mot de passe haché par Argon2id / bcrypt.
- **MC-01.2 : Normalisation et Unicité :** Normalisation stricte de l'identifiant (casse minuscule pour email, validation regex pour téléphone).
- **MC-01.3 : Gestion de session :** Sessions sécurisées avec jetons JWT (Access Token courte durée + Refresh Token révocable en base).
- **MC-01.4 : Profil utilisateur :** Nom d'affichage (`display_name`), photo de profil (`avatar_key` sur stockage objet sécurisé S3/MinIO), bio et préférences.
- **MC-01.5 : Confidentialité et Clôture :** Paramétrage de visibilité du profil ; possibilité de clore le compte (`status = CLOSED`) avec anonymisation ou archivage légal.

### MC-02 — Territoires et Communautés
- **MC-02.1 : Référentiel géographique hiérarchique :** Modélisation parent-enfant sans cycle (`territories`) : Pays -> Département -> Commune -> Arrondissement/Quartier/Village.
- **MC-02.2 : Soumission d'une proposition :** Tout utilisateur actif peut soumettre une proposition de communauté (`community_proposals`) comprenant un nom, un territoire de rattachement, une description et un motif d'intérêt local.
- **MC-02.3 : Anti-doublons préventif :** Détection automatique des propositions concurrentes de nom ou de territoire similaires.
- **MC-02.4 : Circuit de validation :** Seul un Administrateur de la plateforme peut statuer : `APPROVED`, `REJECTED` (avec motif obligatoire), ou `NEEDS_INFO`.
- **MC-02.5 : Activation et désignation du responsable :** L'approbation génère automatiquement l'entité `communities` et déclenche la procédure explicite d'attribution du rôle de Responsable communautaire.
- **MC-02.6 : Cycle de vie et Suspension :** Gestion des états `ACTIVE`, `SUSPENDED`, `ARCHIVED`. Une communauté suspendue bloque immédiatement toute nouvelle adhésion et restreint l'écriture.

### MC-03 — Adhésions Communautaires
- **MC-03.1 : Indépendance stricte :** L'adhésion d'un utilisateur à une communauté A est totalement isolée de son adhésion à une communauté B.
- **MC-03.2 : Cycle de vie de l'adhésion :** Statuts `PENDING` -> `ACTIVE` | `REJECTED` | `WITHDRAWN` | `SUSPENDED`.
- **MC-03.3 : Unicité :** Contrainte d'unicité `(community_id, user_id)` sur l'adhésion courante.
- **MC-03.4 : Rôles communautaires :** Attribution granulaire de rôles contextuels : `MEMBER`, `MODERATOR`, `MANAGER`.
- **MC-03.5 : Historisation et Révocation :** Conservation des traces d'adhésion (`requested_at`, `decided_by`, `decided_at`, `ended_at`). La suspension désactive immédiatement l'accès aux flux privés.

### MC-04 — Réseau Social et Fils d'Actualité
- **MC-04.1 : Rattachement unitaire :** Chaque publication (`posts`) appartient formellement à une communauté donnée et dispose d'une visibilité (`PUBLIC` ou `MEMBERS`).
- **MC-04.2 : Fil local :** Affiche les publications de la communauté sélectionnée selon les permissions de consultation du membre.
- **MC-04.3 : Fil général personnalisé :** Agrège exclusivement les publications des communautés dont l'utilisateur est membre actif. Les publications privées d'autres communautés restent invisibles.
- **MC-04.4 : Interactions sociales :** Commentaires hiérarchisés (`comments`), réactions typées (`LIKE`, etc. avec unicité par utilisateur et publication).
- **MC-04.5 : Signalement et modération :** Système de flaggage (`reports`) assignable à un modérateur local ou administrateur.

### MC-05 — Associations et Multi-Rattachements
- **MC-05.1 : Entité unique et globale :** Fiche d'association unique (`associations`) dotée de son statut (`PENDING`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`) et de sa visibilité (`PUBLIC`, `MEMBERS`).
- **MC-05.2 : Multi-rattachement territorial (N-N) :** Une association est rattachée à $N$ communautés via `association_communities` sans créer de doublon de structure.
- **MC-05.3 : Adhésions associatives propres :** Gestion des membres associatifs (`association_memberships`) indépendante des adhésions communautaires.
- **MC-05.4 : Rôles associatifs internes :** Attribution de rôles spécialisés : `MEMBER`, `PRESIDENT`, `SECRETARY`, `TREASURER`, `MANAGER`.

### MC-06 — Événements
- **MC-06.1 : Création événementielle :** Création d'événements rattachés à une communauté et optionnellement à une association partenaire.
- **MC-06.2 : Visibilité et Inscriptions :** Visibilité `PUBLIC` ou `MEMBERS` ; inscriptions avec statut (`REGISTERED`, `CANCELLED`, `ATTENDED`).
- **MC-06.3 : Cohérence temporelle :** Contrainte stricte `ends_at >= starts_at`.

### MC-07 — Gestion Associative et Finances
- **MC-07.1 : Devises et Montants :** Utilisation de `NUMERIC(14,2)` avec devise explicite (défaut : `XOF` - Franc CFA).
- **MC-07.2 : Plans de cotisations :** Configuration des barèmes périodiques (`contribution_plans`) : `ONCE`, `MONTHLY`, `QUARTERLY`, `YEARLY`.
- **MC-07.3 : Appels de cotisations :** Génération des dettes de cotisations (`member_dues`) pour chaque membre associatif pour une période donnée.
- **MC-07.4 : Paiements et versements échelonnés :** Une dette de cotisation peut être acquittée en plusieurs paiements (`contribution_payments`), chaque paiement étant lié à une transaction financière validée (`financial_transactions`).
- **MC-07.5 : Comptabilité de trésorerie :** Enregistrement des flux (`INCOME`, `EXPENSE`, `ADJUSTMENT`) avec référence du trésorier et trace de validation. Impossibilité d'effacer une transaction comptabilisée sans écriture d'annulation.
- **MC-07.6 : Cloisonnement strict :** Les responsables d'une communauté hôte ne peuvent en aucun cas consulter les finances internes d'une association partenaire sans rôle associatif explicite.

### MC-08 — Administration, Sécurité et Audit
- **MC-08.1 : RBAC Contextuel par ressource :** Toute opération est validée sur le quadruplet `(Identité, Ressource, Appartenance, Permission)`.
- **MC-08.2 : Journal d'audit centralisé :** Enregistrement immuable des actions critiques dans `audit_logs` (acteur, action, cible, métadonnées JSONB, timestamp UTC).
- **MC-08.3 : Traitement des signalements :** Workflow complet de modération (`OPEN` -> `REVIEWING` -> `RESOLVED` / `DISMISSED`).

### MC-09 — Notifications et Mode Hors Ligne
- **MC-09.1 : Notifications in-app :** Flux de notifications typées avec charge utile JSONB et marquage de lecture (`read_at`).
- **MC-09.2 : Mode consultation hors ligne :** Mise en cache local sur le client mobile/web des données déjà consultées.
- **MC-09.3 : Sécurité du cache :** Expiration TTL des données en cache, purge immédiate des données privées à la déconnexion, aucun mot de passe ni pièce confidentielle stocké en clair.

---

## 3. Matrice de Traçabilité des Exigences et Acteurs

| Exigence | Visiteur | Utilisateur | Membre | Resp. Com. | Resp. Asso | Trésorier | Modérateur | Admin Plat. |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MC-01** Profil & Compte | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-02** Proposer Communauté | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-02** Valider Communauté | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **MC-03** Adhérer Communauté | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-03** Valider Adhésion | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ (Secours) |
| **MC-04** Consulter Fil Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-04** Publier dans Communauté | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-05** Créer Association | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MC-05** Rattacher Communauté | ❌ | ❌ | ❌ | Accord | ✅ | ❌ | ❌ | ✅ |
| **MC-07** Gérer Cotisations | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **MC-07** Consulter Rapports Fin. | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | Audit |
| **MC-08** Modérer Contenus | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |

---

## 4. Critères d'Acceptation du MVP (Checklist Officielle 18/18)

| N° | Domaine | Critère d'Acceptation Formel | Statut Requis |
| :---: | :--- | :--- | :---: |
| 1 | **Communautés** | Un habitant peut proposer une communauté et suivre l'évolution de son statut. | ✅ Validé |
| 2 | **Communautés** | Une communauté non approuvée ne donne accès à aucun espace membre actif. | ✅ Validé |
| 3 | **Communautés** | Seul un administrateur habilité peut approuver une proposition de communauté. | ✅ Validé |
| 4 | **Communautés** | Un utilisateur peut demander à rejoindre plusieurs communautés de manière indépendante. | ✅ Validé |
| 5 | **Associations** | Une association peut être rattachée à plusieurs communautés sans être dupliquée en base. | ✅ Validé |
| 6 | **Associations** | Les demandes d'adhésion associative sont indépendantes des adhésions communautaires. | ✅ Validé |
| 7 | **Associations** | Un membre ordinaire ou un responsable communautaire ne peut accéder aux finances sans rôle associatif explicite. | ✅ Validé |
| 8 | **Réseau Social** | Le fil général regroupe uniquement les contenus autorisés des communautés actives rejointes. | ✅ Validé |
| 9 | **Réseau Social** | Le fil d'une communauté applique strictement les règles de visibilité de cette communauté. | ✅ Validé |
| 10 | **Réseau Social** | Une publication privée reste inaccessible à un non-membre, même via son URL directe (test IDOR). | ✅ Validé |
| 11 | **Finances** | Une cotisation peut être réglée en plusieurs versements successifs. | ✅ Validé |
| 12 | **Finances** | Le solde restant dû d'une cotisation est calculé dynamiquement à partir des montants attendus et reçus. | ✅ Validé |
| 13 | **Finances** | Une opération financière confirmée ne peut pas être supprimée physiquement sans trace d'annulation. | ✅ Validé |
| 14 | **Finances** | Les rapports de trésorerie sont réservés aux rôles autorisés (Trésorier, Président, Managers). | ✅ Validé |
| 15 | **Sécurité** | Les tests d'intégration valident l'isolation hermétique entre deux communautés distinctes. | ✅ Validé |
| 16 | **Sécurité** | Une adhésion suspendue révoque immédiatement tous les accès privés en ligne. | ✅ Validé |
| 17 | **Hors Ligne** | Les contenus préalablement chargés restent consultables hors connexion selon la politique de cache. | ✅ Validé |
| 18 | **Hors Ligne** | La déconnexion déclenche la purge effective des données privées mises en cache local. | ✅ Validé |
