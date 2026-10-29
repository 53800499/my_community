import { apiClient } from "@/lib/api-client";
import { ApiAuthSuccess, RegisterInput } from "../types/auth.types";

export const authApiService = {
  async login(identifier: string, password: string): Promise<ApiAuthSuccess> {
    // Clean phone number or email (E.164 without whitespace/dashes)
    const cleanIdentifier = identifier.includes("@")
      ? identifier.trim()
      : identifier.replace(/[\s\-.()]/g, "");

    const res = await apiClient.fetch<ApiAuthSuccess>("auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: cleanIdentifier, password }),
    });

    if (typeof window !== "undefined" && res.token) {
      localStorage.setItem("mc_auth_token", res.token);
      document.cookie = `mc_auth_token=${encodeURIComponent(res.token)}; path=/; max-age=604800; SameSite=Lax`;

      // Fetch user's real profile from backend
      let profile: { firstName?: string; lastName?: string; fullName?: string; city?: string } | null = null;
      try {
        profile = await apiClient.fetch<{ firstName?: string; lastName?: string; fullName?: string; city?: string }>("users/me");
      } catch {
        // Profile non-initialized
      }

      const role = (res.user as { role?: string }).role || "CITIZEN";
      const isSuperAdmin = Boolean(
        res.user.isSuperAdmin || role === "SUPER_ADMIN",
      );

      const enrichedUser: ApiAuthSuccess["user"] = {
        id: res.user.id,
        phoneNumber: res.user.phoneNumber,
        email: res.user.email,
        firstName: profile?.firstName || res.user.firstName || "",
        lastName: profile?.lastName || res.user.lastName || "",
        role,
        isSuperAdmin,
      };

      localStorage.setItem("mc_current_user", JSON.stringify(enrichedUser));
      return {
        token: res.token,
        user: enrichedUser,
      };
    }

    return res;
  },

  async register(data: RegisterInput): Promise<ApiAuthSuccess> {
    const cleanPhone = data.phoneNumber.replace(/[\s\-.()]/g, "");

    const res = await apiClient.fetch<ApiAuthSuccess>("auth/register", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: cleanPhone,
        password: data.password,
        email: data.email ? data.email.trim() : undefined,
      }),
    });

    if (typeof window !== "undefined" && res.token) {
      localStorage.setItem("mc_auth_token", res.token);
      document.cookie = `mc_auth_token=${encodeURIComponent(res.token)}; path=/; max-age=604800; SameSite=Lax`;

      // If names provided, immediately persist profile in PostgreSQL via backend PATCH /users/me
      if (data.firstName || data.lastName) {
        try {
          await apiClient.fetch("users/me", {
            method: "PATCH",
            body: JSON.stringify({
              firstName: data.firstName || "Citoyen",
              lastName: data.lastName || "Actif",
            }),
          });
        } catch {
          // Profile init non-blocking
        }
      }

      const userObj: ApiAuthSuccess["user"] = {
        id: res.user.id,
        phoneNumber: res.user.phoneNumber,
        email: res.user.email,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        role: "CITIZEN",
        isSuperAdmin: false,
      };

      localStorage.setItem("mc_current_user", JSON.stringify(userObj));
      return {
        token: res.token,
        user: userObj,
      };
    }

    return res;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mc_auth_token");
      localStorage.removeItem("mc_current_user");
      document.cookie = "mc_auth_token=; path=/; max-age=0; SameSite=Lax";
    }
  },

  getCurrentUser(): ApiAuthSuccess["user"] | null {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mc_current_user");
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // Parse error
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("mc_auth_token");
  },
};
