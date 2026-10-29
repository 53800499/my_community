export interface UpdateProfileCommand {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  city?: string | null;
  avatarKey?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
