export interface UpdateQuarterCommand {
  quarterId: string;
  name?: string;
  city?: string;
  description?: string | null;
  requesterUserId: string;
}
