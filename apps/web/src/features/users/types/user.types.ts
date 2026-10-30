import { PlatformRole } from "@/features/auth/types/permissions.types";

export interface ApiUserSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  avatarKey?: string | null;
  role?: PlatformRole;
  status?: "ACTIVE" | "SUSPENDED";
  registeredAt?: string;
}
