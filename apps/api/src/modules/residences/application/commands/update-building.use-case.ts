import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
import type { UpdateBuildingCommand } from './update-building.command.js';

export interface UpdateBuildingResult {
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
export class UpdateBuildingUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: UpdateBuildingCommand): Promise<UpdateBuildingResult> {
    const building = await this.reader.findBuildingById(command.buildingId);
    if (!building) {
      throw new NotFoundException(`Le bâtiment avec l'ID ${command.buildingId} est introuvable.`);
    }

    if (command.name || command.address) {
      const existingBuildings = await this.reader.listBuildingsByQuarter(building.quarterId);
      const targetName = (command.name ?? building.name).trim().toLowerCase();
      const targetAddress = (command.address ?? building.address).trim().toLowerCase();
      const duplicate = existingBuildings.find(
        (b) =>
          b.id !== building.id &&
          b.name.trim().toLowerCase() === targetName &&
          b.address.trim().toLowerCase() === targetAddress,
      );
      if (duplicate) {
        throw new ConflictException(
          `Un bâtiment nommé "${command.name ?? building.name}" existe déjà à l'adresse "${command.address ?? building.address}".`,
        );
      }
    }

    building.updateDetails({
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
        action: 'RESIDENCE.BUILDING.UPDATED',
        resourceType: 'building',
        resourceId: building.id,
        payload: {
          quarterId: building.quarterId,
          name: building.name,
          address: building.address,
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
