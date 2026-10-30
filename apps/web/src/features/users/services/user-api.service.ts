import {
  apiClient,
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  generateUuid,
} from "@/lib/api-client";
import { ApiUserSummary } from "../types/user.types";

interface RawUserItem {
  id: string;
  phoneNumber?: string;
  phone?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    city?: string | null;
    avatarKey?: string | null;
  } | null;
}

const DEFAULT_CITIZENS: ApiUserSummary[] = [
  {
    id: "u-admin-sikirou-001",
    name: "Abdoulaye Sikirou",
    phone: "+229 97 12 34 56",
    email: "sikirou@mycommunity.bj",
    city: "Abomey-Calavi",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    registeredAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "u-benoit-ahouan-002",
    name: "Benoît Ahouanmenou",
    phone: "+229 97 11 22 33",
    email: "benoit@gmail.com",
    city: "Abomey-Calavi",
    role: "CITIZEN",
    status: "ACTIVE",
    registeredAt: "2026-03-10T14:22:00Z",
  },
  {
    id: "u-nadine-degila-003",
    name: "Nadine Degila",
    phone: "+229 95 66 77 88",
    email: "nadine.degila@uac.bj",
    city: "Abomey-Calavi",
    role: "CITIZEN",
    status: "ACTIVE",
    registeredAt: "2026-04-02T11:45:00Z",
  },
  {
    id: "u-ousmane-bio-004",
    name: "El Hadj Ousmane Bio",
    phone: "+229 97 10 20 30",
    email: "ousmane.bio@immo-benin.bj",
    city: "Cotonou",
    role: "SYNDIC",
    status: "ACTIVE",
    registeredAt: "2026-02-18T16:10:00Z",
  },
  {
    id: "u-felicien-hounk-005",
    name: "Dr. Félicien Hounkonnou",
    phone: "+229 96 44 55 66",
    email: "f.hounkonnou@ajac.bj",
    city: "Abomey-Calavi",
    role: "PRESIDENT",
    status: "ACTIVE",
    registeredAt: "2026-02-28T09:30:00Z",
  },
  {
    id: "u-gloria-hound-006",
    name: "Gloria Houndété",
    phone: "+229 94 22 33 44",
    email: "gloria.h@portonovo.bj",
    city: "Porto-Novo",
    role: "ADMIN",
    status: "ACTIVE",
    registeredAt: "2026-05-12T13:15:00Z",
  },
  {
    id: "u-mathias-toss-007",
    name: "Mathias Tossou",
    phone: "+229 98 12 78 90",
    email: "mathias.tossou@gmail.com",
    city: "Parakou",
    role: "CITIZEN",
    status: "ACTIVE",
    registeredAt: "2026-06-20T17:40:00Z",
  },
  {
    id: "u-aissatou-ad-008",
    name: "Aïssatou Adamou",
    phone: "+229 95 33 22 11",
    email: "aissatou.a@nord-entraide.bj",
    city: "Djougou",
    role: "CITIZEN",
    status: "ACTIVE",
    registeredAt: "2026-07-08T10:05:00Z",
  },
];

export const userApiService = {
  /**
   * Liste tous les citoyens inscrits sur la plateforme (API ou cache résilient).
   */
  async list(): Promise<ApiUserSummary[]> {
    const cached = getLocalState<ApiUserSummary[]>(STORAGE_KEYS.USERS, []);

    try {
      const res = await apiClient.fetch<RawUserItem[]>("users");
      if (res && Array.isArray(res) && res.length > 0) {
        const normalized: ApiUserSummary[] = res.map((u) => {
          const first = u.profile?.firstName || u.firstName || "";
          const last = u.profile?.lastName || u.lastName || "";
          const computedName = `${first} ${last}`.trim();
          return {
            id: u.id,
            name: computedName || u.phoneNumber || u.phone || "Citoyen Anonyme",
            phone: u.phoneNumber || u.phone || "",
            email: u.email || undefined,
            city: u.profile?.city || undefined,
            avatarKey: u.profile?.avatarKey || null,
            role: "CITIZEN",
            status: "ACTIVE",
          };
        });

        // Fusionner avec le cache local
        const map = new Map<string, ApiUserSummary>();
        cached.forEach((c) => map.set(c.id, c));
        normalized.forEach((n) => map.set(n.id, n));
        const merged = Array.from(map.values());
        setLocalState(STORAGE_KEYS.USERS, merged);
        return merged;
      }
    } catch {
      // Backend hors ligne ou sans endpoint GET /users : utilisation du cache
    }

    if (cached.length === 0) {
      setLocalState(STORAGE_KEYS.USERS, DEFAULT_CITIZENS);
      return DEFAULT_CITIZENS;
    }

    return cached;
  },

  /**
   * Mise à jour du statut d'un utilisateur par l'administrateur (ACTIVE | SUSPENDED).
   */
  async updateUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<void> {
    const all = await this.list();
    const updated = all.map((u) => (u.id === userId ? { ...u, status } : u));
    setLocalState(STORAGE_KEYS.USERS, updated);
  },

  /**
   * Attribution ou promotion d'un rôle plateforme par l'administrateur.
   */
  async updateUserRole(userId: string, role: import("@/features/auth/types/permissions.types").PlatformRole): Promise<void> {
    const all = await this.list();
    const updated = all.map((u) => (u.id === userId ? { ...u, role } : u));
    setLocalState(STORAGE_KEYS.USERS, updated);
  },

  /**
   * Recherche de citoyens par nom, téléphone ou email.
   */
  async search(query: string): Promise<ApiUserSummary[]> {
    const all = await this.list();
    if (!query || !query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter((u) => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchPhone = u.phone.toLowerCase().includes(q);
      const matchEmail = u.email ? u.email.toLowerCase().includes(q) : false;
      const matchCity = u.city ? u.city.toLowerCase().includes(q) : false;
      return matchName || matchPhone || matchEmail || matchCity;
    });
  },

  /**
   * Enregistre un nouveau citoyen sur la plateforme s'il n'avait pas encore de compte.
   * Permet d'assurer que tout adhérent ou nommé possède un vrai identifiant plateforme.
   */
  async registerCitizen(input: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
  }): Promise<ApiUserSummary> {
    const current = await this.list();
    const newCitizen: ApiUserSummary = {
      id: generateUuid(),
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      city: input.city?.trim() || "Abomey-Calavi",
    };

    const updated = [newCitizen, ...current];
    setLocalState(STORAGE_KEYS.USERS, updated);
    return newCitizen;
  },
};
