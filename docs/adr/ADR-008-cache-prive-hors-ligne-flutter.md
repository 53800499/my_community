# ADR-008 : Politique de Cache Privé et Comportement Hors Ligne Mobile (Flutter)

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Dans les régions cibles (Afrique de l'Ouest / Bénin), la connectivité mobile est parfois intermittente. Les utilisateurs doivent pouvoir continuer à lire leurs publications et consulter les annuaires d'associations même sans Internet. Cependant, un cache local mal contrôlé présente un risque sévère de sécurité en cas de révocation d'adhésion, de perte de terminal ou de changement d'utilisateur.

## Décision
1. **Périmètre restreint :** Consultation seule des contenus préalablement téléchargés. Aucune mutation hors ligne (création de post, paiement, demande d'adhésion) dans le MVP.
2. **Technologie locale :** Utilisation d'une base locale SQLite typée via **Drift** pour l'application Flutter.
3. **Exclusion des données sensibles :** Les informations bancaires, les rapports financiers associatifs et les mots de passe ne sont **jamais stockés** dans le cache local.
4. **Purge systématique :** La déconnexion explicite ou le basculement vers un autre compte utilisateur déclenche une suppression intégrale de la base locale de cache privé.
5. **Indication visuelle :** Affichage d'un bandeau explicite signalant à l'utilisateur que l'affichage est en mode déconnecté.

## Conséquences
- **Positives :**
  - Expérience utilisateur fluide en zones de faible connectivité.
  - Risque d'exposition de données privées minimisé en cas de suspension de compte ou de cession du terminal.
- **Négatives :**
  - Impossibilité pour un utilisateur déconnecté de poster un message ou d'enregistrer une cotisation avant d'avoir retrouvé le réseau.
