# ADR-002 : Architecture Backend en Monolithe Modulaire avec NestJS

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Le projet doit gérer 12 domaines métier distincts (identité, territoires, communautés, adhésions, associations, réseau social, événements, finances, modération, notifications, audit). Passer prématurément à une architecture de microservices introduirait une complexité opérationnelle démesurée (latence réseau, transactions distribuées Saga/2PC, orchestration de conteneurs, observability complexe) pour une équipe restreinte au stade du MVP. À l'inverse, un monolithe traditionnel non structuré dégénérerait rapidement en code spaghetti.

## Décision
Construire le backend sous la forme d'un **Monolithe Modulaire** en **NestJS** :
- Un seul serveur déployable et une seule connexion de base de données.
- Découpage strict en 12 modules autonomes appliquant l'architecture hexagonale (`domain/`, `application/`, `infrastructure/`, `presentation/`).
- Communication inter-modules exclusivement via des façades publiques (`index.ts`) ou des événements métier internes.

## Conséquences
- **Positives :**
  - Simplicité de développement, de débogage et de déploiement en production.
  - Transactions PostgreSQL natives pour garantir l'atomicité des opérations critiques.
  - Évolution future facilitée vers des microservices si un domaine (ex: `social` ou `notifications`) nécessite un dimensionnement indépendant.
- **Négatives :**
  - Nécessite une discipline d'équipe stricte et des règles de linter pour éviter les imports directs sauvages entre modules.
