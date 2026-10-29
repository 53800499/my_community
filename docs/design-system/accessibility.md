# My Community — Normes d'Accessibilité & Conformité WCAG 2.2 AA

**Version :** 1.0  
**Niveau Cible :** WCAG 2.2 Niveau AA (Web) & Directives d'Accessibilité Mobile (Android / iOS)  

---

## 1. Ratios de Contraste Obligatoires

Conformément à la norme WCAG 2.2 AA :
- **Texte Standard (< 18 pt ou < 14 pt bold) :** Ratio de contraste minimal de **4,5:1** avec son arrière-plan.
- **Texte de Grande Taille (≥ 18 pt ou ≥ 14 pt bold) :** Ratio minimal de **3,0:1**.
- **Composants d'Interface et Éléments Graphiques Essentiels :** Ratio minimal de **3,0:1** par rapport aux surfaces adjacentes.

### Combinaisons Officielles Validées :
| Élément Graphique | Premier Plan (Texte / Icône) | Arrière-Plan (Surface) | Ratio Calculé | Conformité |
| :--- | :---: | :---: | :---: | :---: |
| **Bouton Primaire** | Blanc (`#FFFFFF`) | Indigo (`#3730A3`) | **7,8:1** | ✅ Conforme AAA |
| **Bouton Secondaire** | Blanc (`#FFFFFF`) | Violet (`#7C3AED`) | **5,4:1** | ✅ Conforme AA |
| **Bouton Accent Corail** | Sombre (`#24101A`) | Corail (`#F97373`) | **7,2:1** | ✅ Conforme AAA |
| **Texte Principal (Clair)** | Texte sombre (`#17172A`) | Canvas clair (`#F5F5FA`)| **14,1:1**| ✅ Conforme AAA |
| **Texte Secondaire (Clair)** | Gris (`#55556B`) | Surface blanche (`#FFFFFF`)| **6,3:1**| ✅ Conforme AA |
| **Texte Principal (Sombre)** | Texte clair (`#F4F4FA`) | Surface sombre (`#1B1B2B`)| **13,2:1**| ✅ Conforme AAA |

> [!CAUTION]
> **Interdiction Formelle du Blanc sur Corail :**  
> L'association `#FFFFFF` sur fond `#F97373` présente un ratio médiocre de **2,8:1**, ce qui échoue aux tests d'accessibilité. Tout élément interactif sur fond corail doit obligatoirement arborer une typographie sombre (`#24101A`).

---

## 2. Règle Fondamentale de la Double Indication

**La couleur ne doit jamais être le seul vecteur d'information.**  
- Pour une erreur de champ de formulaire : associer un message textuel explicite et une icône d'alerte, pas seulement un contour rouge.
- Pour un statut d'adhésion (`PENDING`, `ACTIVE`, `SUSPENDED`) : afficher le libellé textuel en toutes lettres à côté du badge coloré.
- Pour les liens textuels dans un paragraphe : conserver un soulignement ou un indice de contraste distinct.

---

## 3. Navigation au Clavier et Accessibilité Tactile

1. **Indicateur de Focus Visible (Focus Ring) :**
   Tout élément interactif recevant le focus clavier doit afficher un anneau extérieur de **3 px** en Violet (`#7C3AED`) avec un espacement de 3 px (`outline-offset: 3px`).
2. **Cibles Tactiles Élargies (Touch Targets) :**
   Sur l'application mobile et les interfaces tactiles, chaque bouton, icône cliquable ou zone interactive doit offrir une zone active d'au moins **44 × 44 pixels** logiques.
3. **Lecteurs d'Écran (VoiceOver / TalkBack / NVDA) :**
   - Renseigner systématiquement des attributs `aria-label` ou `Semantics()` pour les boutons composés uniquement d'une icône.
   - Les images décoratives reçoivent un `alt=""` pour ne pas encombrer la lecture audio.
