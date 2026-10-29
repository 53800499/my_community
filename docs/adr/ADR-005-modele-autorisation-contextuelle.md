# ADR-005 : Modèle d'Autorisation Contextuelle Communautaire et Associative

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Un citoyen peut être responsable d'une communauté de quartier, simple membre dans un village d'origine, et trésorier dans une association locale. Un rôle global utilisateur plat (`user.role = 'ADMIN'`) est totalement inadapté et dangereux.

## Décision
Adopter un modèle **RBAC contextuel par ressource** :
- Tout contrôle de permission évalue conjointement l'identité (`userId`), la ressource cible (`communityId` ou `associationId`), le statut d'adhésion (`ACTIVE`) et le rôle local accordé (`MANAGER`, `TREASURER`, `MODERATOR`, `MEMBER`).
- Séparation stricte entre rôles communautaires et rôles associatifs.
- Vérification systématique côté serveur par des Guards NestJS dédiés (`ResourceAccessGuard`).
- Aucune décision d'autorisation ne repose sur un simple masquage d'éléments d'interface dans le web ou le mobile.

## Conséquences
- **Positives :**
  - Étanchéité absolue entre communautés et entre associations.
  - Prévention native des vulnérabilités de type IDOR (Insecure Direct Object References).
- **Négatives :**
  - Requiert une requête de vérification d'adhésion et de rôle pour chaque ressource privée accédée (optimisée par indexation en base).
