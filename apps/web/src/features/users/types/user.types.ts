export interface ApiUserSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  avatarKey?: string | null;
}
