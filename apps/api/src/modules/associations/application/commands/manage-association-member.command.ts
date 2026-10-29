import { AssociationRole } from '../../domain/entities/association-member.entity.js';

export interface ManageAssociationMemberCommand {
  associationId: string;
  requesterUserId: string;
  targetUserId: string;
  role: AssociationRole;
  action: 'ADD' | 'UPDATE' | 'REMOVE';
  isPlatformAdmin?: boolean;
}
