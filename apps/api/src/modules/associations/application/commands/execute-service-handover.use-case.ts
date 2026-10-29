import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssociationMandateEntity, MandateOfficer } from '../../domain/entities/association-mandate.entity.js';
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
  AssociationPositionReaderPort,
  ASSOCIATION_POSITION_READER_PORT,
} from '../ports/association-position-reader.port.js';
import {
  AssociationPositionWriterPort,
  ASSOCIATION_POSITION_WRITER_PORT,
} from '../ports/association-position-writer.port.js';
import {
  type AssociationMandateReaderPort,
  ASSOCIATION_MANDATE_READER_PORT,
} from '../ports/association-mandate-reader.port.js';
import {
  type AssociationMandateWriterPort,
  ASSOCIATION_MANDATE_WRITER_PORT,
} from '../ports/association-mandate-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { ExecuteServiceHandoverCommand } from './execute-service-handover.command.js';

export interface ExecuteServiceHandoverResult {
  previousMandate: AssociationMandateEntity | null;
  newMandate: AssociationMandateEntity;
}

/**
 * Cas d'Usage Applicatif : Passation de Service & Transmission des Pouvoirs Associatifs (SRP)
 * Exécute la transition de gouvernance après élection/candidature :
 * 1. Clôture formelle du mandat sortant (horodatage, PV, notes, solde financier transmis).
 * 2. Rétrogradation des accès administratifs du bureau sortant.
 * 3. Investiture du nouveau bureau exécutif (Président, Secrétaire, Trésorier, Commissions).
 * 4. Attribution des droits d'accès et permissions fines aux nouveaux dirigeants.
 * 5. Initialisation du nouveau mandat actif et traçabilité immuable dans l'audit.
 */
