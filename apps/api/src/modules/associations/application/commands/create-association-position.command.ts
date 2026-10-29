import { AssociationRole } from '../../domain/entities/association-member.entity.js';

export interface CreateAssociationPositionCommand {
  associationId: string;
  requesterUserId: string;
  title: string;
  roleCategory?: AssociationRole;
  department?: string;
  description?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  termStartDate?: Date;
  termEndDate?: Date;
  isPlatformAdmin?: boolean;
}
