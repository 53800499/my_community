# My Community — Guide d'Architecture et Conventions de Code

**Version :** 2.0  
**Date :** 21 octobre 2026  
**Document cible :** Équipes de Développement Backend (NestJS), Frontend (Next.js) & Mobile (Flutter)  

---

## 1. Organisation Interne d'un Module Métier NestJS

Chaque domaine fonctionnel (ex: `communities`, `finance`, `associations`) adopte une structure hexagonale garantissant l'indépendance de la logique métier :

```text
communities/
├── domain/                                # Cœur Métier Pur
│   ├── entities/
│   │   └── community.entity.ts            # Invariants métier de la communauté
│   ├── value-objects/
│   │   └── community-slug.vo.ts           # Format et validation du slug
│   ├── policies/
│   │   └── community-approval.policy.ts   # Règle d'approbation et d'éligibilité
│   └── errors/
│       └── community-already-active.error.ts
│
├── application/                           # Cas d'Utilisation Applicatifs
│   ├── commands/
│   │   ├── propose-community.command.ts
│   │   └── approve-community.use-case.ts  # Orchestration de l'approbation
│   ├── queries/
│   │   ├── get-community.query.ts
│   │   └── list-communities.query.ts
│   └── ports/
│       ├── community-reader.port.ts       # Ségrégation ISP : Lecture
│       └── community-writer.port.ts       # Ségrégation ISP : Écriture
│
├── infrastructure/                        # Adaptateurs Sortants
│   └── persistence/
│       ├── prisma-community.repository.ts # Implémentation concrète Prisma
│       └── community.mapper.ts            # Mapper Modèle Prisma <-> Entité Domaine
│
├── presentation/                          # Adaptateurs Entrants (HTTP REST)
│   └── http/
│       ├── communities.controller.ts      # Contrôleur mince
│       └── dto/
│           ├── propose-community.dto.ts   # Validation d'entrée (class-validator)
│           └── community-response.dto.ts
│
├── communities.module.ts                  # Déclaration du module NestJS
└── index.ts                               # Façade publique exposant l'API du module
```

---

## 2. Exemple Concret d'Implémentation Hexagonale

### 2.1 Règle Métier dans le Domaine (`domain/policies/community-approval.policy.ts`)
```typescript
export class CommunityApprovalPolicy {
  public static canBeApproved(status: string, actorIsPlatformAdmin: boolean): boolean {
    if (!actorIsPlatformAdmin) {
      return false;
    }
    return status === 'PENDING';
  }
}
```

### 2.2 Cas d'Utilisation Applicatif (`application/commands/approve-community.use-case.ts`)
```typescript
@Injectable()
export class ApproveCommunityUseCase {
  constructor(
    private readonly communityRepo: CommunityRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(proposalId: string, adminId: string): Promise<Community> {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await this.communityRepo.findProposalById(proposalId, tx);
      if (!proposal) {
        throw new NotFoundException('Proposition introuvable');
      }

      if (!CommunityApprovalPolicy.canBeApproved(proposal.status, true)) {
        throw new ConflictException('Cette proposition ne peut plus être approuvée.');
      }

      // 1. Activation de la communauté
      const community = await this.communityRepo.createFromProposal(proposal, tx);

      // 2. Mise à jour de la proposition
      await this.communityRepo.updateProposalStatus(proposalId, 'APPROVED', adminId, tx);

      // 3. Traçabilité immuable dans l'audit log
      await this.auditRepo.log({
        actorId: adminId,
        action: 'COMMUNITY_PROPOSAL_APPROVED',
        resourceType: 'COMMUNITY',
        resourceId: community.id,
      }, tx);

      return community;
    });
  }
}
```

### 2.3 Contrôleur HTTP Mince (`presentation/http/communities.controller.ts`)
```typescript
@Controller('api/v1/admin/community-proposals')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class CommunitiesController {
  constructor(private readonly approveCommunityUseCase: ApproveCommunityUseCase) {}

  @Post(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') adminId: string,
  ): Promise<CommunityResponseDto> {
    const community = await this.approveCommunityUseCase.execute(id, adminId);
    return CommunityMapper.toResponseDto(community);
  }
}
```

---

## 3. Architecture Interne de l'Application Mobile (Flutter)

L'application Flutter utilise une organisation **Feature-First** découplée :

