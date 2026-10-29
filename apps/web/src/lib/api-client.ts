import { MyCommunityApiClient } from "@my-community/api-client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : (process.env.API_BACKEND_URL || "http://localhost:3001") + "/api/v1");

export const apiClient = new MyCommunityApiClient({
  baseUrl: API_BASE_URL,
  getAuthToken: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mc_auth_token");
      if (stored) return stored;
    }
    return null;
  },
});

export const STORAGE_KEYS = {
  COMMUNITIES: "mc_dyn_communities",
  PROPOSALS: "mc_dyn_proposals",
  MEMBERSHIPS: "mc_dyn_memberships",
  ASSOCIATIONS: "mc_dyn_associations",
  QUARTERS: "mc_dyn_quarters",
  BUILDINGS: "mc_dyn_buildings",
  ROOMS: "mc_dyn_rooms",
  OCCUPATIONS: "mc_dyn_occupations",
  ASSOCIATION_CONTRACTS: "mc_dyn_association_contracts",
  BUILDING_CONVENTIONS: "mc_dyn_building_conventions",
  ASSOCIATION_INTEGRATION_RULES: "mc_dyn_association_integration_rules",
  ASSOCIATION_EXECUTIVE_CONTRACTS: "mc_dyn_association_executive_contracts",
  RESIDENCE_ADMISSION_RULES: "mc_dyn_residence_admission_rules",
  RESIDENT_DELEGATE_CONTRACTS: "mc_dyn_resident_delegate_contracts",
  FINANCE_TRANSACTIONS: "mc_dyn_finance_transactions",
  FINANCE_COTISATIONS: "mc_dyn_finance_cotisations",
  FINANCE_LEASES: "mc_dyn_finance_leases",
  FINANCE_RENT_EXPENSES: "mc_dyn_finance_rent_expenses",
  FINANCE_FEE_PLANS: "mc_dyn_finance_fee_plans",
  FINANCE_FEE_DUES: "mc_dyn_finance_fee_dues",
  MANDATE_AUDIT_LOGS: "mc_dyn_mandate_audit_logs",
  ASSOCIATION_MANDATES: "mc_dyn_association_mandates",
  FEED_POSTS: "mc_dyn_feed_posts",
} as const;

export const isUuidV4 = (val?: string | null): boolean => {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());
};

export const generateUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function getLocalState<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let changed = false;
      const sanitized = parsed.map((item: unknown) => {
        if (
          item &&
          typeof item === "object" &&
          "id" in item &&
          typeof (item as { id: unknown }).id === "string" &&
          !isUuidV4((item as { id: string }).id)
        ) {
          changed = true;
          return { ...(item as Record<string, unknown>), id: generateUuid() };
        }
        return item;
      });
      if (changed) {
        localStorage.setItem(key, JSON.stringify(sanitized));
        return sanitized as unknown as T;
      }
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

export function setLocalState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota
  }
}
