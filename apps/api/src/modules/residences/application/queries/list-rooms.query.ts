import { Inject, Injectable } from '@nestjs/common';
import type { RoomEntity } from '../../domain/entities/room.entity.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';

@Injectable()
export class ListRoomsQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(buildingId?: string): Promise<RoomEntity[]> {
    return this.reader.listRoomsByBuilding(buildingId);
  }
}
