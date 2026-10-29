import { apiClient } from "@/lib/api-client";
import { ApiTerritory } from "../types/territory.types";

export const territoryApiService = {
  async getRoots(): Promise<ApiTerritory[]> {
    try {
      const res = await apiClient.fetch<ApiTerritory[]>("territories/roots");
      if (res && res.length > 0) return res;
    } catch (err) {
      console.warn("territoryApiService.getRoots error:", err);
    }
    return [];
  },

  async getByCode(code: string): Promise<ApiTerritory> {
    return await apiClient.fetch<ApiTerritory>(`territories/${code}`);
  },

  async getChildren(parentId: string): Promise<ApiTerritory[]> {
    try {
      const res = await apiClient.fetch<ApiTerritory[]>(`territories/${parentId}/children`);
      if (res && res.length > 0) return res;
    } catch (err) {
      console.warn("territoryApiService.getChildren error:", err);
    }
    return [];
  },

  async getDepartments(): Promise<ApiTerritory[]> {
    try {
      const roots = await this.getRoots();
      if (roots && roots.length > 0) {
        const depts = await this.getChildren(roots[0].id);
        if (depts && depts.length > 0) {
          return depts.map((d) => ({
            ...d,
            type: "DEPARTMENT" as const,
          }));
        }
      }
    } catch (err) {
      console.warn("territoryApiService.getDepartments error:", err);
    }
    return [];
  },

  async getCommunes(deptId?: string): Promise<ApiTerritory[]> {
    try {
      if (deptId) {
        return await this.getChildren(deptId);
      }
      const depts = await this.getDepartments();
      const results: ApiTerritory[] = [];
      for (const d of depts) {
        const list = await this.getChildren(d.id);
        results.push(...list);
      }
      return results;
    } catch (err) {
      console.warn("territoryApiService.getCommunes error:", err);
      return [];
    }
  },
};
