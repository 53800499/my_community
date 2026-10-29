import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
} from '../ports/finance-reader.port.js';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { BuildingLeaseEntity } from '../../domain/entities/building-lease.entity.js';

export interface CreateBuildingLeaseCommand {
  buildingId: string;
  associationId: string;
  monthlyRentAmount: number;
  paymentDayOfMonth?: number;
  leaseStartDate: Date;
  leaseEndDate?: Date | null;
}

@Injectable()
export class CreateBuildingLeaseUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
  ) {}

  public async execute(command: CreateBuildingLeaseCommand): Promise<BuildingLeaseEntity> {
    const existing = await this.reader.findBuildingLeaseByBuildingId(command.buildingId);
    if (existing && existing.isActive) {
      throw new ConflictException('Ce bâtiment dispose déjà d’un bail actif pour cette association.');
    }

    const lease = BuildingLeaseEntity.create({
      buildingId: command.buildingId,
      associationId: command.associationId,
      monthlyRentAmount: command.monthlyRentAmount,
      paymentDayOfMonth: command.paymentDayOfMonth,
      leaseStartDate: command.leaseStartDate,
      leaseEndDate: command.leaseEndDate,
    });

    await this.writer.saveBuildingLease(lease);

    return lease;
  }
}
