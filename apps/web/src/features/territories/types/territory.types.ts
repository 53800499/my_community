export interface ApiTerritory {
  id: string;
  code: string;
  name: string;
  type: "COUNTRY" | "DEPARTMENT" | "COMMUNE" | "ARRONDISSEMENT" | "VILLAGE";
  parentId?: string | null;
  residencesCount?: number;
  associationsCount?: number;
  communesCount?: number;
  prefecture?: string;
}
