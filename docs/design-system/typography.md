# My Community — Typographie et Échelle Textuelle

**Version :** 1.0  
**Police de Référence :** `Inter` (sans empattement, géométrie ouverte, lisibilité optimale)  
**Plateformes :** Web (Next.js) & Mobile (Flutter)  

---

## 1. Choix Typographique

La police **Inter** est choisie comme police unique pour l'ensemble du système afin de garantir une cohérence parfaite et légère entre Web et Mobile :
- Excellente lisibilité sur les petits écrans mobiles.
- Caractères accentués et glyphes internationaux complets.
- Variété de graisses bien étagées sans alourdir le bundle.

---

## 2. Échelle Typographique Standardisée

| Niveau | Taille (px / pt) | Interlignage (Line Height) | Graisse (Weight) | Usage Recommandé |
| :--- | :---: | :---: | :---: | :--- |
| **Titre de page (H1)** | 28–32 px | 36–40 px | Bold (700) | En-têtes d'écrans majeurs, nom de la communauté. |
| **Titre de section (H2)** | 20–24 px | 28–32 px | SemiBold (600) | Titres de blocs, onglets principaux, listes. |
| **Titre de publication (H3)**| 16–18 px | 24–26 px | SemiBold (600) | En-tête de post, titre d'événement, nom d'auteur. |
| **Corps de texte (Body)** | 14–16 px | 22–24 px | Regular (400) | Contenu des publications, descriptions, formulaires. |
| **Métadonnées (Caption)** | 12–13 px | 16–18 px | Regular (400) | Dates relatives, compteurs de membres, badges. |
| **Boutons (Button Label)** | 14–16 px | 20–22 px | SemiBold (600) | Libellés d'actions principales et secondaires. |

---

## 3. Règles d'Adaptation Multi-Plateforme

### A. Web (Next.js)
- Rendu avec `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'` pour des chiffres et majuscules parfaits.
- Utilisation de `rem` indexés sur un standard `16px`.

### B. Mobile (Flutter)
- Utilisation des unités logiques de Flutter (`double`).
- **Support obligatoire de la mise à l'échelle système :** L'interface doit supporter l'agrandissement dynamique des caractères sans couper les textes ni provoquer d'overflow graphique (usage systématique de `TextOverflow.ellipsis` et de conteneurs extensibles).
