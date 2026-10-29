import { MemberProfessionalInfo } from '../../domain/entities/association-member.entity.js';

export interface UpdateMemberProfessionalInfoCommand {
  associationId: string;
  memberId: string;
  requesterUserId: string;
  professionalInfo: MemberProfessionalInfo;
}
