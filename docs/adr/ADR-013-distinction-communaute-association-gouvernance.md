# ADR-013 : Distinction Fondamentale Communauté vs Association & Découplage Gouvernance / Permissions

- **Statut :** Accepté
- **Date :** 28 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
La confusion entre la notion de **communauté** et celle d'**association** crée des risques majeurs :
- Conflits de rôles et d'autorité dans les espaces numériques.
- Modèle d'adhésion ambigu (ex: supposer à tort qu'un membre d'un quartier est membre de toutes ses associations).
- Confusion entre droits d'administration de l'espace numérique My Community et mandat officiel statutaire (ex: créateur de l'espace s'auto-proclamant président).
- Couplage néfaste entre titres officiels (Président, Trésorier) et permissions techniques aveugles.

---

## Décisions Clés

### 1. Distinction Ontologique
- **La Communauté (Espace Social) :**
  - Espace de rassemblement, d'intérêt, d'identité collective ou de territoire (ex: *Habitants de Zogbadjè*, *Développeurs du Bénin*, *Étudiants de l'UAC*).
  - N'exige ni statuts officiels, ni bureau exécutif formel, ni cotisations financières obligatoires.
  - Rôles propres : `CREATOR`, `ADMINISTRATOR`, `MODERATOR`, `MEMBER`.
- **L'Association (Organisation Structurée) :**
  - Entité formelle régie par des statuts, un registre des adhérents, des cotisations et des obligations comptables/morales (ex: *Association des Jeunes de Zogbadjè*).
  - Possède un bureau exécutif (Président, Secrétaire Général, Trésorier, etc.) et des mandats électifs à durée définie.
  - Rôles et fonctions : gérés via le registre des mandats et le module `associations`.

### 2. Relation $N \times M$ Découplée
- Une association peut être liée à zéro, une ou plusieurs communautés (quartier, commune, réseau professionnel).
- **Règle d'or :** L'appartenance à une communauté ne confère **aucun droit ni adhésion automatique** aux associations liées.
- Réciproquement, une association peut recruter des adhérents issus de plusieurs communautés géographiques distinctes.

### 3. Triptyque « Créateur — Administrateur Technique — Président »
- **Créateur de l'espace numérique :** Utilisateur à l'origine de la fiche association sur My Community. Reçoit les droits d'administration technique initiaux de l'espace.
- **Administrateur technique de l'espace :** Gestionnaire des paramètres numériques, des accès et des configurations de la plateforme.
- **Président(e) officiel(le) :** Élu(e) ou nommé(e) selon les statuts légaux de l'organisation. Sa fonction requiert une investiture formelle et une conformité aux statuts.
- Le créateur de l'espace **ne devient pas automatiquement Président**. Il doit déclarer le bureau exécutif et procéder aux nominations statutaires parmi les membres adhérents.
- Procédure de passation de service et de transfert d'administration prévue pour assurer la pérennité numérique sans perte d'historique.

### 4. Découplage Postes de Gouvernance vs Permissions Techniques (RBAC Fines)
- Les permissions techniques ne sont pas directement calquées sur les titres honorifiques.
- Chaque rôle ou poste reçoit un ensemble précis et configurable de capacités :
  - *Président :* Supervision des activités, consultation des rapports autorisés, validation des actes d'orientation.
  - *Secrétaire Général :* Tenue des procès-verbaux, gestion documentaire, attestations et registres d'adhésion.
  - *Trésorier :* Gestion des encaissements de cotisations, dépenses, baux solidaires et rapports financiers (sans pouvoir d'administration technique du compte).
  - *Responsable Communication :* Émission des communiqués et opportunités.
  - *Administrateur Technique :* Configuration des accès et rôles autorisés (sans manipulation directe des comptes bancaires).

### 5. Statut d'Homologation : « Vérifiée » vs « Non Vérifiée »
- **Association Non Vérifiée :** Inscription ouverte et agile pour fédérer les initiatives citoyennes émergentes.
- **Association Déclarée / Vérifiée :** Validation documentaire préalable (récépissé officiel de déclaration, statuts certifiés). Obligatoire pour activer les modules financiers sensibles (collectes, cotisations avec prélèvements Mobile Money, baux étudiants solidaires).

---

## Conséquences

### Positives
- Architecture modulaire résiliente alignée sur le droit associatif et la gouvernance réelle au Bénin et en Afrique francophone.
- Sécurisation absolue des fonds et des mandats électifs.
- Aucune régression sur les modules gelés (`communities` au niveau L2, `associations` au niveau L3).
- Traçabilité intégrale des mandatures, quitus et passations de charge.

### Conformité SOLID & Hexagonale
- Respect strict du principe de responsabilité unique (SRP) : chaque agrégat gère son invariant.
- Inversion de dépendances (DIP) et ports de communication découplés.
