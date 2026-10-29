export interface CreateQuarterCommand {
  associationId: string;
  name: string;
  city: string;
  description?: string;
  requesterUserId: string;
}
