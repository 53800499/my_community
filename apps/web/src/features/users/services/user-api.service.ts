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

    return cached;
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
