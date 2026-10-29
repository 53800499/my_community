# My Community — Guide Opérationnel des Commandes & Démarrage Local

**Version :** 1.0  
**Date :** 22 octobre 2026  
**Portée :** Monorepo complet (`apps/api`, `apps/web`, `database/`)

---

## 1. Prérequis et Configuration d'Environnement

Le projet utilise un fichier `.env` à la racine ainsi que dans `apps/api/.env` et `database/.env`.

### Variables Clés :
```env
# Port personnalisé pour éviter les conflits avec d'autres conteneurs locaux (ex: 5434 au lieu de 5432)
POSTGRES_PORT=5434
DATABASE_URL=postgresql://community_app:community_dev_password_2026@localhost:5434/my_community?schema=public

# Serveur API (NestJS sur 3001, Web Next.js sur 3000)
PORT=3001
API_PREFIX=/api/v1
JWT_SECRET=my_community_dev_jwt_secret_key_at_least_256_bits_length_secure_random
```

---

## 2. Infrastructure Docker (PostgreSQL, MinIO, Redis)

| Action | Commande Racine (pnpm) | Commande Docker Directe |
| :--- | :--- | :--- |
| **Démarrer les conteneurs en tâche de fond** | `pnpm run docker:up` | `docker compose up -d` |
| **Démarrer uniquement PostgreSQL** | — | `docker compose up -d postgres` |
| **Arrêter les conteneurs** | `pnpm run docker:down` | `docker compose down` |
| **Consulter les logs des conteneurs** | `pnpm run docker:logs` | `docker compose logs -f` |

---

## 3. Base de Données & Schéma Prisma

Le schéma centralisé se trouve dans `database/prisma/schema.prisma`.  
Toutes les commandes peuvent être exécutées indifféremment depuis la racine du monorepo ou depuis le package API.

### Commandes Recommandées (depuis la racine) :

```powershell
# 1. Pousser les modifications du schéma vers la base (Prototypage & Dev rapide)
pnpm run db:push

# 2. Créer une migration Prisma versionnée
pnpm run db:migrate

# 3. Régénérer le client Prisma typé (@prisma/client)
pnpm run db:generate

# 4. Ouvrir l'explorateur visuel de base de données Prisma Studio (port 5555)
pnpm run db:studio
```

### Commandes Équivalentes via le filtre API :

```powershell
pnpm --filter @my-community/api run prisma:push
pnpm --filter @my-community/api run prisma:migrate
pnpm --filter @my-community/api run prisma:generate
pnpm --filter @my-community/api run prisma:studio
```

---

## 4. Démarrage de l'Application & Documentation Interactive

### Lancement du Backend NestJS :
```powershell
# Mode développement avec rechargement à chaud (Watch)
pnpm run dev:api
```
Le serveur écoute sur : **`http://localhost:3001`**

### Documentation Interactive OpenAPI / Swagger :
Une fois le serveur lancé, ouvrez votre navigateur sur :
👉 **`http://localhost:3001/api/v1/docs`**

* Fichier de spécification JSON brut : `http://localhost:3001/api/v1/swagger-json`
* Sonde de disponibilité : `http://localhost:3001/api/v1/health`

---

## 5. Assurance Qualité, Tests & Linting

| Objectif | Commande | Description |
| :--- | :--- | :--- |
| **Lancer tous les tests unitaires** | `pnpm run test:unit` | Exécute Vitest sur tous les modules NestJS |
| **Mode interactif (Watch)** | `pnpm --filter @my-community/api run test:watch` | Relance automatiquement les tests modifiés |
| **Vérification linter ultra-rapide** | `pnpm --filter @my-community/api run lint` | Exécute oxlint (0 warning, 0 error exigé) |
| **Compilation de production** | `pnpm run build:api` | Vérifie les types TypeScript et compile dans `dist/` |

### Exécution Ciblée par Module :
```powershell
# Module Identity (Inscription, Login, Hash Scrypt, Token JWT)
pnpm --filter @my-community/api exec vitest run test/identity/identity-compliance.spec.ts

# Module Territories (Référentiel géographique du Bénin)
pnpm --filter @my-community/api exec vitest run test/territories/territories-compliance.spec.ts

# Module Audit (Traçabilité immuable)
pnpm --filter @my-community/api exec vitest run test/audit/audit-compliance.spec.ts

# Module Communities (Invariants, politique d'approbation)
pnpm --filter @my-community/api exec vitest run test/communities/solid-compliance.spec.ts
```
