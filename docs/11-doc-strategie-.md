# My Community — Stratégie Produit, Adoption et Gouvernance Territoriale

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document cible :** Comité de Direction, Responsables Territoriaux & Product Managers  

---

## 1. Contexte Territorial et Stratégie d'Ancrage Local

**My Community** a vocation à répondre aux besoins d'organisation communautaire et associative en Afrique de l'Ouest, avec un premier ancrage pilote au Bénin.

### Facteurs Clés d'Adoption Locale :
- **Usage prédominant du smartphone :** Priorité absolue à l'application mobile Flutter, légère et performante sur les terminaux Android standards.
- **Connectivité intermittente :** Prise en compte des zones blanches ou des coupures de données via le cache de consultation hors ligne.
- **Monnaie par défaut :** Le Franc CFA (`XOF`) est la devise socle du système financier associatif.
- **Modèle de confiance :** La validation humaine des communautés par les administrateurs prévient les arnaques et préserve la crédibilité du réseau.

---

## 2. Les 4 Décisions Majeures à Figer Avant la Première Migration

Conformément au document de référence de cadrage, ces quatre orientations stratégiques doivent être arrêtées pour stabiliser les règles d'implémentation finale :

### 2.1 Identité et Niveau de Vérification
- **Canal de connexion :** Validation de l'authentification conjointe par Téléphone (SMS OTP) et par E-mail.
- **Justificatifs d'adhésion :** Définir si certaines communautés sensibles (ex: syndicats de copropriétaires, comités villageois officiels) exigeront un justificatif de domicile ou de filiation téléversé lors de la demande d'adhésion.

### 2.2 Gouvernance et Continuité des Communautés
- **Procédure de succession :** Mécanisme de révocation et de remplacement d'un Responsable Communautaire inactif ou démissionnaire.
- **Traitement des communautés en sommeil :** Archivage automatique après 12 mois sans publication ni adhésion active.
- **Procédure de recours :** Possibilité pour un habitant dont la proposition a été rejetée de solliciter un réexamen avec nouvelles pièces.

### 2.3 Rigueur Comptable Associative
- **Séparation des pouvoirs :** Obligation ou option d'une double validation (saisie par le Trésorier, validation formelle par le Président) pour les décaissements (`EXPENSE`) supérieurs à un seuil défini.
- **Principe d'ajustement :** Interdiction absolue de modification d'une écriture comptabilisée (`status = 'POSTED'`). Toute correction s'effectue par une écriture d'ajustement inverse (`ADJUSTMENT`).

### 2.4 Confidentialité et Protection des Données Personnelles
- **Paramètres de visibilité par défaut :** Profils paramétrés par défaut en visibilité restreinte aux membres des communautés rejointes.
- **Droit à l'oubli et fermeture :** Clôture du compte utilisateur avec anonymisation des publications historiques pour préserver la cohérence des fils de discussion collectifs.
