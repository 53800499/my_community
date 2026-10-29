# My Community — Spécification des APIs RESTful

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Format :** JSON RESTful  
**Sécurité :** `Authorization: Bearer <JWT_ACCESS_TOKEN>`  

---

## 1. Conventions Générales d'API

- **Préfixe des routes :** `/api/v1`
- **Codes retour standards :**
  - `200 OK` : Succès de la requête de lecture ou mise à jour.
  - `201 Created` : Création réussie d'une ressource.
  - `400 Bad Request` : Erreur de validation de formulaire / DTO.
  - `401 Unauthorized` : Jeton absent, expiré ou invalide.
  - `403 Forbidden` : Action refusée (rôle ou adhésion insuffisante dans le périmètre).
  - `404 Not Found` : Ressource inexistante ou confidentielle (pour éviter la fuite d'informations).
  - `409 Conflict` : Conflit d'état ou doublon d'adhésion.
  - `500 Internal Error` : Erreur serveur imprévue.

---

## 2. Référentiel des Endpoints par Module

### MC-01 : Identité et Profil
- `POST /api/v1/auth/register` : Inscription par email ou téléphone.
- `POST /api/v1/auth/login` : Authentification et délivrance des tokens.
- `POST /api/v1/auth/refresh` : Renouvellement du token d'accès via refresh token.
- `GET /api/v1/users/me` : Profil de l'utilisateur connecté et liste de ses adhésions actives.
- `PATCH /api/v1/users/me` : Mise à jour du profil (`display_name`, `avatar_key`, préférences).

### MC-02 : Territoires et Propositions de Communautés
- `GET /api/v1/territories` : Liste hiérarchique des territoires.
- `POST /api/v1/community-proposals` : Soumission d'une proposition par un habitant.
- `GET /api/v1/community-proposals/my` : Suivi de ses propres propositions.
- `GET /api/v1/admin/community-proposals` : Liste des propositions pour les administrateurs.
- `POST /api/v1/admin/community-proposals/:id/review` : Décision administrative (`APPROVED`, `REJECTED`, `NEEDS_INFO`) avec désignation du manager initial.

### MC-03 : Communautés et Adhésions
- `GET /api/v1/communities` : Recherche et exploration des communautés actives.
- `GET /api/v1/communities/:id` : Fiche détaillée d'une communauté.
- `POST /api/v1/communities/:id/memberships` : Demande d'adhésion (`PENDING`).
- `GET /api/v1/communities/:id/memberships` : Liste des membres (réservé aux gestionnaires/membres).
- `PATCH /api/v1/communities/:id/memberships/:userId` : Décision sur l'adhésion (`ACTIVE`, `REJECTED`, `SUSPENDED`).
- `POST /api/v1/communities/:id/memberships/:userId/roles` : Attribution de rôles (`MODERATOR`, `MANAGER`).

### MC-04 : Réseau Social et Fils d'Actualité
- `GET /api/v1/feed` : **Fil d'actualité général personnalisé** (agrégation des communautés actives de l'utilisateur).
- `GET /api/v1/communities/:id/feed` : Fil d'actualité spécifique à une communauté.
- `POST /api/v1/communities/:id/posts` : Création d'une publication (`PUBLIC` ou `MEMBERS`).
- `GET /api/v1/posts/:id` : Consultation unitaire d'une publication.
- `POST /api/v1/posts/:id/comments` : Ajout d'un commentaire.
- `POST /api/v1/posts/:id/reactions` : Ajout ou modification d'une réaction (`LIKE`, etc.).

### MC-05 : Associations et Multi-Rattachements
- `POST /api/v1/associations` : Déclaration d'une nouvelle association.
- `GET /api/v1/associations` : Annuaire public des associations.
- `GET /api/v1/associations/:id` : Fiche détaillée de l'association.
- `POST /api/v1/associations/:id/communities` : Rattachement à une communauté (`association_communities`).
- `POST /api/v1/associations/:id/memberships` : Demande d'adhésion associative.
- `POST /api/v1/associations/:id/memberships/:userId/roles` : Attribution des rôles associatifs (`PRESIDENT`, `TREASURER`, etc.).

