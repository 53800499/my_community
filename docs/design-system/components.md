# My Community — Spécifications des Composants d'Interface (Components)

**Version :** 1.0  
**Périmètre :** Bibliothèque de Composants Réutilisables (Web Next.js & Mobile Flutter)  

---

## 1. Boutons (Buttons)

Les boutons constituent le point d'interaction primordial de l'application. Ils partagent une hauteur tactile minimale de 44 px et un rayon de courbure de 10 px (`radius-md`).

### A. Variantes Principales :
1. **Bouton Primaire (`mc-button-primary` / `ElevatedButton`) :**
   - *Style :* Fond Indigo `#3730A3`, texte blanc `#FFFFFF`, graisse 600.
   - *Usage :* Action dominante unique de l'écran ou de la carte (ex: "Rejoindre la communauté", "Publier").
2. **Bouton Secondaire (`mc-button-secondary` / `OutlinedButton`) :**
   - *Style :* Fond neutre/surface, bordure fine `#D9D8E5`, texte sombre `#17172A`.
   - *Usage :* Actions complémentaires (ex: "En savoir plus", "Annuler").
3. **Bouton Accent Corail (`mc-button-accent`) :**
   - *Style :* Fond Corail `#F97373`, texte sombre `#24101A` (contraste AA).
   - *Usage :* Actions d'engagement émotionnel (ex: "Réagir", "Soutenir").

### B. États Obligatoires :
Chaque bouton doit implémenter de manière visible :
- **Normal**
- **Survol (Hover) :** Légère variation d'assombrissement/éclaircissement.
- **Focus Clavier :** Contour extérieur de 3 px visible (`--brand-secondary`) avec décalage de 3 px.
- **Pressé (Active) :** Léger tassement ou opacité à 0.9.
- **Chargement (Loading) :** Spinner accessible ou libellé de transition, action temporairement verrouillée.
- **Désactivé (Disabled) :** Opacité réduite à 0.5, curseur `not-allowed`.

---

## 2. Carte de Communauté (Community Card)

Composant d'accueil et de découverte :
- **Couverture visuelle (Banner) :** Ratio 16:9 ou 3:1 apportant la touche graphique singulière du groupe.
- **Avatar de Communauté :** Format circulaire 48x48 px à cheval sur la bannière.
- **Informations Clés :**
  - Nom officiel de la communauté (H3).
  - Courte description (tronquée à 2 lignes).
  - Métadonnées : Nombre de membres, visibilité (`Publique` / `Sur demande`).
- **Bouton d'Adhésion :**
  - Si non-membre : Bouton Primaire *"Rejoindre"* ou *"Demander à rejoindre"*.
  - Si membre actif : Badge *"Membre"* ou bouton secondaire *"Accéder"*.

---

## 3. Carte de Publication (Post Card)

Composant récurrent du fil d'actualité :
- **En-tête de l'Auteur :** Avatar 40x40 px, nom de l'auteur, nom de la communauté hôte (lien cliquable), date relative (ex: "Il y a 12 min").
- **Corps du Contenu :** Texte courant avec retour à la ligne maîtrisé, pièces jointes d'images ou documents.
- **Barre d'Interactions Inférieure :**
  - Bouton Réaction (icône cœur + compteur).
  - Bouton Commentaires (icône bulle + compteur).
  - Bouton Partage.

---

## 4. Avatars et Indicateurs de Statut

- **Forme :** Toujours circulaire (`radius-pill`).
- **Tailles Standard :**
  - `sm` : 24 × 24 px (commentaires imbriqués).
  - `md` : 40 × 40 px (fil d'actualité).
  - `lg` : 64 × 64 px (fiches de profil).
  - `xl` : 96 × 96 px (page de profil principale).
- **Badges de Rôle :** Ne pas se contenter d'un rond de couleur. Associer systématiquement une étiquette textuelle (`MANAGER`, `ADMIN`, `MODÉRATEUR`).
