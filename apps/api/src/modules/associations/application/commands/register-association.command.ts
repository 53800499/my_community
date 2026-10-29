export interface RegisterAssociationCommand {
  name: string;
  acronym?: string;
  registrationNumber?: string;
  description?: string;
  presidentUserId: string;
}
