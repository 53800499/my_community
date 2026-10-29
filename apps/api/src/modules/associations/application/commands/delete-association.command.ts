export interface DeleteAssociationCommand {
  associationId: string;
  userId: string;
  isPlatformAdmin?: boolean;
  confirmationName?: string;
}
