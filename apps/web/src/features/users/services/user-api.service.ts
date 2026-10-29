import { apiClient } from "@/lib/api-client";
import { ApiUserSummary } from "../types/user.types";

interface RawUserItem {
  id: string;
  phoneNumber: string;
  email?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

export const userApiService = {
  async list(): Promise<ApiUserSummary[]> {
    try {
      const res = await apiClient.fetch<RawUserItem[]>("users");
      if (res && res.length > 0) {
        return res.map((u) => ({
          id: u.id,
          name: `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() || u.phoneNumber,
          phone: u.phoneNumber,
          email: u.email,
        }));
      }
    } catch {
      // API error or unavailable
    }
    return [];
  },
};