@Injectable()
export class ExecuteServiceHandoverUseCase {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly assocReader: AssociationReaderPort,
    @Inject(ASSOCIATION_WRITER_PORT)
    private readonly assocWriter: AssociationWriterPort,
    @Inject(ASSOCIATION_POSITION_READER_PORT)
    private readonly positionReader: AssociationPositionReaderPort,
    @Inject(ASSOCIATION_POSITION_WRITER_PORT)
    private readonly positionWriter: AssociationPositionWriterPort,
    @Inject(ASSOCIATION_MANDATE_READER_PORT)
    private readonly mandateReader: AssociationMandateReaderPort,
    @Inject(ASSOCIATION_MANDATE_WRITER_PORT)
    private readonly mandateWriter: AssociationMandateWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: ExecuteServiceHandoverCommand): Promise<ExecuteServiceHandoverResult> {
    if (
      !command.associationId ||
      !command.requesterUserId ||
      !command.mandateTitle ||
      !command.academicYear ||
      !command.newPresident ||
      !command.newPresident.userId ||
      !command.newPresident.userName
    ) {
      throw new BadRequestException('Paramètres obligatoires manquants pour la passation de service.');
    }

    // 1. Vérifier l'existence de l'association
    const association = await this.assocReader.findById(command.associationId);
    if (!association) {
      throw new NotFoundException(`Association introuvable: ${command.associationId}`);
    }

    // 2. Contrôle d'accès : seul le Président actuel ou un membre du bureau exécutif peut acter la passation
    const requester = await this.assocReader.findMember(
      command.associationId,
      command.requesterUserId,
    );
    if (!requester || (!requester.isPresident() && !requester.isExecutiveBureau())) {
      throw new ForbiddenException(
        'Accès refusé : seul le Président en exercice ou un membre du bureau exécutif peut acter la passation de service.',
      );
    }

    // Vérifier que le nouveau Président désigné est un membre adhérent de l'association
    const incomingPresMember = await this.assocReader.findMember(
      command.associationId,
      command.newPresident.userId,
    );
    if (!incomingPresMember) {
      throw new BadRequestException(
        "Le nouveau Président désigné doit obligatoirement être un membre adhérent de l'association.",
      );
    }

    if (command.newSecretary?.userId) {
      const incomingSecMember = await this.assocReader.findMember(
        command.associationId,
        command.newSecretary.userId,
      );
      if (!incomingSecMember) {
        throw new BadRequestException(
          "Le Secrétaire Général désigné doit obligatoirement être un membre adhérent de l'association.",
        );
      }
    }

    if (command.newTreasurer?.userId) {
      const incomingTresMember = await this.assocReader.findMember(
        command.associationId,
        command.newTreasurer.userId,
      );
      if (!incomingTresMember) {
        throw new BadRequestException(
          "Le Trésorier Général désigné doit obligatoirement être un membre adhérent de l'association.",
        );
      }
    }

    const handoverDate = command.handoverDate ?? new Date();
    const treasuryTransferredAmount = command.treasuryTransferredAmount ?? 0;

    // 3. Récupérer et clôturer le mandat sortant (s'il existe)
    let previousMandate = await this.mandateReader.findActiveMandate(command.associationId);
    let outgoingPresidentName = previousMandate?.presidentName ?? null;
    let outgoingPresidentUserId = previousMandate?.presidentUserId ?? null;

    if (previousMandate) {
      previousMandate.completeMandate({
        endDate: handoverDate,
        handoverDate,
        outgoingPresidentName: previousMandate.presidentName,
        incomingPresidentName: command.newPresident.userName,
        handoverNotes: command.handoverNotes ?? 'Passation de service statutaire actée.',
        treasuryTransferredAmount,
        pvDocumentRef: command.pvDocumentRef ?? undefined,
        at: handoverDate,
      });
      await this.mandateWriter.updateMandate(previousMandate);

      // Si l'ancien Président n'est pas réélu, rétrograder son rôle dans AssociationMember
      if (
        outgoingPresidentUserId &&
        outgoingPresidentUserId !== command.newPresident.userId
      ) {
        const oldPresMember = await this.assocReader.findMember(
          command.associationId,
          outgoingPresidentUserId,
        );
        if (oldPresMember) {
          oldPresMember.updateRole('MEMBER', handoverDate);
          await this.assocWriter.updateMemberRole(oldPresMember);
        }
      }
    }

    // 4. Mettre à jour les postes officiels et synchroniser les rôles & permissions
    const existingPositions = await this.positionReader.listPositions(command.associationId);
    const officersList: MandateOfficer[] = [];

    // 4.1 Poste de Président
    const presidentPosition = existingPositions.find(
      (p) => p.roleCategory === 'PRESIDENT' || p.isStatutory && p.title.toLowerCase().includes('président'),
    );
    if (presidentPosition) {
      presidentPosition.assignMember({
        userId: command.newPresident.userId,
        userName: command.newPresident.userName,
        termStartDate: handoverDate,
        at: handoverDate,
      });
      await this.positionWriter.updatePosition(presidentPosition);

      officersList.push({
        positionId: presidentPosition.id,
        positionTitle: presidentPosition.title,
        userId: command.newPresident.userId,
        userName: command.newPresident.userName,
        roleCategory: 'PRESIDENT',
        startDate: handoverDate,
      });
    }

    // Mettre à jour ou ajouter le nouveau Président dans AssociationMember
    const newPresMember = await this.assocReader.findMember(
      command.associationId,
      command.newPresident.userId,
    );
    if (newPresMember) {
      newPresMember.updateRole('PRESIDENT', handoverDate);
      await this.assocWriter.updateMemberRole(newPresMember);
    } else {
      await this.assocWriter.addMember(
        AssociationMemberEntity.create({
          id: randomUUID(),
          associationId: command.associationId,
          userId: command.newPresident.userId,
          role: 'PRESIDENT',
          joinedAt: handoverDate,
        }),
      );
    }

    // 4.2 Poste de Secrétaire Général (si désigné)
    if (command.newSecretary) {
      const secretaryPosition = existingPositions.find(
        (p) => p.roleCategory === 'SECRETARY' || (p.isStatutory && p.title.toLowerCase().includes('secrétaire')),
      );
      if (secretaryPosition) {
        secretaryPosition.assignMember({
          userId: command.newSecretary.userId,
          userName: command.newSecretary.userName,
          termStartDate: handoverDate,
          at: handoverDate,
        });
        await this.positionWriter.updatePosition(secretaryPosition);

        officersList.push({
          positionId: secretaryPosition.id,
          positionTitle: secretaryPosition.title,
          userId: command.newSecretary.userId,
          userName: command.newSecretary.userName,
          roleCategory: 'SECRETARY',
          startDate: handoverDate,
        });
      }

      const secMember = await this.assocReader.findMember(
        command.associationId,
        command.newSecretary.userId,
      );
      if (secMember) {
        secMember.updateRole('SECRETARY', handoverDate);
        await this.assocWriter.updateMemberRole(secMember);
      } else {
        await this.assocWriter.addMember(
          AssociationMemberEntity.create({
            id: randomUUID(),
            associationId: command.associationId,
            userId: command.newSecretary.userId,
            role: 'SECRETARY',
            joinedAt: handoverDate,
          }),
        );
      }
    }

    // 4.3 Poste de Trésorier Général (si désigné)
    if (command.newTreasurer) {
      const treasurerPosition = existingPositions.find(
        (p) => p.roleCategory === 'TREASURER' || (p.isStatutory && p.title.toLowerCase().includes('trésorier')),
      );
      if (treasurerPosition) {
        treasurerPosition.assignMember({
          userId: command.newTreasurer.userId,
          userName: command.newTreasurer.userName,
          termStartDate: handoverDate,
          at: handoverDate,
        });
        await this.positionWriter.updatePosition(treasurerPosition);

        officersList.push({
          positionId: treasurerPosition.id,
          positionTitle: treasurerPosition.title,
          userId: command.newTreasurer.userId,
          userName: command.newTreasurer.userName,
          roleCategory: 'TREASURER',
          startDate: handoverDate,
        });
      }

      const tresMember = await this.assocReader.findMember(
        command.associationId,
        command.newTreasurer.userId,
      );
      if (tresMember) {
        tresMember.updateRole('TREASURER', handoverDate);
        await this.assocWriter.updateMemberRole(tresMember);
      } else {
        await this.assocWriter.addMember(
          AssociationMemberEntity.create({
            id: randomUUID(),
            associationId: command.associationId,
            userId: command.newTreasurer.userId,
            role: 'TREASURER',
            joinedAt: handoverDate,
          }),
        );
      }
    }

    // 4.4 Autres postes attribués
    if (command.otherOfficers && command.otherOfficers.length > 0) {
      for (const off of command.otherOfficers) {
        const targetPos = existingPositions.find((p) => p.id === off.positionId);
        if (targetPos) {
          targetPos.assignMember({
            userId: off.userId,
            userName: off.userName,
            termStartDate: handoverDate,
            at: handoverDate,
          });
          await this.positionWriter.updatePosition(targetPos);

          officersList.push({
            positionId: targetPos.id,
            positionTitle: targetPos.title,
            userId: off.userId,
            userName: off.userName,
            roleCategory: targetPos.roleCategory,
            startDate: handoverDate,
          });

          // S'assurer qu'il est membre
          const existingMem = await this.assocReader.findMember(command.associationId, off.userId);
          if (existingMem) {
            if (existingMem.role === 'MEMBER') {
              existingMem.updateRole(targetPos.roleCategory, handoverDate);
              await this.assocWriter.updateMemberRole(existingMem);
            }
          } else {
            await this.assocWriter.addMember(
              AssociationMemberEntity.create({
                id: randomUUID(),
                associationId: command.associationId,
                userId: off.userId,
                role: targetPos.roleCategory,
                joinedAt: handoverDate,
              }),
            );
          }
        }
      }
    }

    // 5. Créer et persister le Nouveau Mandat Actif
    const newMandateId = randomUUID();
    const newMandate = AssociationMandateEntity.create({
      id: newMandateId,
      associationId: command.associationId,
      title: command.mandateTitle,
      academicYear: command.academicYear,
      startDate: handoverDate,
      status: 'ACTIVE',
      presidentUserId: command.newPresident.userId,
      presidentName: command.newPresident.userName,
      secretaryUserId: command.newSecretary?.userId ?? null,
      secretaryName: command.newSecretary?.userName ?? null,
      treasurerUserId: command.newTreasurer?.userId ?? null,
      treasurerName: command.newTreasurer?.userName ?? null,
      officers: officersList,
      handoverDate,
      outgoingPresidentName,
      incomingPresidentName: command.newPresident.userName,
      handoverNotes: command.handoverNotes ?? null,
      treasuryTransferredAmount,
      pvDocumentRef: command.pvDocumentRef ?? null,
      signedAt: handoverDate,
    });

    await this.mandateWriter.saveMandate(newMandate);

    // 6. Journalisation dans l'Audit immuable
    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'ASSOCIATION_HANDOVER_EXECUTED',
          resourceType: 'AssociationMandate',
          resourceId: newMandateId,
          createdAt: handoverDate,
          payload: {
            associationId: command.associationId,
            previousMandateId: previousMandate?.id ?? null,
            newMandateId,
            outgoingPresidentName,
            incomingPresidentName: command.newPresident.userName,
            academicYear: command.academicYear,
            treasuryTransferredAmount,
            handoverDate: handoverDate.toISOString(),
          },
        }),
      );
    }

    return {
      previousMandate,
      newMandate,
    };
  }
}
