# My Community — Stratégie de Déploiement et DevOps

**Version :** 1.0  
**Date :** 21 octobre 2026  
**Document cible :** Équipes DevOps, SRE & Administrateurs Système  

---

## 1. Topologie des Environnements

1. **Développement Local (Localhost) :**
   - Base PostgreSQL 16 + MinIO (S3 local) orchestrés via `docker-compose.yml`.
   - Backend NestJS en mode watch, frontend Flutter sur émulateur.
2. **Staging / Recette :**
   - Environnement ISO-production hébergé sur cluster Kubernetes / VPS dédié.
   - Données de test anonymisées pour la validation des critères d'acceptation 18/18.
3. **Production :**
   - Cluster PostgreSQL managé avec réplication synchrone et snapshots horaires.
   - Backend conteneurisé stateless derrière un Load Balancer avec terminaison TLS.

---

## 2. Gestion des Migrations de Base de Données

- Les migrations DDL sont gérées exclusivement via un outil de migration outillé (Prisma Migrate, TypeORM Migrations ou Flyway).
- Aucune modification manuelle directe de schéma n'est autorisée sur les bases de staging ou de production.
- Les migrations s'exécutent automatiquement en phase de pré-déploiement (`pre-deploy hook`) avant le basculement du trafic applicatif.
- Toute migration doit être testée au préalable sur une base vierge et sur une copie anonymisée de production dans le pipeline CI.

---

## 3. Pipeline CI/CD et Portes Qualité (Quality Gates)

Chaque Push ou Pull Request déclenche automatiquement la chaîne de validation suivante :

```mermaid
flowchart TD
    PR["Push / Pull Request"] --> Static["1. Lint & Vérification TypeScript<br/>npm run lint && npx tsc --noEmit"]
    Static --> Unit["2. Tests Unitaires<br/>npm run test:unit"]
    Unit --> TestDB["3. Démarrage PostgreSQL Conteneurisé<br/>Testcontainers / Docker"]
    TestDB --> Migr["4. Migrations DDL depuis zéro<br/>npm run migrate:test"]
    Migr --> Integ["5. Tests d'Intégration & RLS<br/>npm run test:integration"]
    Integ --> Sec["6. Tests de Sécurité & Anti-IDOR<br/>npm run test:security"]
    Sec --> Build["7. Compilation Backend, Web & Mobile<br/>npm run build"]
    Build --> E2E["8. Tests E2E Critiques<br/>npm run test:e2e"]
    E2E --> Gate{"Tous les contrôles passent ?"}
    Gate -->|"Oui"| Merge["Autoriser la mise en production"]
    Gate -->|"Non"| Block["Bloquer le déploiement et alerter"]
```

### Commandes Standardisées du Pipeline Backend
```bash
# 1. Contrôle statique
npm run lint
npx tsc --noEmit

# 2. Tests unitaires isolés
npm run test:unit

# 3. Tests d'intégration sur PostgreSQL conteneurisé
npm run test:integration

# 4. Tests de sécurité et étanchéité RBAC
npm run test:security

# 5. Tests End-to-End
npm run test:e2e

# 6. Couverture de code
npm run test:cov

# 7. Compilation finale
npm run build
```

---

## 4. Variables d'Environnement Obligatoires

```env
# Système & Serveur
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# Base de Données PostgreSQL
DATABASE_URL=postgresql://mycommunity_user:STRONG_PASSWORD@postgres-host:5432/mycommunity_db?sslmode=require

# Clés de Chiffrement & Sécurité
JWT_SECRET=super_secret_jwt_key_at_least_256_bits
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=refresh_secret_key_at_least_256_bits
REFRESH_TOKEN_EXPIRATION=7d

# Stockage Objet (S3 / MinIO)
S3_ENDPOINT=https://s3.region.provider.com
S3_BUCKET_NAME=mycommunity-private-attachments
S3_ACCESS_KEY_ID=AKIAEXAMPLEACCESSKEY
S3_SECRET_ACCESS_KEY=EXAMPLESECRETKEY
S3_FORCE_PATH_STYLE=false
```

---

## 5. Politique de Sauvegarde et Plan de Continuité (PRA / PCA)

- **Sauvegardes complètes quotidiennes :** Export chiffré (`pg_dump`) exporté hors site vers un bucket immuable (Object Lock).
- **Archivage WAL (Write-Ahead Logging) :** Permet une récupération à la seconde près (Point-In-Time Recovery - PITR).
- **RTO (Recovery Time Objective) :** Moins de 2 heures.
- **RPO (Recovery Point Objective) :** Moins de 15 minutes.
