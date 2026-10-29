import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';
import { AssociationMandateResponseDto } from '../../presentation/http/dto/association-mandate-response.dto.js';

export class AssociationMandateMapper {
  public static toResponseDto(entity: AssociationMandateEntity): AssociationMandateResponseDto {
    return {
      id: entity.id,
      associationId: entity.associationId,
      title: entity.title,
      academicYear: entity.academicYear,
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate ? entity.endDate.toISOString() : null,
      status: entity.status,
      presidentUserId: entity.presidentUserId,
      presidentName: entity.presidentName,
      secretaryUserId: entity.secretaryUserId,
      secretaryName: entity.secretaryName,
      treasurerUserId: entity.treasurerUserId,
      treasurerName: entity.treasurerName,
      officers: entity.officers.map((o) => ({
        positionId: o.positionId,
        positionTitle: o.positionTitle,
        userId: o.userId,
        userName: o.userName,
        roleCategory: o.roleCategory,
        startDate: o.startDate ? o.startDate.toISOString() : undefined,
        endDate: o.endDate ? o.endDate.toISOString() : undefined,
      })),
      handoverDate: entity.handoverDate ? entity.handoverDate.toISOString() : null,
      outgoingPresidentName: entity.outgoingPresidentName,
      incomingPresidentName: entity.incomingPresidentName,
      handoverNotes: entity.handoverNotes,
      treasuryTransferredAmount: entity.treasuryTransferredAmount,
      pvDocumentRef: entity.pvDocumentRef,
      signedAt: entity.signedAt ? entity.signedAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
