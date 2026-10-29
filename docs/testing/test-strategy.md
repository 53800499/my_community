# My Community — Stratégie d'Assurance Qualité et Matrice des Tests Automatisés

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Stack de test :** Jest · Supertest · Testcontainers (PostgreSQL réel) · Playwright · React Native Testing Library / Maestro  

---

## 1. Cadre Général d'Assurance Qualité

Le plan d'assurance qualité repose sur l'adage fondamental : **aucune fonctionnalité n'est considérée comme achevée sans sa batterie de tests automatisés**.

L'accent est mis en priorité sur la non-régression de l'isolation logique des données :
- Isolation stricte entre communautés distinctes.
- Isolation des données financières associatives.
- Immutabilité des écritures comptables confirmées.
- Révocation effective des accès lors d'une suspension.
- Purge systématique des données privées en cache local à la déconnexion.

---

## 2. Référentiel des Suites de Tests par Module

### 2.1 Tests Unitaires & Services Métier (Jest)
- `COM-U01` à `COM-U10` : Workflow complet des propositions et adhésions communautaires.
- `ASSO-U01` à `ASSO-U08` : Gestion de l'entité unique multi-rattachée et étanchéité des rôles.
- `SOC-U01` à `SOC-U07` : Filtrage côté serveur du fil général agrégé et des commentaires.
- `FIN-U01` à `FIN-U08` : Calculs de solde sur cotisations échelonnées et interdiction des écritures négatives ou orphelines.

### 2.2 Tests d'Intégration & Persistance PostgreSQL (`Supertest` + `Testcontainers`)
- `DB-01` : Approbation transactionnelle atomique (Proposition -> Communauté -> Manager -> Audit).
- `DB-03` : Vérification de la contrainte d'unicité `(community_id, user_id)` sur adhésions concurrentes.
- `DB-07` : Prévention des dépassements sur paiements simultanés avec verrouillage optimiste/pessimiste.
- `DB-08` : Rejet des suppressions directes de transactions au statut `POSTED`.
- `DB-09` : Validation de l'exécution intégrale des migrations DDL sur une base vierge.

### 2.3 Tests de Sécurité et d'Isolation (Anti-IDOR & RBAC)
- `SEC-01` à `SEC-10` : Tentatives de contournement des droits, élévation de privilèges dans le JSON, appels directs avec token révoqué, et consultation non autorisée des rapports financiers.
- Vérification que PostgreSQL RLS (`Row-Level Security`) bloque les requêtes non conformes même si le filtre applicatif était omis.

### 2.4 Tests End-to-End (Playwright & Mobile)
- `E2E-01` : Parcours habitant -> proposition -> validation admin -> activation de communauté.
- `E2E-02` : Adhésions indépendantes à plusieurs communautés.
- `E2E-04` : Validation visuelle et réseau de l'agrégation du fil général.
- `E2E-05` : Saisie de cotisations multi-versements et vérification du solde.
- `E2E-06` : Rejet de la consultation financière pour un utilisateur ordinaire.

### 2.5 Tests du Cache Hors Ligne & Sécurité Mobile
- `OFF-01` à `OFF-08` : Consultation des contenus en cache après déconnexion réseau, affichage du bandeau de cache, et purge intégrale de la base locale lors d'une déconnexion ou d'un changement de compte.

---

## 3. Matrice de Priorisation des Tests (Roadmap QA)

| Niveau | Domaine | Impact Qualité | Bloquant en CI |
| :---: | :--- | :--- | :---: |
| **P0** | Sécurité RBAC, Isolation des communautés et des finances, RLS | Critique — Tolérance zéro fuite de données | ✅ Oui |
| **P0** | Intégrité des calculs financiers et concurrence des paiements | Critique — Exactitude comptable en XOF | ✅ Oui |
| **P1** | Approbation atomique des communautés et cycle de vie des adhésions | Élevé — Stabilité des processus centraux | ✅ Oui |
| **P1** | Migrations DDL de base de données depuis zéro | Élevé — Déploiements sans interruption | ✅ Oui |
| **P2** | Parcours E2E sociaux (publications, likes, commentaires, événements) | Moyen — Expérience utilisateur nominale | ✅ Oui |
| **P3** | Tests de cache hors ligne et scénarios multiplateformes | Confort & Résilience réseau | ⚠️ Recommandé |
