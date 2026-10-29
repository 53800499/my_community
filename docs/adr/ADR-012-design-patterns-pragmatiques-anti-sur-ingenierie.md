# ADR-012 : Sélection de Design Patterns Pragmatiques et Prévention de la Sur-Ingénierie

- **Statut :** Accepté
- **Date :** 22 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
L'exigence des principes SOLID (ADR-011) et de l'architecture hexagonale (ADR-009) pousse naturellement vers l'usage de patrons de conception (*Design Patterns*).  
Cependant, l'introduction anarchique ou excessive de patterns sophistiqués engendre un risque majeur de **sur-ingénierie (*over-engineering*)**, caractérisé par :
- Une prolifération de classes passerelles inutiles (ex: Builders pour 3 champs, Abstract Factories à tiroirs, CQRS lourd avec bus de commandes inutilement asynchrone).
- Une augmentation artificielle du coût cognitif et de la courbe d'apprentissage du projet.
- Une dégradation de la productivité de l'équipe et un ralentissement des tests.

Le système requiert une sélection ciblée de patrons éprouvés, utilisés **au plus juste besoin** (*Just-in-Time Patterns*) en conformité avec les règles fondamentales **KISS** (*Keep It Simple, Stupid*) et **YAGNI** (*You Aren't Gonna Need It*).

---

## Décision

Nous adoptons une **politique de Design Patterns pragmatiques**, délimitée par un catalogue strict de patrons autorisés et l'interdiction formelle de la sur-ingénierie.

### 1. Les 6 Design Patterns Clés Autorisés & Standardisés :

1. **Static Factory Method (Création) :**
   - *Usage :* Instanciation des Entités du Domaine (ex: `CommunityEntity.create(props)`).
   - *Bénéfice :* Garantit la cohérence et la validation des invariants métier sans recourir à un patron Builder lourd.
2. **Strategy Pattern (Comportement) :**
   - *Usage :* Multiplicité de passerelles interchangeables (ex: moyens de paiement Mobile Money Bénin `MoMo`, `Celtiis`, `Moov`, `Stripe` ; fournisseurs d'envoi OTP SMS/WhatsApp).
   - *Bénéfice :* Élimine les cascades de `switch / case` et permet l'ajout d'un nouveau moyen sans modifier le code existant (OCP).
3. **Observer / Domain Events (Comportement) :**
   - *Usage :* Déclenchement découplé des effets secondaires métier (audit immuable, notifications utilisateur, purge de cache) via l'événementiel NestJS in-memory (`EventEmitter2`).
   - *Bénéfice :* Préserve la responsabilité unique (SRP) du cas d'usage sans introduire de courtier de messages externe complexe (Kafka, RabbitMQ) à ce stade.
4. **Data Mapper (Structure / Intégration) :**
   - *Usage :* Conversion bidirectionnelle pure entre DTOs d'API, Entités du Domaine et modèles Prisma/PostgreSQL (`CommunityMapper.toDomain()`, `toResponseDto()`).
   - *Bénéfice :* Découplage strict sans recourir à des bibliothèques de mapping magiques et opaques.
5. **Specification / Policy Pattern (Domaine) :**
   - *Usage :* Évaluation de règles d'éligibilité, d'autorisation ou de transition d'état complexes (ex: `CommunityApprovalPolicy.canBeApproved()`).
   - *Bénéfice :* Testabilité unitaire pure en 1 milliseconde, zéro dépendance d'infrastructure.
6. **Adapter Pattern (Structure / Ports & Adapters) :**
   - *Usage :* Encapsulation des SDKs externes (AWS S3, MinIO, clients HTTP Dio, base SQLite Drift) pour satisfaire les interfaces de ports applicatifs.
   - *Bénéfice :* Interchangeabilité technologique transparente (LSP & DIP).

### 2. Exploitation Prioritaire des Mécanismes Natifs :
Au lieu d'implémenter des patterns maison redondants :
- Utiliser l'**IoC / DI natif de NestJS** (plutôt que des Singletons ou des Service Locators faits main).
- Utiliser les **Guards NestJS** (implémentation native de la *Chaîne de Responsabilité* pour l'authentification et les permissions RBAC).
- Utiliser les **Interceptors NestJS** (implémentation native du patron *Proxy / Decorator* pour le logging, les transactions et la mise en forme RFC 7807).
- Côté Web : Utiliser la **Composition React** (*Compound Components*) et les **Custom Hooks** (séparation Présentation / Logique).
- Côté Mobile : Utiliser les **Providers Riverpod** (injection d'état découplée) et le système de composition de Widgets Flutter.

### 3. Anti-Patterns de Sur-Ingénierie Strictement Bannis :
- ❌ **L'Abstract Factory de Factories :** Empilement de fabriques abstraites sans justification.
- ❌ **Le Builder Pattern sur des objets simples :** Interdit lorsqu'un type TypeScript typé et une méthode statique suffisent.
- ❌ **Le CQRS complexe / Event Sourcing prématuré :** Interdiction d'introduire des bus CQRS asynchrones ou de l'Event Sourcing là où une transaction PostgreSQL et des use-cases distincts suffisent.
- ❌ **Le Service Locator masqué :** Instancier des dépendances en dur à l'intérieur d'un constructeur ou d'une méthode.

---

## Conséquences

### Positives
- **Architecture lisible et fluide :** Tout développeur comprend immédiatement où se situe chaque responsabilité.
- **Zéro surcharge inutile :** Moins de classes artificielles, compilation plus rapide, maintenance allégée.
- **Évolutivité maîtrisée :** Le projet grandit sainement sans s'enliser dans une complexité prématurée.

### Négatives
- Exige un discernement permanent lors des revues de code pour refuser l'abstraction prématurée.
