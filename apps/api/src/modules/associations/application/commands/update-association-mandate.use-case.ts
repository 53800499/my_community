import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';
import {
  type AssociationMandateReaderPort,
  ASSOCIATION_MANDATE_READER_PORT,
} from '../ports/association-mandate-reader.port.js';
import {
  type AssociationMandateWriterPort,
  ASSOCIATION_MANDATE_WRITER_PORT,
} from '../ports/association-mandate-writer.port.js';
import {
  type AuditLoggerPort,
  AUDIT_LOGGER_PORT,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { UpdateAssociationMandateCommand } from './update-association-mandate.command.js';

/**
 * Cas d'Usage Applicatif : Mise à Jour Dynamique d'une Mandature Associative (SRP / DIP)
 */
@Injectable()
export class UpdateAssociationMandateUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_MANDATE_READER_PORT)
    private readonly mandateReader: AssociationMandateReaderPort,
    @Inject(ASSOCIATION_MANDATE_WRITER_PORT)
    private readonly mandateWriter: AssociationMandateWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: UpdateAssociationMandateCommand): Promise<AssociationMandateEntity> {
    if (!command.associationId || !command.mandateId || !command.requesterUserId) {
      throw new BadRequestException("Paramètres obligatoires manquants.");
    }

    const association = await this.assocReader.findById(command.associationId);
    if (!association) {
      throw new NotFoundException(`Association introuvable: ${command.associationId}`);
    }

    const requester = await this.assocReader.findMember(
      command.associationId,
      command.requesterUserId,
    );
    if (!requester || (!requester.isPresident() && !requester.isExecutiveBureau())) {
      throw new ForbiddenException(
        'Accès refusé : seul le Président ou un membre du bureau exécutif peut modifier la mandature.',
      );
    }

    const mandate = await this.mandateReader.findMandateById(
      command.associationId,
      command.mandateId,
    );
    if (!mandate) {
      throw new NotFoundException(`Mandature introuvable: ${command.mandateId}`);
    }

    if (command.status === 'ACTIVE' && !mandate.isActive()) {
      const currentActive = await this.mandateReader.findActiveMandate(command.associationId);
      if (currentActive && currentActive.id !== mandate.id) {
        currentActive.completeMandate({
          at: new Date(),
        });
        await this.mandateWriter.updateMandate(currentActive);
      }
      mandate.activate();
    } else if (command.status === 'ARCHIVED') {
      mandate.archive();
    } else if (command.status === 'COMPLETED' && mandate.isActive()) {
      mandate.completeMandate({
        endDate: command.endDate ?? new Date(),
        handoverNotes: command.handoverNotes ?? undefined,
        treasuryTransferredAmount: command.treasuryTransferredAmount,
        pvDocumentRef: command.pvDocumentRef ?? undefined,
      });
    }

    mandate.updateDetails({
      title: command.title,
      academicYear: command.academicYear,
      startDate: command.startDate,
      endDate: command.endDate,
      presidentUserId: command.presidentUserId,
      presidentName: command.presidentName,
      secretaryUserId: command.secretaryUserId,
      secretaryName: command.secretaryName,
      treasurerUserId: command.treasurerUserId,
      treasurerName: command.treasurerName,
      handoverNotes: command.handoverNotes,
      treasuryTransferredAmount: command.treasuryTransferredAmount,
      pvDocumentRef: command.pvDocumentRef,
    });

    await this.mandateWriter.updateMandate(mandate);

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MANDATE_UPDATED',
          resourceType: 'ASSOCIATION_MANDATE',
          resourceId: mandate.id,
          payload: {
            associationId: command.associationId,
            mandateTitle: mandate.title,
            academicYear: mandate.academicYear,
            status: mandate.status,
          },
          createdAt: new Date(),
        }),
      );
    }

    return mandate;
  }
}
