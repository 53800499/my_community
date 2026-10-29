import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';
import { AssociationPositionResponseDto } from '../../presentation/http/dto/association-position-response.dto.js';

/**
 * Data Mapper Pur : AssociationPosition (SRP & Découplage)
 */
export class AssociationPositionMapper {
  public static toResponseDto(entity: AssociationPositionEntity): AssociationPositionResponseDto {
    return {
      id: entity.id,
      associationId: entity.associationId,
      title: entity.title,
      roleCategory: entity.roleCategory,
      department: entity.department,
      description: entity.description,
      assignedUserId: entity.assignedUserId,
      assignedUserName: entity.assignedUserName,
      termStartDate: entity.termStartDate ? entity.termStartDate.toISOString() : null,
      termEndDate: entity.termEndDate ? entity.termEndDate.toISOString() : null,
      isStatutory: entity.isStatutory,
      status: entity.status,
      accessSpaces: entity.accessSpaces,
      permissions: entity.permissions,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
