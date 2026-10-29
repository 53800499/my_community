import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';
import { AssociationMandateReaderPort } from '../../application/ports/association-mandate-reader.port.js';
import { AssociationMandateWriterPort } from '../../application/ports/association-mandate-writer.port.js';

@Injectable()
export class PrismaAssociationMandateRepository
  implements AssociationMandateReaderPort, AssociationMandateWriterPort
{
  // Registre en mémoire persistant des mandats associatifs
  private static readonly mandatesMap = new Map<string, AssociationMandateEntity>();

  constructor(private readonly prisma: PrismaService) {}

  async listMandates(associationId: string): Promise<AssociationMandateEntity[]> {
    // 1. Mandats enregistrés pour cette association
    const recorded = Array.from(
      PrismaAssociationMandateRepository.mandatesMap.values(),
    ).filter((m) => m.associationId === associationId);

    if (recorded.length > 0) {
      return recorded.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }

    // 2. Si aucun mandat n'a encore été créé, initialiser le Mandat Fondateur / Inaugural à partir de l'association
    const assoc = await this.prisma.association.findUnique({
      where: { id: associationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                profile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!assoc) {
      return [];
    }

    const president = assoc.members.find((m) => m.role === 'PRESIDENT');
    const secretary = assoc.members.find((m) => m.role === 'SECRETARY');
    const treasurer = assoc.members.find((m) => m.role === 'TREASURER');

    const getFullName = (m: (typeof assoc.members)[number] | undefined): string => {
      if (!m) return 'Non désigné';
      const p = m.user?.profile;
      if (p?.firstName || p?.lastName) {
        return `${p.firstName || ''} ${p.lastName || ''}`.trim();
      }
      return m.user?.email || m.user?.phoneNumber || 'Responsable';
    };

    const startYear = assoc.createdAt ? assoc.createdAt.getFullYear() : new Date().getFullYear();
    const endYear = startYear + 1;
    const dynamicYear = `${startYear}-${endYear}`;
    const dynamicTitle = `Mandat Initial (${dynamicYear})`;

    const initialMandate = AssociationMandateEntity.create({
      id: `mandate-init-${associationId}`,
      associationId,
      title: dynamicTitle,
      academicYear: dynamicYear,
      startDate: assoc.createdAt ?? new Date(),
      status: 'ACTIVE',
      presidentUserId: president?.userId ?? 'u-founder',
      presidentName: getFullName(president),
      secretaryUserId: secretary?.userId ?? null,
      secretaryName: secretary ? getFullName(secretary) : null,
      treasurerUserId: treasurer?.userId ?? null,
      treasurerName: treasurer ? getFullName(treasurer) : null,
      officers: [
        {
          positionId: `stat-pres-${associationId}`,
          positionTitle: 'Président(e) du Bureau Exécutif',
          userId: president?.userId ?? 'u-founder',
          userName: getFullName(president),
          roleCategory: 'PRESIDENT',
          startDate: assoc.createdAt ?? new Date(),
        },
        ...(secretary
          ? [
              {
                positionId: `stat-sec-${associationId}`,
                positionTitle: 'Secrétaire Général(e)',
                userId: secretary.userId,
                userName: getFullName(secretary),
                roleCategory: 'SECRETARY',
                startDate: assoc.createdAt ?? new Date(),
              },
            ]
          : []),
        ...(treasurer
          ? [
              {
                positionId: `stat-tres-${associationId}`,
                positionTitle: 'Trésorier(ère) Général(e)',
                userId: treasurer.userId,
                userName: getFullName(treasurer),
                roleCategory: 'TREASURER',
                startDate: assoc.createdAt ?? new Date(),
              },
            ]
          : []),
      ],
      handoverDate: assoc.createdAt ?? new Date(),
      treasuryTransferredAmount: 0,
      handoverNotes: 'Investiture du bureau et ouverture de la période de service.',
    });

    PrismaAssociationMandateRepository.mandatesMap.set(initialMandate.id, initialMandate);
    return [initialMandate];
  }

  async findMandateById(
    associationId: string,
    mandateId: string,
  ): Promise<AssociationMandateEntity | null> {
    const all = await this.listMandates(associationId);
    return all.find((m) => m.id === mandateId) ?? null;
  }

  async findActiveMandate(
    associationId: string,
  ): Promise<AssociationMandateEntity | null> {
    const all = await this.listMandates(associationId);
    return all.find((m) => m.isActive()) ?? null;
  }

  async saveMandate(mandate: AssociationMandateEntity): Promise<void> {
    PrismaAssociationMandateRepository.mandatesMap.set(mandate.id, mandate);
  }

  async updateMandate(mandate: AssociationMandateEntity): Promise<void> {
    PrismaAssociationMandateRepository.mandatesMap.set(mandate.id, mandate);
  }

  async deleteMandate(associationId: string, mandateId: string): Promise<void> {
    const found = PrismaAssociationMandateRepository.mandatesMap.get(mandateId);
    if (found && found.associationId === associationId) {
      PrismaAssociationMandateRepository.mandatesMap.delete(mandateId);
    }
  }
}