### MC-06 : Événements
- `POST /api/v1/communities/:id/events` : Création d'un événement local.
- `GET /api/v1/communities/:id/events` : Liste des événements prévus.
- `POST /api/v1/events/:id/register` : Inscription d'un membre à un événement.

### MC-07 : Gestion Associative et Finances
- `POST /api/v1/associations/:id/contribution-plans` : Création d'un barème de cotisations.
- `GET /api/v1/associations/:id/contribution-plans` : Liste des plans de cotisations.
- `POST /api/v1/associations/:id/dues/generate` : Appel groupé des cotisations pour une période.
- `GET /api/v1/associations/:id/members/:userId/dues` : Situation des cotisations d'un membre.
- `POST /api/v1/associations/:id/dues/:dueId/payments` : Enregistrement d'un versement (trésorier).
- `GET /api/v1/associations/:id/financial-transactions` : Grand livre des recettes et dépenses.

### MC-08 : Modération et Journal d'Audit
- `POST /api/v1/reports` : Signalement d'un contenu ou comportement abusif.
- `GET /api/v1/reports` : Consultation des signalements dans son périmètre.
- `PATCH /api/v1/reports/:id` : Traitement d'un signalement (`RESOLVED`, `DISMISSED`).
- `GET /api/v1/admin/audit-logs` : Consultation des traces d'audit (réservé aux auditeurs/administrateurs).

### MC-09 : Notifications
- `GET /api/v1/notifications` : Liste des notifications reçues.
- `PATCH /api/v1/notifications/:id/read` : Marquage d'une notification comme lue.

---

## 3. Schémas et Formats de Données des Formulaires (OpenAPI / Swagger)

La documentation Swagger interactive disponible sur `/api/v1/docs` reflète exactement les contraintes suivantes :

### 3.1 Formulaire d'Inscription Citoyenne (`POST /api/v1/auth/register`)

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `phoneNumber` | `string` | **Oui** | E.164 (`^\+?[0-9\s\-()]{8,18}$`), min 8, max 18 | `+22997001122` | Numéro national béninois ou international. |
| `password` | `string` | **Oui** | Min. 8 caractères, type mot de passe | `MotDePasseSecurise2026!` | Mot de passe sécurisé haché en Scrypt (OWASP). |
| `email` | `string` | Non | Format RFC 5322 (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) | `citoyen@cotonou.bj` | Adresse email unique optionnelle. |

* **Code HTTP de succès :** `201 Created`
* **Corps de réponse (`AuthSuccessResponseDto`) :**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "d3b07384-d113-494b-9c8e-324b917d23a1",
      "phoneNumber": "+22997001122",
      "email": "citoyen@cotonou.bj",
      "status": "ACTIVE",
      "createdAt": "2026-10-22T10:00:00.000Z",
      "updatedAt": "2026-10-22T10:00:00.000Z"
    }
  }
  ```

---

### 3.2 Formulaire de Connexion Citoyenne (`POST /api/v1/auth/login`)

| Champ | Type | Obligatoire | Format / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `identifier` | `string` | **Oui** | Chaîne non vide (téléphone ou email) | `+22997001122` | Identifiant de connexion. |
| `password` | `string` | **Oui** | Chaîne non vide, type mot de passe | `MotDePasseSecurise2026!` | Mot de passe associé. |

* **Codes HTTP :** `200 OK`, `401 Unauthorized` (identifiants erronés), `403 Forbidden` (compte suspendu/verrouillé).

---

### 3.3 Consultation du Compte Connecté (`GET /api/v1/auth/me`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>` (bouton *Authorize* dans Swagger UI)
* **Code HTTP :** `200 OK`
* **Corps de réponse (`UserAccountResponseDto`) :**
  ```json
  {
    "id": "d3b07384-d113-494b-9c8e-324b917d23a1",
    "phoneNumber": "+22997001122",
    "email": "citoyen@cotonou.bj",
    "status": "ACTIVE",
    "createdAt": "2026-10-22T10:00:00.000Z",
    "updatedAt": "2026-10-22T10:00:00.000Z"
  }
  ```

---

### 3.4 Consultation des Territoires (`GET /api/v1/territories/roots` & `/:code`)

