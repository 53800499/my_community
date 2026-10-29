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
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from '../ports/association-writer.port.js';
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

export interface ActivateAssociationMandateCommand {
  associationId: string;
  mandateId: string;
  requesterUserId: string;
}

/**
 * Cas d'Usage Applicatif : Activation d'une Mandature Associative (SRP / DIP)
 */
@Injectable()
export class ActivateAssociationMandateUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly assocWriter: AssociationWriterPort,
    @Inject(ASSOCIATION_MANDATE_READER_PORT)
    private readonly mandateReader: AssociationMandateReaderPort,
    @Inject(ASSOCIATION_MANDATE_WRITER_PORT)
    private readonly mandateWriter: AssociationMandateWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: ActivateAssociationMandateCommand): Promise<AssociationMandateEntity> {
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
        'Accès refusé : seul le Président ou un membre du bureau exécutif peut activer un mandat.',
      );
    }

    const targetMandate = await this.mandateReader.findMandateById(
      command.associationId,
      command.mandateId,
    );
    if (!targetMandate) {
      throw new NotFoundException(`Mandat introuvable: ${command.mandateId}`);
    }

    // Clôturer le mandat précédemment actif
    const currentActive = await this.mandateReader.findActiveMandate(command.associationId);
    if (currentActive && currentActive.id !== targetMandate.id) {
      currentActive.completeMandate({
        endDate: new Date(),
        handoverDate: new Date(),
        incomingPresidentName: targetMandate.presidentName,
        outgoingPresidentName: currentActive.presidentName,
        handoverNotes: `Passation vers le mandat "${targetMandate.title}".`,
        at: new Date(),
      });
      await this.mandateWriter.updateMandate(currentActive);
    }

    targetMandate.activate();
    await this.mandateWriter.updateMandate(targetMandate);

    // Mettre à jour le rôle de Président dans l'association
    const presMember = await this.assocReader.findMember(
      command.associationId,
      targetMandate.presidentUserId,
    );
    if (presMember) {
      presMember.updateRole('PRESIDENT', new Date());
      await this.assocWriter.updateMemberRole(presMember);
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MANDATE_ACTIVATED',
          resourceType: 'ASSOCIATION_MANDATE',
          resourceId: targetMandate.id,
          payload: {
            associationId: command.associationId,
            mandateTitle: targetMandate.title,
            academicYear: targetMandate.academicYear,
            presidentName: targetMandate.presidentName,
          },
          createdAt: new Date(),
        }),
      );
    }

    return targetMandate;
  }
}
