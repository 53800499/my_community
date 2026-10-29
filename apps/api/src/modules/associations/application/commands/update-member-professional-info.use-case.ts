import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from '../ports/association-writer.port.js';
import {
  AuditLoggerPort,
  AUDIT_LOGGER_PORT,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { UpdateMemberProfessionalInfoCommand } from './update-member-professional-info.command.js';

/**
 * Cas d'Usage Applicatif : Renseignement du Profil Professionnel d'un Membre (SRP / DIP)
 * Règle Métier Absolue : Réservé EXCLUSIVEMENT aux associations de typologie PROFESSIONNELLE ou ÉDUCATIVE.
 */
@Injectable()
export class UpdateMemberProfessionalInfoUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly assocWriter: AssociationWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: UpdateMemberProfessionalInfoCommand): Promise<AssociationMemberEntity> {
    if (!command.associationId || !command.memberId || !command.requesterUserId) {
      throw new BadRequestException("Paramètres obligatoires manquants.");
    }

    // 1. Vérifier l'association
    const association = await this.assocReader.findById(command.associationId);
    if (!association) {
      throw new NotFoundException(`Association introuvable: ${command.associationId}`);
    }

    // 2. Règle absolue : Seules les associations professionnelles ou éducatives sont autorisées
    if (!association.isProfessionalOrEducational()) {
      throw new BadRequestException(
        "L'insertion des informations professionnelles est strictement réservée aux associations de type professionnelle ou éducative.",
      );
    }

    // 3. Récupérer le membre cible
    const targetMember = await this.assocReader.findMemberById(
      command.associationId,
      command.memberId,
    );
    if (!targetMember) {
      throw new NotFoundException(`Membre introuvable: ${command.memberId}`);
    }

    // 4. Contrôle d'accès : le membre lui-même OU un dirigeant du bureau exécutif
    const isSelf = targetMember.userId === command.requesterUserId;
    if (!isSelf) {
      const requester = await this.assocReader.findMember(
        command.associationId,
        command.requesterUserId,
      );
      if (!requester || (!requester.isPresident() && !requester.isExecutiveBureau())) {
        throw new ForbiddenException(
          "Accès refusé : vous ne pouvez modifier que vos propres informations professionnelles ou devez faire partie du bureau exécutif.",
        );
      }
    }

    // 5. Mettre à jour l'entité de domaine
    targetMember.updateProfessionalInfo(command.professionalInfo);

    // 6. Persister via le port writer
    await this.assocWriter.updateMemberProfessionalInfo(
      command.associationId,
      command.memberId,
      command.professionalInfo,
    );

    // 7. Audit log
    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'MEMBER_PROFESSIONAL_INFO_UPDATED',
          resourceType: 'ASSOCIATION_MEMBER',
          resourceId: targetMember.id,
          payload: {
            associationId: command.associationId,
            memberId: targetMember.id,
            jobTitle: command.professionalInfo.currentJobTitle,
            company: command.professionalInfo.companyOrOrganization,
            sector: command.professionalInfo.industrySector,
          },
          createdAt: new Date(),
        }),
      );
    }

    return targetMember;
  }
}
