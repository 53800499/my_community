import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssociationMandateEntity,
  MandateOfficer,
  MandateStatus,
} from '../../domain/entities/association-mandate.entity.js';
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
import { CreateAssociationMandateCommand } from './create-association-mandate.command.js';

/**
 * Cas d'Usage Applicatif : Définition et Création d'une Mandature Associative (SRP / DIP)
 * Permet de définir dynamiquement chaque mandature sans aucune valeur en dur :
 * Titre sur-mesure, période d'exercice, bureau exécutif et dates d'investiture.
 */
@Injectable()
export class CreateAssociationMandateUseCase {
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

  async execute(command: CreateAssociationMandateCommand): Promise<AssociationMandateEntity> {
    if (!command.associationId || !command.requesterUserId) {
      throw new BadRequestException("Paramètres d'identification obligatoires manquants.");
    }
    if (!command.title || command.title.trim().length < 3) {
      throw new Error('Le titre du mandat doit comporter au moins 3 caractères.');
    }
    if (!command.academicYear || command.academicYear.trim().length === 0) {
      throw new Error("L'année ou la période d'exercice est obligatoire.");
    }
    if (!command.presidentUserId || !command.presidentName) {
      throw new Error('Le Président désigné pour ce mandat est obligatoire.');
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
        'Accès refusé : seul le Président ou un membre du bureau exécutif peut définir une nouvelle mandature.',
      );
    }

    const presMember = await this.assocReader.findMember(
      command.associationId,
      command.presidentUserId,
    );
    if (!presMember) {
      throw new BadRequestException(
        "Le Président désigné doit obligatoirement être un membre adhérent de l'association.",
      );
    }

    if (command.secretaryUserId) {
      const secMember = await this.assocReader.findMember(
        command.associationId,
        command.secretaryUserId,
      );
      if (!secMember) {
        throw new BadRequestException(
          "Le Secrétaire Général désigné doit obligatoirement être un membre de l'association.",
        );
      }
    }

    if (command.treasurerUserId) {
      const tresMember = await this.assocReader.findMember(
        command.associationId,
        command.treasurerUserId,
      );
      if (!tresMember) {
        throw new BadRequestException(
          "Le Trésorier Général désigné doit obligatoirement être un membre de l'association.",
        );
      }
    }

    const mandateId = randomUUID();
    const setAsActive = command.setAsActive ?? true;

    // Si le nouveau mandat doit être actif, clôturer le mandat précédemment actif
    if (setAsActive) {
      const activeMandate = await this.mandateReader.findActiveMandate(command.associationId);
      if (activeMandate && activeMandate.id !== mandateId) {
        activeMandate.completeMandate({
          endDate: command.startDate,
          handoverDate: command.startDate,
          incomingPresidentName: command.presidentName,
          outgoingPresidentName: activeMandate.presidentName,
          handoverNotes: `Passation de service automatique vers le mandat "${command.title}".`,
          at: new Date(),
        });
        await this.mandateWriter.updateMandate(activeMandate);
      }
    }

    const officers: MandateOfficer[] = [
      {
        positionId: `pos-pres-${mandateId.slice(0, 8)}`,
        positionTitle: 'Président(e) du Bureau Exécutif',
        userId: command.presidentUserId,
        userName: command.presidentName,
        roleCategory: 'PRESIDENT',
        startDate: command.startDate,
      },
      ...(command.secretaryUserId && command.secretaryName
        ? [
            {
              positionId: `pos-sec-${mandateId.slice(0, 8)}`,
              positionTitle: 'Secrétaire Général(e)',
              userId: command.secretaryUserId,
              userName: command.secretaryName,
              roleCategory: 'SECRETARY',
              startDate: command.startDate,
            },
          ]
        : []),
      ...(command.treasurerUserId && command.treasurerName
        ? [
            {
              positionId: `pos-tres-${mandateId.slice(0, 8)}`,
              positionTitle: 'Trésorier(ère) Général(e)',
              userId: command.treasurerUserId,
              userName: command.treasurerName,
              roleCategory: 'TREASURER',
              startDate: command.startDate,
            },
          ]
        : []),
      ...(command.officers
        ? command.officers.map((o) => ({
            positionId: o.positionId || `pos-${randomUUID().slice(0, 8)}`,
            positionTitle: o.positionTitle,
            userId: o.userId,
            userName: o.userName,
            roleCategory: o.roleCategory,
            startDate: o.startDate || command.startDate,
            endDate: o.endDate,
          }))
        : []),
    ];

    const mandate = AssociationMandateEntity.create({
      id: mandateId,
      associationId: command.associationId,
      title: command.title,
      academicYear: command.academicYear,
      startDate: command.startDate,
      endDate: command.endDate ?? null,
      status: setAsActive ? 'ACTIVE' : 'COMPLETED',
      presidentUserId: command.presidentUserId,
      presidentName: command.presidentName,
      secretaryUserId: command.secretaryUserId ?? null,
      secretaryName: command.secretaryName ?? null,
      treasurerUserId: command.treasurerUserId ?? null,
      treasurerName: command.treasurerName ?? null,
      officers,
      handoverNotes: command.description ?? null,
    });

    await this.mandateWriter.saveMandate(mandate);

    // Mettre à jour le rôle du nouveau président dans l'association
    if (setAsActive) {
      const presMember = await this.assocReader.findMember(
        command.associationId,
        command.presidentUserId,
      );
      if (presMember) {
        presMember.updateRole('PRESIDENT', command.startDate);
        await this.assocWriter.updateMemberRole(presMember);
      }
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_MANDATE_CREATED',
          resourceType: 'ASSOCIATION_MANDATE',
          resourceId: mandate.id,
          payload: {
            associationId: command.associationId,
            mandateTitle: mandate.title,
            academicYear: mandate.academicYear,
            presidentName: mandate.presidentName,
            status: mandate.status,
          },
          createdAt: new Date(),
        }),
      );
    }

    return mandate;
  }
}
