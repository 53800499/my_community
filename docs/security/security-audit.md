# My Community — Politique de Sécurité, Matrice RBAC et Audit

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document de Référence Détaillé :** [Spécification Complète des Rôles & RBAC](file:///c:/Sikirou/eskay/my_community/docs/security/roles-et-permissions-rbac.md)

---

## 1. Matrice Officielle des Permissions

| Action Système | Visiteur | Membre | Responsable Communauté | Trésorier Asso | Admin Plateforme |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Voir les informations publiques | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui |
| Voir les publications privées | ❌ Non | ✅ (dans ses communautés) | ✅ (dans son périmètre) | ✅ (si membre) | ⚠️ Selon besoin |
| Proposer une communauté | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui |
| Approuver une communauté | ❌ Non | ❌ Non | ❌ Non | ❌ Non | ✅ Oui |
| Valider une adhésion communautaire | ❌ Non | ❌ Non | ✅ (si manager) | ❌ Non | ⚠️ Secours |
| Créer une association | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui |
| Gérer les membres associatifs | ❌ Non | ❌ Non | ❌ Non | ⚠️ Selon délégation | ⚠️ Selon politique |
| Enregistrer une cotisation | ❌ Non | ❌ Non | ❌ Non | ✅ Oui | ❌ Non |
| Consulter les rapports financiers | ❌ Non | ❌ Non | ❌ Non | ✅ Oui | ⚠️ Selon audit |
| Traiter un signalement | ❌ Non | ❌ Non | ✅ (dans sa communauté)| ❌ Non | ✅ Oui |

---

## 2. Principes Impératifs de Sécurité

1. **Défense en profondeur :** Ne jamais se fier aux assertions du client frontend. Toutes les autorisations sont revalidées à chaque requête côté backend.
2. **Protection contre l'IDOR (Insecure Direct Object References) :** Tout accès direct par identifiant UUID est systématiquement filtré par les droits d'appartenance à la communauté ou l'association parente.
3. **Immutabilité de l'audit :** La table `audit_logs` est en écriture seule (`INSERT` uniquement). Aucun `UPDATE` ou `DELETE` n'est autorisé pour préserver la valeur probante légale.
4. **Sécurité du stockage hors ligne :**
   - Aucune donnée bancaire, mot de passe ou pièce confidentielle n'est mise en cache local.
   - Les données du cache sont purgées immédiatement lors de la déconnexion.
