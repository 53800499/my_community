# ADR-010 : Découplage Temporel des Personnes et des Hébergements via l'Entité d'Occupation (`RoomOccupation`)

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
Dans la gestion des résidences communautaires et étudiantes (ex: foyers AEECP, cités universitaires associatives), lier directement un étudiant à une chambre via une clé étrangère statique (ex: `user.room_id` ou `room.student_id`) crée quatre blocages majeurs :
1. **Membres externes majoritaires :** 80 % à 90 % des étudiants ou membres associatifs n'habitent pas en résidence.
2. **Perte d'historique :** Un lien direct écrase le parcours résidentiel lors des changements de chambre, départs en stage ou réinscriptions.
3. **Rigidité de statut :** Impossibilité d'héberger temporairement des professeurs invités, stagiaires, intervenants ou alumni non-étudiants.
4. **Colocations impossibles :** Complexité artificielle pour modéliser des chambres à capacité multiple (2 ou 3 lits) et planifier des rentrées futures.

---

## Décision
Adopter un **découplage absolu entre l'identité de l'utilisateur et les logements physiques**, en matérialisant la relation par une entité pivot temporelle : **l'Occupation de Chambre (`RoomOccupation`)**.

- **Entité Physique Autonome :** `Room` définit la capacité, l'état matériel et le loyer standard sans connaître ses occupants passés ou présents.
- **Entité Utilisateur Autonome :** `UserProfile` et `UserSocioProfile` gèrent l'identité sociale et le cursus académique, indépendamment de tout statut locatif.
- **Entité Pivot Temporelle :** `RoomOccupation` encapsule le contrat de séjour :
  - `occupant_user_id` : Référence vers n'importe quel compte utilisateur actif (`identity.user_accounts`).
  - `room_id` : Référence vers la chambre louée (`residence.rooms`).
  - `start_date` et `end_date` : Période effective de séjour.
  - `is_active` : Drapeau booléen indexé identifiant les baux en cours.
  - `custom_monthly_rent` : Quote-part éventuelle ou modalité spécifique.
- **Règle Économique et Financière `finance` :** 
  - L'étudiant/résident entrant **ne paie pas la location** : il s'acquitte de **frais d'intégration** (`finance.integration_fee_dues`), émis automatiquement lors de l'attribution de sa chambre.
  - **C'est l'association qui est titulaire du bail et paie la location** au propriétaire bailleur (`finance.building_leases` / `finance.building_rent_expenses`), inscrite comme une dépense (`EXPENSE`) au grand livre de trésorerie.

---

## Conséquences

### Positives :
- **Traçabilité comptable et historique irréprochable :** Possibilité de reconstituer l'historique complet d'une chambre sur plusieurs années ou le parcours d'un résident au fil de ses promotions.
- **Gestion naturelle des colocations :** Une chambre de capacité $N$ accueille jusqu'à $N$ enregistrements `RoomOccupation` actifs simultanément.
- **Résiliation et arrêt automatique des loyers :** La clôture d'une occupation (`end_date = CURRENT_DATE`, `is_active = FALSE`) libère la chambre et stoppe la facturation des mois suivants sans affecter le compte membre de l'utilisateur.
- **Polyvalence d'accueil :** Tout membre (étudiant, chercheur, bénévole ou invité) peut être hébergé sans créer de faux profil académique.

### Négatives / Contraintes :
- Requiert un contrôle applicatif ou une contrainte SQL (`EXCLUDE` ou trigger) pour empêcher d'assigner plus d'occupants actifs que la capacité maximale de la chambre (`capacity`).
- Nécessite des index partiels sur `(occupant_user_id) WHERE is_active = TRUE` et `(room_id) WHERE is_active = TRUE` pour garantir des temps de réponse instantanés sur les recherches de baux en cours.
