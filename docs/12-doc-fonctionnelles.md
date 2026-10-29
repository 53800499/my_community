# My Community — Synthèse Fonctionnelle Opérationnelle et Parcours Utilisateurs

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document cible :** Product Owners, Designers UX/UI, Équipes Support & Formateurs  

---

## 1. Parcours Utilisateur 1 : Le Nouvel Habitant

1. **Découverte et Inscription :**
   - Télécharge l'application mobile ou se rend sur le portail Web.
   - Crée son compte avec son numéro de téléphone ou son adresse e-mail.
   - Reçoit son code de validation et configure son nom d'affichage.
2. **Recherche de sa Communauté Locale :**
   - Navigue dans l'arborescence territoriale (ex: Bénin -> Littoral -> Cotonou -> Fidjrossè).
   - Trouve la communauté de son quartier et clique sur *"Demander à rejoindre"*.
   - Sa demande passe à l'état `PENDING`.
3. **Activation et Consultation :**
   - Dès l'approbation par le Responsable Communautaire, l'habitant reçoit une notification in-app.
   - Son adhésion passe à l'état `ACTIVE`. Il accède immédiatement au fil d'actualité local et aux événements privés.
4. **Fil Général Personnalisé :**
   - L'habitant rejoint plus tard la communauté de son village d'origine.
   - Son **Fil Général** regroupe désormais harmonieusement les nouvelles de son quartier et de son village sans quitter son application.

---

## 2. Parcours Utilisateur 2 : L'Initiateur de Communauté

1. **Proposition citoyenne :**
   - Dans une commune non encore couverte, l'habitant remplit le formulaire de proposition : nom de la communauté, délimitation territoriale, présentation et motifs.
2. **Suivi d'instruction :**
   - L'utilisateur consulte l'état de son dossier (`PENDING`).
   - L'Administrateur de la plateforme analyse la cohérence géographique et l'absence de doublon.
3. **Officialisation :**
   - La proposition est approuvée (`APPROVED`). La communauté est créée automatiquement.
   - L'initiateur est désigné Responsable Communautaire (`MANAGER`) et peut commencer à valider les premières adhésions de ses voisins.

---

## 3. Parcours Utilisateur 3 : L'Association Multi-Communautés

1. **Création de la fiche associative :**
   - Une association caritative ou sportive dépose sa fiche unique sur la plateforme.
2. **Rattachements territoriaux multiples :**
   - L'association demande son rattachement à trois communautés urbaines différentes où elle déploie des actions.
   - Les trois communautés affichent l'association dans leur annuaire partenaire sans aucune duplication de données.
3. **Appel et Suivi des Cotisations :**
   - Le Trésorier configure un plan de cotisation annuelle de 12 000 XOF.
   - Il génère les appels de cotisation pour les adhérents.
   - Lorsqu'un membre verse 6 000 XOF en espèces, le Trésorier saisit la transaction, délivre une référence de reçu et le solde restant dû (6 000 XOF) s'ajuste instantanément.

---

## 4. Parcours Utilisateur 4 : L'Administrateur de Plateforme

1. **Tableau de bord d'instruction :**
   - Visualise les nouvelles propositions de communautés soumises sur le territoire national.
2. **Décision souveraine :**
   - Examine les doublons éventuels, valide les statuts et approuve ou formule une demande de complément d'information.
3. **Supervision et Sécurité :**
   - Accède au journal d'audit infalsifiable pour suivre les opérations suspectes, les signalements d'abus ou les suspensions administratives.