* **Types énumérés (`TerritoryType`) :**
  `COUNTRY`, `DEPARTMENT`, `COMMUNE`, `ARRONDISSEMENT`, `VILLAGE_QUARTIER`
* **Corps de réponse (`TerritoryResponseDto`) :**
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Bénin",
    "code": "BEN",
    "type": "COUNTRY",
    "parentId": null
  }
  ```

---

### 3.5 Mise à Jour du Profil Citoyen (`PATCH /api/v1/users/me`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`
* **Corps de requête (`UpdateProfileDto`) :**

| Champ | Type | Obligatoire | Format / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `firstName` | `string` | Non | Chaîne, min 2, max 100 caractères | `Amina` | Prénom du citoyen. |
| `lastName` | `string` | Non | Chaîne, min 2, max 100 caractères | `Koffi` | Nom de famille du citoyen. |
| `bio` | `string` | Non | Chaîne, max 1000 caractères | `Militante active pour le quartier Akpakpa.` | Biographie ou présentation personnelle. |
| `city` | `string` | Non | Chaîne, max 100 caractères | `Cotonou` | Ville de résidence. |
| `avatarKey` | `string` | Non | Chaîne, clé S3 ou URL | `avatars/u123.jpg` | Référence de la photo de profil. |

* **Code HTTP de succès :** `200 OK`
* **Corps de réponse (`UserProfileResponseDto`) :**
  ```json
  {
    "id": "7b3b4f62-e64e-4f76-857c-f127cb41d5b3",
    "userId": "d3b07384-d113-494b-9c8e-324b917d23a1",
    "firstName": "Amina",
    "lastName": "Koffi",
    "bio": "Militante active pour le quartier Akpakpa.",
    "city": "Cotonou",
    "avatarKey": "avatars/u123.jpg",
    "createdAt": "2026-10-22T10:00:00.000Z",
    "updatedAt": "2026-10-22T10:15:00.000Z"
  }
  ```

---

### 3.6 Centre de Notifications Citoyennes (`GET /api/v1/notifications` & `PATCH /:id/read`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`
* **Types énumérés (`NotificationType`) :**
  `INFO`, `ALERT`, `MEMBERSHIP_REQUEST`, `COMMUNITY_STATUS`, `SYSTEM`

#### Consultation des Notifications (`GET /api/v1/notifications`)
* **Paramètres de requête (Query) :**
  - `unreadOnly` (booléen, optionnel, défaut: `false`) : Filtrer uniquement les non lues.
* **Code HTTP :** `200 OK`
* **Corps de réponse (Tableau de `NotificationResponseDto`) :**
  ```json
  [
    {
      "id": "c76f6fa3-e380-4ec3-ba09-32219c62985f",
      "userId": "d3b07384-d113-494b-9c8e-324b917d23a1",
      "type": "COMMUNITY_STATUS",
      "title": "Proposition approuvée !",
      "message": "Votre proposition pour la communauté Akpakpa Centre a été validée avec succès.",
      "data": { "communityId": "e5b8e964-b63d-4c33-b4a1-0268595701a2" },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-10-22T10:30:00.000Z"
    }
  ]
  ```

#### Marquer une Notification comme Lue (`PATCH /api/v1/notifications/:id/read`)
* **Paramètre URL :** `id` (UUID de la notification)
* **Code HTTP :** `200 OK`
* **Corps de réponse :** Objet `NotificationResponseDto` avec `"isRead": true` et horodatage `"readAt"`.

---

