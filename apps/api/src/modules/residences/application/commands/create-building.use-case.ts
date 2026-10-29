import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BuildingEntity } from '../../domain/entities/building.entity.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';
import {
  RESIDENCE_WRITER_PORT,
  type ResidenceWriterPort,
} from '../ports/residence-writer.port.js';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import type { CreateBuildingCommand } from './create-building.command.js';

export interface CreateBuildingResult {
  id: string;
  quarterId: string;
  name: string;
  address: string;
  landlordName: string;
  landlordPhone: string | null;
  landlordIbanOrMomo: string | null;
  floorsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CreateBuildingUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: CreateBuildingCommand): Promise<CreateBuildingResult> {
    const quarter = await this.reader.findQuarterById(command.quarterId);
    if (!quarter) {
      throw new NotFoundException(`Le quartier avec l'ID ${command.quarterId} est introuvable.`);
    }

    const existingBuildings = await this.reader.listBuildingsByQuarter(command.quarterId);
    const normalizedName = command.name.trim().toLowerCase();
    const normalizedAddress = command.address.trim().toLowerCase();
    const duplicate = existingBuildings.find(
      (b) =>
        b.name.trim().toLowerCase() === normalizedName &&
        b.address.trim().toLowerCase() === normalizedAddress,
    );
    if (duplicate) {
      throw new ConflictException(
        `Un bâtiment portant le nom "${command.name}" existe déjà à l'adresse "${command.address}".`,
      );
    }

    const building = BuildingEntity.create({
      quarterId: command.quarterId,
      name: command.name,
      address: command.address,
      landlordName: command.landlordName,
      landlordPhone: command.landlordPhone,
      landlordIbanOrMomo: command.landlordIbanOrMomo,
      floorsCount: command.floorsCount,
    });

    await this.writer.saveBuilding(building);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'residence.building.created',
        resourceType: 'building',
        resourceId: building.id,
        payload: {
          quarterId: building.quarterId,
          name: building.name,
          landlordName: building.landlordName,
        },
        createdAt: new Date(),
      }),
    );

    return {
      id: building.id,
      quarterId: building.quarterId,
      name: building.name,
      address: building.address,
      landlordName: building.landlordName,
      landlordPhone: building.landlordPhone,
      landlordIbanOrMomo: building.landlordIbanOrMomo,
      floorsCount: building.floorsCount,
      createdAt: building.createdAt,
      updatedAt: building.updatedAt,
    };
  }
}
