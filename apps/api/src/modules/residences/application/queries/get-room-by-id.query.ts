import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';
import type { RoomEntity } from '../../domain/entities/room.entity.js';

@Injectable()
export class GetRoomByIdQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(id: string): Promise<RoomEntity> {
    const room = await this.reader.findRoomById(id);
    if (!room) {
      throw new NotFoundException(`La chambre avec l'ID ${id} est introuvable.`);
    }
    return room;
  }
}
