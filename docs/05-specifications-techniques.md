# My Community — Spécifications Techniques Détaillées

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document cible :** Développeurs Backend, Frontend, QA & Data Engineers  

---

## 1. Conventions de Données et Standards Techniques

### 1.1 Types et Formats des Données
- **Identifiants uniques :** Utilisation systématique d'identifiants universels **UUID v4** (`gen_random_uuid()` natif PostgreSQL). Aucun identifiant auto-incrémenté séquentiel n'est exposé afin d'éviter toute énumération d'IDOR.
- **Horodatage et Fuseaux :** Stockage de toutes les dates en `TIMESTAMPTZ` (UTC). Les clients affichent les dates converties selon le fuseau local de l'utilisateur (ex: `Africa/Porto-Novo` - UTC+1).
- **Montants et Devises :** Types monétaires définis en `NUMERIC(14,2)`. L'utilisation des types flottants (`FLOAT`, `DOUBLE`) est formellement prohibée pour éliminer toute erreur d'arrondi. La devise est obligatoire et stockée sur 3 caractères (`CHAR(3)` - défaut : `XOF`).
- **Nomenclature :**
  - Base de données : `snake_case` pour les tables, colonnes et contraintes.
  - API JSON : `camelCase` pour les propriétés JSON échangées.
  - Classes & Entités de code : `PascalCase`.
- **Pagination :** Pagination basée sur curseur (`cursor-based pagination` via `id` et `created_at` / `published_at`) pour les fils d'actualités et grands annuaires.

---

## 2. Intégrité Transactionnelle et Règles Métier Backend

Toutes les opérations sensibles doivent être exécutées au sein de transactions PostgreSQL en isolation `READ COMMITTED` ou `SERIALIZABLE` selon la criticité.

### 2.1 Transaction de Validation d'une Proposition de Communauté
Lorsqu'un administrateur approuve une proposition (`community_proposals`), le service applicatif doit exécuter dans une transaction atomique unique :
1. Vérification que la proposition est toujours à l'état `PENDING`.
2. Mise à jour de `community_proposals` : `status = 'APPROVED'`, `reviewed_by = admin_id`, `reviewed_at = now()`.
3. Génération du `slug` unique normalisé.
4. Insertion de la nouvelle ligne dans `communities` (`approved_proposal_id = proposal.id`).
5. Création automatique de la première adhésion (`community_memberships`) pour le responsable désigné (`status = 'ACTIVE'`).
6. Attribution du rôle `MANAGER` dans `community_membership_roles`.
7. Insertion dans `audit_logs` avec l'événement `COMMUNITY_PROPOSAL_APPROVED`.

### 2.2 Transaction d'Enregistrement de Paiement de Cotisation
Lors de la saisie d'un versement de cotisation pour un membre associatif :
1. Vérification de l'existence de l'appel de cotisation (`member_dues`) et de l'adhésion active du membre.
2. Création de la transaction financière d'entrée (`financial_transactions`) avec `type = 'INCOME'`, `amount`, `currency = 'XOF'`, `status = 'POSTED'`, `recorded_by = user_id`.
3. Création du versement (`contribution_payments`) associant le `due_id` et le `transaction_id`.
4. Calcul automatique du cumul des versements pour cette cotisation :
   $$\text{Solde restant} = \text{amount\_due} - \sum \text{contribution\_payments.amount}$$
5. Enregistrement dans `audit_logs` avec les métadonnées de la transaction.

---

## 3. Stockage Sécurisé des Fichiers et Pièces Jointes

### 3.1 Problématique et Risque
Les avatars, images de publication, procès-verbaux d'assemblées générales et reçus de versement financier ne doivent **jamais être stockés dans des dossiers publics non protégés** du serveur Web.

### 3.2 Solution Technique Retenue
- Stockage objet compatible S3 (ex: AWS S3, MinIO ou Cloudflare R2).
- Dans la base relationnelle, stockage uniquement de la clé d'objet (`avatar_key`, `attachment_key`).
- Pour les fichiers privés (reçus financiers, pièces d'identité) : consultation via **URLs pré-signées éphémères (Presigned URLs)** avec une durée de validité limitée à 15 minutes, générées uniquement après contrôle des permissions par l'API backend.

---

## 4. Format Standardisé des Réponses et Erreurs API

Toutes les erreurs de l'API suivent la norme standard **RFC 7807 (Problem Details for HTTP APIs)** :

```json
{
  "type": "https://api.mycommunity.local/errors/forbidden",
  "title": "Accès refusé au périmètre communautaire",
  "status": 403,
  "detail": "Votre adhésion à la communauté 'quartier-fidjrosse' est actuellement suspendue.",
  "instance": "/api/v1/communities/3fa85f64-5717-4562-b3fc-2c963f66afa6/posts",
  "code": "MEMBERSHIP_SUSPENDED",
  "timestamp": "2026-10-21T11:45:00.000Z"
}
```
