# ADR-004 : Frontières des Modules et Règles de Dépendance

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Dans une architecture modulaire, le risque majeur est la contamination progressive des couches : un module accédant directement aux tables d'un autre module ou des dépendances circulaires entre domaines (ex: `communities` dépendant de `finance` qui dépend de `communities`).

## Décision
Imposer des règles strictes de dépendance :
1. **Propriété exclusive :** Un module est le seul propriétaire légitime de ses tables en base.
2. **Façade publique obligatoire :** Tout accès depuis un autre module s'effectue via un service exposé dans `index.ts`.
3. **Architecture hexagonale :** Le domaine ne dépend ni de NestJS ni de Prisma.
4. **Contrôle automatisé en CI :** Utilisation d'ESLint et de `dependency-cruiser` pour rejeter automatiquement toute dépendance circulaire ou import direct non autorisé.

## Conséquences
- **Positives :**
  - Modularité réelle : chaque module peut être testé, refactorisé ou extrait sans effet de bord.
  - Compréhension claire du modèle mental et des responsabilités de chaque composant.
- **Négatives :**
  - Nécessite d'écrire des interfaces et mappers de façade pour les échanges inter-modules.