### 3.7 Formulaire de Soumission d'une Proposition Citoyenne (`POST /api/v1/community-proposals`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`
* **Corps de requête (`SubmitProposalDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `name` | `string` | **Oui** | Min 2, max 150 caractères | `Akpakpa Centre` | Nom officiel souhaité pour la communauté citoyenne. |
| `description` | `string` | **Oui** | Min 10, max 2000 caractères | `Espace citoyen et d’échange pour les résidents et commerçants du quartier Akpakpa.` | Description de la portée et des objectifs. |
| `justification` | `string` | **Oui** | Min 10, max 2000 caractères | `Besoin d’un canal unifié pour coordonner les actions de propreté et la sécurité locale.` | Justification de l'intérêt public local. |
| `territoryId` | `string` | **Oui** | Format UUID v4 | `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d` | Identifiant du territoire de rattachement. |

* **Code HTTP de succès :** `201 Created`
* **Corps de réponse (`CommunityProposalResponseDto`) :**
  ```json
  {
    "id": "d9b2e841-8c4d-4b42-a279-994fbc266d51",
    "name": "Akpakpa Centre",
    "description": "Espace citoyen et d’échange pour les résidents et commerçants du quartier Akpakpa.",
    "justification": "Besoin d’un canal unifié pour coordonner les actions de propreté et la sécurité locale.",
    "territoryId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "proposedById": "d3b07384-d113-494b-9c8e-324b917d23a1",
    "status": "PENDING",
    "reviewedById": null,
    "reviewedAt": null,
    "rejectionReason": null,
    "createdAt": "2026-10-22T10:00:00.000Z"
  }
  ```

---

### 3.8 Formulaire d'Instruction Administrative d'une Proposition (`POST /api/v1/admin/community-proposals/:id/review`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>` (Rôle Administrateur Plateforme / Gestionnaire)
* **Paramètre URL :** `id` (UUID de la proposition)
* **Corps de requête (`ReviewProposalDto`) :**

| Champ | Type | Obligatoire | Format / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `decision` | `string` | **Oui** | `APPROVED` ou `REJECTED` | `APPROVED` | Décision administrative arbitrée. |
| `rejectionReason` | `string` | Conditionnel | Min 5, max 1000 caractères (obligatoire si `REJECTED`) | `Territoire déjà couvert par un espace actif.` | Motif explicatif notifié au citoyen proposant. |

* **Effet de bord en cas d'approbation (`APPROVED`) :**
  1. Transition de statut de la proposition vers `APPROVED`.
  2. Création automatique de l'entité `Community` active (`status = ACTIVE`, génération du `slug` normalisé).
  3. Notification in-app temps réel délivrée au citoyen proposant via `notifications`.
  4. Tracé d'audit immuable consigné via `audit`.
* **Code HTTP de succès :** `200 OK`
* **Corps de réponse :** Objet `CommunityProposalResponseDto` mis à jour.

---

### 3.9 Demande et Consultation des Adhésions Communautaires (`POST` & `GET /api/v1/communities/:id/memberships`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`
* **Paramètre URL :** `id` (UUID de la communauté)

#### Demande d'Adhésion Citoyenne (`POST /api/v1/communities/:id/memberships`)
* Crée une adhésion en état `PENDING` avec le rôle `MEMBER` pour l'utilisateur connecté.
* **Codes HTTP :** `201 Created`, `404 Not Found` (communauté inexistante), `409 Conflict` (adhésion déjà existante).
* **Corps de réponse (`MembershipResponseDto`) :**
  ```json
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "communityId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "d3b07384-d113-494b-9c8e-324b917d23a1",
    "status": "PENDING",
    "roles": ["MEMBER"],
    "joinedAt": "2026-10-22T10:00:00.000Z",
    "updatedAt": "2026-10-22T10:00:00.000Z"
  }
  ```

#### Consultation des Membres (`GET /api/v1/communities/:id/memberships`)
* **Paramètre de requête (Query) :** `status` (optionnel : `PENDING`, `ACTIVE`, `SUSPENDED`, `REVOKED`)
* **Code HTTP :** `200 OK`
* **Corps de réponse :** Tableau de `MembershipResponseDto`.

---

### 3.10 Gestion des Adhésions et Rôles Locaux (Contextual RBAC)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`

#### Décision sur une Adhésion (`PATCH /api/v1/communities/:id/memberships/:userId`)
* **Autorisation requise :** Rôle `MANAGER` ou `ADMIN` au sein de la communauté.
* **Corps de requête (`DecideMembershipDto`) :**

| Champ | Type | Obligatoire | Format / Valeurs autorisées | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `decision` | `string` | **Oui** | `ACTIVE`, `SUSPENDED`, `REVOKED` | `ACTIVE` | Nouveau statut d'affiliation de l'adhérent. |

* **Code HTTP :** `200 OK`

#### Attribution ou Retrait d'un Rôle Local (`POST /api/v1/communities/:id/memberships/:userId/roles`)
* **Autorisation requise :** Rôle `ADMIN` au sein de la communauté.
* **Corps de requête (`AssignRoleDto`) :**

| Champ | Type | Obligatoire | Format / Valeurs autorisées | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `role` | `string` | **Oui** | `MEMBER`, `MODERATOR`, `MANAGER`, `ADMIN` | `MODERATOR` | Rôle contextuel local à modifier. |
| `action` | `string` | **Oui** | `ADD` ou `REMOVE` | `ADD` | Action d'attribution ou de révocation du rôle. |

* **Code HTTP :** `200 OK`
* **Corps de réponse :** Objet `MembershipResponseDto` avec la liste mise à jour des rôles.

---

### 3.11 Gestion des Associations et Rattachements Multi-Communautaires (`/api/v1/associations`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`

#### Création d'une Association (`POST /api/v1/associations`)
* **Autorisation requise :** Utilisateur authentifié (l'utilisateur devient automatiquement `PRESIDENT` et membre fondateur de l'association).
* **Corps de requête (`RegisterAssociationDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `name` | `string` | **Oui** | Min. 2, Max. 120 caractères | `Amicale des Résidents de Cotonou` | Dénomination officielle de l'association. |
| `registrationNumber` | `string` | Non | Max. 100 caractères (N° récépissé préfectoral / JO) | `2026/045/DEP-LIT/SG/SAG-D1` | Numéro d'enregistrement légal. |
| `description` | `string` | Non | Texte libre descriptif | `Association d'entraide et d'animation communautaire.` | Objet social et activités. |
| `logoUrl` | `string` | Non | Format URL valide (`https://...`) | `https://cdn.mycommunity.bj/logos/asso-1.png` | Logo officiel de l'association. |
| `address` | `string` | Non | Texte libre | `Quartier Akpakpa, Lot 102` | Siège social ou adresse postale. |
| `phone` | `string` | Non | E.164 (`^\+?[0-9\s\-()]{8,18}$`) | `+22997112233` | Téléphone officiel de contact. |
| `email` | `string` | Non | Format RFC 5322 (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) | `contact@amicale-cotonou.bj` | Adresse email de contact. |
| `website` | `string` | Non | Format URL valide (`https://...`) | `https://amicale-cotonou.bj` | Site web officiel. |
| `communityIds` | `string[]` | Non | Tableau d'UUIDs valides | `["550e8400-e29b-41d4-a716-446655440000"]` | Communautés initiales à rattacher. |

* **Code HTTP :** `201 Created`
* **Corps de réponse (`AssociationResponseDto`) :**
  ```json
  {
    "id": "770e8400-e29b-41d4-a716-446655440099",
    "name": "Amicale des Résidents de Cotonou",
    "registrationNumber": "2026/045/DEP-LIT/SG/SAG-D1",
    "description": "Association d'entraide et d'animation communautaire.",
    "logoUrl": "https://cdn.mycommunity.bj/logos/asso-1.png",
    "address": "Quartier Akpakpa, Lot 102",
    "phone": "+22997112233",
    "email": "contact@amicale-cotonou.bj",
    "website": "https://amicale-cotonou.bj",
    "isActive": true,
    "createdAt": "2026-10-22T11:00:00.000Z",
    "updatedAt": "2026-10-22T11:00:00.000Z",
    "communities": [
      {
        "communityId": "550e8400-e29b-41d4-a716-446655440000",
        "isPrimary": true,
        "linkedAt": "2026-10-22T11:00:00.000Z"
      }
    ]
  }
  ```

#### Liste et Recherche d'Associations (`GET /api/v1/associations`)
* **Paramètres Query :**
  - `search` (optionnel, texte de recherche sur le nom ou le n° légal)
  - `communityId` (optionnel, UUID pour filtrer les associations affiliées à une communauté)
* **Code HTTP :** `200 OK`
* **Corps de réponse :** Tableau de `AssociationResponseDto`.

#### Consultation d'une Association (`GET /api/v1/associations/:id`)
* **Paramètre URL :** `id` (UUID de l'association)
* **Codes HTTP :** `200 OK`, `404 Not Found`.

#### Rattachement d'une Association à une Communauté (`POST /api/v1/associations/:id/communities/:communityId`)
* **Autorisation requise :** Rôle `PRESIDENT` dans l'association ou Administrateur plateforme.
* **Corps de requête (`LinkCommunityDto`) :**

| Champ | Type | Obligatoire | Format / Valeurs autorisées | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `isPrimary` | `boolean` | Non | `true` ou `false` (défaut: `false`) | `true` | Définit si cette communauté est le périmètre principal. |

* **Code HTTP :** `201 Created`

#### Gestion des Membres et Rôles Associatifs (`POST /api/v1/associations/:id/members`)
* **Autorisation requise :** Rôle `PRESIDENT` au sein de l'association.
* **Corps de requête (`ManageAssociationMemberDto`) :**

| Champ | Type | Obligatoire | Format / Valeurs autorisées | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `userId` | `string` | **Oui** | UUID v4 | `d3b07384-d113-494b-9c8e-324b917d23a1` | Identifiant du membre concerné. |
| `action` | `string` | **Oui** | `ADD` ou `REMOVE` | `ADD` | Action d'ajout ou de retrait de l'association. |
| `role` | `string` | Non | `PRESIDENT`, `TREASURER`, `SECRETARY`, `MEMBER` | `TREASURER` | Rôle conféré au membre dans l'association. |

* **Codes HTTP :** `200 OK` (retrait), `201 Created` (ajout).

---

### 3.12 Gestion du Parc Immobilier et des Résidences / Logements (ADR-010) (`/api/v1/residences`)

* **En-tête requis :** `Authorization: Bearer <TOKEN_JWT>`
* **Architecture temporelle (ADR-010) :** Découplage strict entre l'identité des résidents et les chambres physiques via l'entité pivot `RoomOccupation`.

#### 1. Création d'un Quartier / Campus (`POST /api/v1/residences/quarters`)
* **Corps de requête (`CreateQuarterDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `associationId` | `string` | **Oui** | UUID v4 | `770e8400-e29b-41d4-a716-446655440099` | Association gestionnaire du campus. |
| `name` | `string` | **Oui** | Min. 2, Max. 120 caractères | `Campus d’Abomey-Calavi (UAC)` | Nom du campus ou site résidentiel. |
| `city` | `string` | **Oui** | Min. 2, Max. 100 caractères | `Abomey-Calavi` | Ville d'implantation. |
| `description` | `string` | Non | Texte libre | `Foyer universitaire principal et résidences affiliées.` | Description ou historique. |

* **Code HTTP :** `201 Created`
* **Corps de réponse (`QuarterResponseDto`) :**
  ```json
  {
    "id": "880e8400-e29b-41d4-a716-446655440011",
    "associationId": "770e8400-e29b-41d4-a716-446655440099",
    "name": "Campus d’Abomey-Calavi (UAC)",
    "city": "Abomey-Calavi",
    "description": "Foyer universitaire principal et résidences affiliées.",
    "createdAt": "2026-10-22T10:00:00.000Z",
    "updatedAt": "2026-10-22T10:00:00.000Z"
  }
  ```

#### 2. Création d'un Bâtiment (`POST /api/v1/residences/buildings`)
* **Corps de requête (`CreateBuildingDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `quarterId` | `string` | **Oui** | UUID v4 | `880e8400-e29b-41d4-a716-446655440011` | UUID du quartier parent. |
| `name` | `string` | **Oui** | Min. 2, Max. 100 caractères | `Pavillon A - Hassan II` | Nom ou libellé du bâtiment/villa. |
| `address` | `string` | **Oui** | Texte libre | `Rue 210, Parcelle B, Zogbadjè` | Adresse physique exhaustive. |
| `landlordName` | `string` | **Oui** | Min. 2, Max. 120 caractères | `Dossou Koffi Félix` | Nom du propriétaire / bailleur légal. |
| `landlordPhone` | `string` | Non | E.164 (`^\+?[0-9\s\-()]{8,18}$`) | `+22997001122` | Téléphone direct du bailleur. |
| `landlordIbanOrMomo` | `string` | Non | Max. 80 caractères | `MoMo MTN +22997001122 (Dossou Koffi)` | Coordonnées de règlement du loyer bailleur. |
| `floorsCount` | `number` | Non | Entier $\ge 1$ (défaut : 1) | `2` | Nombre total d'étages du bâtiment. |

* **Code HTTP :** `201 Created`

#### 3. Création d'une Chambre Physique (`POST /api/v1/residences/rooms`)
* **Corps de requête (`CreateRoomDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `buildingId` | `string` | **Oui** | UUID v4 | `990e8400-e29b-41d4-a716-446655440022` | Bâtiment dans lequel se trouve la chambre. |
| `roomNumber` | `string` | **Oui** | Min. 1, Max. 50 caractères | `CH-102` | Numéro ou identifiant de porte unique. |
| `capacity` | `number` | Non | Entier $1 \le N \le 20$ (défaut : 1) | `2` | Capacité maximale d'accueil en lits. |

* **Codes HTTP :** `201 Created`, `409 Conflict` (numéro en doublon dans le bâtiment).

#### 4. Attribution d'une Chambre à un Résident (`POST /api/v1/residences/occupations`)
* **Règle métier ADR-010 :** Vérifie que la capacité de la chambre n'est pas dépassée et que l'utilisateur n'a pas déjà un logement actif. Émet l'événement `residence.room_occupied` pour le déclenchement des frais d'intégration par le module finance.
* **Corps de requête (`AssignRoomOccupationDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `roomId` | `string` | **Oui** | UUID v4 | `aa0e8400-e29b-41d4-a716-446655440033` | Chambre attribuée. |
| `occupantUserId` | `string` | **Oui** | UUID v4 | `d3b07384-d113-494b-9c8e-324b917d23a1` | Compte utilisateur de l'occupant. |
| `associationId` | `string` | **Oui** | UUID v4 | `770e8400-e29b-41d4-a716-446655440099` | Association titulaire du bail. |
| `startDate` | `string` | **Oui** | Format ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) | `2026-11-01T00:00:00.000Z` | Date d'entrée en vigueur de l'occupation. |
| `endDate` | `string` | Non | Format ISO 8601 | `2027-06-30T00:00:00.000Z` | Date prévisionnelle de fin de séjour. |

* **Codes HTTP :** `201 Created`, `404 Not Found`, `409 Conflict` (chambre pleine, en maintenance ou résident déjà logé).
* **Corps de réponse (`RoomOccupationResponseDto`) :**
  ```json
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440044",
    "roomId": "aa0e8400-e29b-41d4-a716-446655440033",
    "occupantUserId": "d3b07384-d113-494b-9c8e-324b917d23a1",
    "associationId": "770e8400-e29b-41d4-a716-446655440099",
    "startDate": "2026-11-01T00:00:00.000Z",
    "endDate": "2027-06-30T00:00:00.000Z",
    "isActive": true,
    "status": "ACTIVE",
    "createdAt": "2026-10-22T10:00:00.000Z",
    "updatedAt": "2026-10-22T10:00:00.000Z"
  }
  ```

#### 5. Clôture / Résiliation de Bail (`PATCH /api/v1/residences/occupations/:id/terminate`)
* **Paramètre URL :** `id` (UUID de l'occupation)
* **Corps de requête (`TerminateRoomOccupationDto`) :**

| Champ | Type | Obligatoire | Format / Regex / Contraintes | Exemple | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `endDate` | `string` | Non | Format ISO 8601 (défaut : date actuelle) | `2026-12-31T23:59:59.000Z` | Date de sortie effective. |

* **Code HTTP :** `200 OK` (libère automatiquement la place dans la chambre et repasse la chambre en `AVAILABLE` si la capacité le permet).

#### 6. Consultation et Recherche d'Occupations (`GET /api/v1/residences/occupations`)
* **Paramètres Query :**
  - `associationId` (optionnel, UUID)
  - `roomId` (optionnel, UUID)
  - `occupantUserId` (optionnel, UUID)
  - `isActive` (optionnel, booléen `true` ou `false`)
* **Code HTTP :** `200 OK`



