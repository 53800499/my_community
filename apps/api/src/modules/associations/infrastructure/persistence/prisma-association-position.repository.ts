import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { AssociationPositionEntity } from '../../domain/entities/association-position.entity.js';
import { AssociationPositionReaderPort } from '../../application/ports/association-position-reader.port.js';
import { AssociationPositionWriterPort } from '../../application/ports/association-position-writer.port.js';

@Injectable()
export class PrismaAssociationPositionRepository
  implements AssociationPositionReaderPort, AssociationPositionWriterPort
{
  // Cache en mémoire persistant des postes personnalisés créés par association
  private static readonly customPositions = new Map<string, AssociationPositionEntity>();

  constructor(private readonly prisma: PrismaService) {}

  async listPositions(associationId: string): Promise<AssociationPositionEntity[]> {
    // 1. Récupérer les membres officiels de l'association dans Prisma
    const members = await this.prisma.associationMember.findMany({
      where: { associationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const getUserFullName = (member: (typeof members)[number] | undefined): string | null => {
      if (!member) return null;
      const p = member.user?.profile;
      if (p?.firstName || p?.lastName) {
        return `${p.firstName || ''} ${p.lastName || ''}`.trim();
      }
      return member.user?.email || member.user?.phoneNumber || null;
    };

    const president = members.find((m) => m.role === 'PRESIDENT');
    const secretary = members.find((m) => m.role === 'SECRETARY');
    const treasurer = members.find((m) => m.role === 'TREASURER');

    // 2. Initialiser les 4 postes clés statutaires si non déjà créés
    const statutoryPositions: AssociationPositionEntity[] = [
      AssociationPositionEntity.create({
        id: `stat-pres-${associationId}`,
        associationId,
        title: 'Président(e) du Bureau Exécutif',
        roleCategory: 'PRESIDENT',
        department: 'Présidence & Haute Direction',
        description: 'Représente légalement l’association, ordonne les dépenses et veille à l’application des résolutions de l’AG.',
        assignedUserId: president ? president.userId : null,
        assignedUserName: getUserFullName(president),
        isStatutory: true,
      }),
      AssociationPositionEntity.create({
        id: `stat-sec-${associationId}`,
        associationId,
        title: 'Secrétaire Général(e)',
        roleCategory: 'SECRETARY',
        department: 'Secrétariat & Administration',
        description: 'Assure la rédaction des procès-verbaux, la conservation des archives et la correspondance officielle.',
        assignedUserId: secretary ? secretary.userId : null,
        assignedUserName: getUserFullName(secretary),
        isStatutory: true,
      }),
      AssociationPositionEntity.create({
        id: `stat-tres-${associationId}`,
        associationId,
        title: 'Trésorier(ère) Général(e)',
        roleCategory: 'TREASURER',
        department: 'Finances & Comptabilité',
        description: 'Gère les fonds de l’association, tient le livre de caisse et recouvre les cotisations statutaires en FCFA.',
        assignedUserId: treasurer ? treasurer.userId : null,
        assignedUserName: getUserFullName(treasurer),
        isStatutory: true,
      }),
      AssociationPositionEntity.create({
        id: `stat-log-${associationId}`,
        associationId,
        title: 'Chargé(e) aux Logements & Résidences',
        roleCategory: 'BOARD_MEMBER',
        department: 'Patrimoine & Résidences',
        description: 'Supervise l’affectation des chambres, l’entretien des résidences et la délivrance des attestations d’occupation.',
        assignedUserId: null,
        assignedUserName: null,
        isStatutory: true,
      }),
    ];

    // 3. Récupérer les postes personnalisés créés pour cette association
    const custom = Array.from(
      PrismaAssociationPositionRepository.customPositions.values(),
    ).filter((p) => p.associationId === associationId);

    // Retourner l'organigramme combiné
    return [...statutoryPositions, ...custom];
  }

  async findPositionById(
    associationId: string,
    positionId: string,
  ): Promise<AssociationPositionEntity | null> {
    const all = await this.listPositions(associationId);
    return all.find((p) => p.id === positionId) ?? null;
  }

  async savePosition(position: AssociationPositionEntity): Promise<void> {
    PrismaAssociationPositionRepository.customPositions.set(position.id, position);
  }

  async updatePosition(position: AssociationPositionEntity): Promise<void> {
    PrismaAssociationPositionRepository.customPositions.set(position.id, position);

    // Si le poste assigne un membre, synchroniser avec Prisma AssociationMember
    if (position.assignedUserId) {
      const existing = await this.prisma.associationMember.findUnique({
        where: {
          associationId_userId: {
            associationId: position.associationId,
            userId: position.assignedUserId,
          },
        },
      });

      if (existing) {
        await this.prisma.associationMember.update({
          where: { id: existing.id },
          data: { role: position.roleCategory },
        });
      } else {
        await this.prisma.associationMember.create({
          data: {
            associationId: position.associationId,
            userId: position.assignedUserId,
            role: position.roleCategory,
          },
        });
      }
    }
  }

  async deletePosition(associationId: string, positionId: string): Promise<void> {
    PrismaAssociationPositionRepository.customPositions.delete(positionId);
  }
}
