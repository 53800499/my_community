export interface LoginCommand {
  identifier: string; // Numéro de téléphone ou email
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}
