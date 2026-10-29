# My Community — Palette de Couleurs & Tokens Colorimétriques

**Version :** 1.0  
**Statut :** Spécification Officielle Validée  
**Référence Partagée :** [tokens.json](file:///c:/Sikirou/eskay/my_community/packages/design-tokens/tokens.json) · [packages/design-tokens](file:///c:/Sikirou/eskay/my_community/packages/design-tokens)  

---

## 1. Couleurs de Marque (Brand)

La palette de marque est dominée par un **Indigo profond** rassurant, réhaussé d'un **Violet lumineux** pour la découverte et d'un accent **Corail** chaleureux pour les interactions sociales.

| Nom du Token | Valeur HEX | Rôle et Usage Principal |
| :--- | :---: | :--- |
| **`brand-primary`** | `#3730A3` | Boutons primaires, liens actifs, navigation dominante, identité visuelle. |
| **`brand-secondary`** | `#7C3AED` | Découverte, badges interactifs, focus visuels, actions complémentaires. |
| **`brand-accent`** | `#F97373` | Réactions (cœurs, likes), badges événementiels, touches chaleureuses ponctuelles. |
| **`brand-deep`** | `#171638` | Fonds très sombres de marque, en-têtes d'authentification et supports institutionnels. |

> [!IMPORTANT]
> **Règle de Contraste pour le Corail (`#F97373`) :**  
> Le texte blanc sur fond corail ne respecte pas les critères WCAG 2.2 AA. Sur tout bouton ou badge corail, le texte doit être sombre : `#24101A`.

---

## 2. Couleurs Fonctionnelles (Feedback)

| Nom du Token | Valeur HEX | Rôle |
| :--- | :---: | :--- |
| **`color-success`** | `#15803D` | Confirmations, adhésions approuvées, paiements XOF validés. |
| **`color-warning`** | `#B45309` | Actions en attente, propositions soumises, alertes non critiques. |
| **`color-danger`** | `#B91C1C` | Erreurs, rejets de propositions, suspensions, actions destructives. |

---

## 3. Neutres — Thème Clair (Light Theme)

| Token CSS | Constante Dart | Valeur HEX | Usage |
| :--- | :--- | :---: | :--- |
| `--color-canvas` | `AppColors.canvas` | `#F5F5FA` | Fond général de l'application (doux pour les yeux). |
| `--color-surface` | `AppColors.surface` | `#FFFFFF` | Cartes, boîtes de dialogue, menus déroulants, formulaires. |
| `--color-surface-subtle` | `AppColors.surfaceSubtle` | `#EEEDF5` | Arrière-plans secondaires, barres d'outils, badges neutres. |
| `--color-text-primary` | `AppColors.textPrimary` | `#17172A` | Titres, en-têtes, corps de texte principal. |
| `--color-text-secondary` | `AppColors.textSecondary` | `#55556B` | Métadonnées, dates, descriptions secondaires, libellés d'aide. |
| `--color-border` | `AppColors.border` | `#D9D8E5` | Séparateurs, bordures de cartes et d'inputs. |
| `--color-disabled` | `AppColors.disabled` | `#77778A` | Textes désactivés et placeholders inactifs. |

---

## 4. Neutres — Thème Sombre (Dark Theme)

Le thème sombre n'est pas une simple inversion négative. Il emploie des surfaces étagées pour préserver la profondeur et le repos visuel :

| Token CSS | Constante Dart | Valeur HEX | Usage |
| :--- | :--- | :---: | :--- |
| `--color-canvas` | `AppColors.darkCanvas` | `#11111B` | Fond général de l'application. |
| `--color-surface` | `AppColors.darkSurface` | `#1B1B2B` | Cartes et panneaux principaux. |
| `--color-surface-subtle` | `AppColors.darkSurfaceSubtle` | `#28283B` | Surfaces secondaires et blocs de saisie. |
| `--color-text-primary` | `AppColors.darkTextPrimary` | `#F4F4FA` | Texte principal haute lisibilité. |
| `--color-text-secondary` | `AppColors.darkTextSecondary` | `#C1C0D4` | Texte secondaire et métadonnées. |
| `--color-border` | `AppColors.darkBorder` | `#414158` | Contours et séparateurs subtils. |

---

## 5. Câblage dans les Clients

- **Web (Next.js) :** Variables CSS sémantiques dans [apps/web/src/app/globals.css](file:///c:/Sikirou/eskay/my_community/apps/web/src/app/globals.css).
- **Mobile (Flutter) :** Classe `AppColors` dans [apps/mobile/lib/app/theme/app_theme.dart](file:///c:/Sikirou/eskay/my_community/apps/mobile/lib/app/theme/app_theme.dart).
