export interface BuildingTypeDefinition {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  defaultFloors: number;
}

export const BUILDING_TYPES: BuildingTypeDefinition[] = [
  {
    id: "PAVILLON_UNIVERSITAIRE",
    label: "Pavillon Universitaire (Cité / Résidence Étudiante)",
    shortLabel: "Pavillon Universitaire",
    description: "Chambres individuelles, doubles et collectives 4 lits pour étudiants, sanitaires et cour partagés",
    defaultFloors: 1,
  },
  {
    id: "BATIMENT_PLAIN_PIED",
    label: "Bâtiment Plain-Pied (Rez-de-chaussée uniquement / Cour commune)",
    shortLabel: "Plain-Pied (RDC)",
    description: "Aucun étage (RDC seul), chambres de plain-pied sans escaliers",
    defaultFloors: 0,
  },
  {
    id: "IMMEUBLE_ETAGES",
    label: "Immeuble en Étages (R+1, R+2, R+3 ou plus)",
    shortLabel: "Immeuble R+",
    description: "Bâtiment collectif avec paliers, balcons et couloirs de circulation",
    defaultFloors: 2,
  },
  {
    id: "VILLA_SOLIDAIRE",
    label: "Villa / Résidence Solidaire Partenaire (Colocation Fraternelle)",
    shortLabel: "Villa Solidaire",
    description: "Hébergement conventionné par l'association pour entraide et colocation étudiante",
    defaultFloors: 1,
  },
];

export interface RoomTypeDefinition {
  id: string;
  label: string;
  shortLabel: string;
  defaultCapacity: number;
  description: string;
  allowsSurplus: boolean;
  suggestedRentXOF: number;
}

export const ROOM_TYPES: RoomTypeDefinition[] = [
  {
    id: "CHAMBRE_4_PLACES",
    label: "Chambre Partagée 4 Personnes (Quadruple Solidaire)",
    shortLabel: "Chambre 4 Personnes",
    defaultCapacity: 4,
    description: "Capacité standard : 4 lits • Surplus admis en cas de besoin (accueil d'étudiants en surnombre autorisé sans refus)",
    allowsSurplus: true,
    suggestedRentXOF: 15000,
  },
  {
    id: "CHAMBRE_2_PLACES",
    label: "Chambre Double Partagée (Binôme 2 Personnes)",
    shortLabel: "Chambre 2 Personnes",
    defaultCapacity: 2,
    description: "Capacité standard : 2 lits • Surplus d'urgence admis en cas de besoin",
    allowsSurplus: true,
    suggestedRentXOF: 25000,
  },
  {
    id: "STUDIO_INDIVIDUEL",
    label: "Studio Individuel (Simple 1 Personne)",
    shortLabel: "Studio Individuel",
    defaultCapacity: 1,
    description: "Capacité standard : 1 personne • Hébergement d'un colocataire temporaire possible",
    allowsSurplus: true,
    suggestedRentXOF: 35000,
  },
  {
    id: "DORTOIR_COLLECTIF",
    label: "Dortoir Collectif / Pavillon Solidaire (6 à 8 Personnes)",
    shortLabel: "Dortoir 6-8 Personnes",
    defaultCapacity: 6,
    description: "Capacité standard : 6 lits • Accueil collectif et d'urgence solidaire sans refus",
    allowsSurplus: true,
    suggestedRentXOF: 10000,
  },
  {
    id: "STUDIO_SANITAIRE",
    label: "Chambre Sanitaire Intégré (Douche & WC internes)",
    shortLabel: "Sanitaire Intégré",
    defaultCapacity: 1,
    description: "Chambre avec salle d'eau privative • Capacité 1 à 2 personnes • Surplus admis",
    allowsSurplus: true,
    suggestedRentXOF: 45000,
  },
  {
    id: "STUDIO_BALCON",
    label: "Studio avec Balcon / Terrasse",
    shortLabel: "Studio Balcon",
    defaultCapacity: 1,
    description: "Chambre lumineuse avec ouverture extérieure privative • Surplus admis",
    allowsSurplus: true,
    suggestedRentXOF: 40000,
  },
];