```text
apps/mobile/lib/
├── main.dart                          # Point d'entrée de l'application
├── app/
│   ├── app.dart                       # Configuration MaterialApp / thèmes
│   ├── router.dart                    # Routage déclaratif via go_router
│   ├── bootstrap.dart                 # Initialisation async (Drift, SecureStorage)
│   └── theme/                         # Design tokens, couleurs, typographies
│
├── core/
│   ├── network/                       # Client Dio avec intercepteur JWT & Refresh
│   ├── errors/                        # Gestion unifiée des pannes réseau / HTTP
│   ├── storage/                       # Base locale Drift / SQLite (cache de lecture)
│   ├── security/                      # flutter_secure_storage (jetons JWT chiffrés)
│   └── config/                        # Variables d'environnement (Base URL, etc.)
│
├── shared/
│   ├── widgets/                       # Boutons, cartes, inputs partagés
│   └── models/                        # Modèles transversaux
│
└── features/                          # Fonctionnalités Découpées par Domaine
    ├── auth/                          # Inscription, Login, OTP, réinitialisation
    ├── communities/                   # Liste des communautés, détails, propositions
    ├── memberships/                   # Gestion des adhésions locales
    ├── associations/                  # Annuaire associatif, fiches, rattachements
    ├── social/                        # Fil d'actualité, publications, likes, commentaires
    │   ├── data/                      # Repository Dio + Fallback cache Drift local
    │   ├── domain/                    # Modèles métier immutables (Freezed)
    │   └── presentation/              # Riverpod StateNotifier / UI Screens
    ├── events/                        # Agenda local et participations
    ├── finance/                       # Cotisations et versements (en ligne uniquement)
    ├── notifications/                 # Centre de notifications in-app
    └── profile/                       # Profil utilisateur, préférences, déconnexion
```

### Stack Technique Flutter Recommandée :
- **Gestion d'état :** `flutter_riverpod` (séparation propre état / logique / UI).
- **Navigation :** `go_router` (gestion fluide des deep-links et redirections d'auth).
- **Client HTTP :** `dio` avec intercepteurs automatiques pour ajouter le token JWT.
- **Cache local :** `drift` (SQLite typé et performant) avec invalidation TTL.
- **Stockage de secrets :** `flutter_secure_storage` (chiffrement KeyStore Android / Keychain iOS).

---

## 4. Règles d'Outillage et Contrôles Automatisés du Code

1. **Interdiction de contournement des couches :**
   - Aucune requête Prisma directe dans un contrôleur ou un service de présentation.
   - Les entités du domaine ne doivent comporter aucune dépendance vers NestJS ou Prisma.
2. **Calculs financiers strictement centralisés :**
   - Le client mobile ou web n'envoie jamais de solde restant calculé. Le serveur prend uniquement le montant du versement et recalcule l'état comptable dans PostgreSQL.
3. **Contrôle d'importation ESLint :**
   - Règles ESLint interdisant les dépendances circulaires entre modules NestJS et les imports relatifs entre modules sans passer par la façade `index.ts`.

---

## 5. Charte de Conformité SOLID pour les Équipes et l'Assistance IA

L'ensemble des développeurs et agents d'IA doivent se conformer à la charte SOLID suivante :

1. **S — Single Responsibility Principle (SRP) :**
   - 1 Cas d'Usage = 1 commande ou requête unique.
   - Les contrôleurs HTTP n'effectuent que la transformation DTO $\leftrightarrow$ Commande.
   - Les entités de domaine ne contiennent aucune dépendance technique (NestJS, Prisma, SQL).
2. **O — Open/Closed Principle (OCP) :**
   - Extension par composition, Domain Events et Strategy Pattern (ex: passerelles de paiement).
   - Ne pas modifier un use-case existant pour lui ajouter des effets de bord transversaux (utiliser des écouteurs d'événements).
3. **L — Liskov Substitution Principle (LSP) :**
   - Tout adaptateur concret de port (ex: `PrismaCommunityRepository`, `InMemoryCommunityRepository`) doit honorer l'ensemble du contrat sans lever d'exception technique inattendue.
4. **I — Interface Segregation Principle (ISP) :**
   - Découpage systématique des ports en interfaces fines (`ReaderPort` vs `WriterPort`).
   - Aucune classe ne doit être contrainte d'implémenter des méthodes superflues.
5. **D — Dependency Inversion Principle (DIP) :**
   - Le domaine et l'application ne dépendent jamais de l'infrastructure.
   - Injection systématique des abstractions (Ports) via des Tokens NestJS ou des Providers Riverpod.

> 📖 Pour le détail complet des patrons et des exemples de code, se référer au [Guide des Principes SOLID](file:///c:/Sikirou/eskay/my_community/docs/architecture/principes-solid.md) et à l'[ADR-011](file:///c:/Sikirou/eskay/my_community/docs/adr/ADR-011-principes-solid-architecture.md).
