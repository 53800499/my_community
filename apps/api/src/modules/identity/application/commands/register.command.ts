export interface RegisterCommand {
  id?: string;
  phoneNumber: string;
  password: string;
  email?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
