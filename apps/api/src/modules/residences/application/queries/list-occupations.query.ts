import { Inject, Injectable } from '@nestjs/common';
import type { RoomOccupationEntity } from '../../domain/entities/room-occupation.entity.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
  type ListOccupationsFilter,
} from '../ports/residence-reader.port.js';

@Injectable()
export class ListOccupationsQuery {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
  ) {}

  public async execute(filter?: ListOccupationsFilter): Promise<RoomOccupationEntity[]> {
    return this.reader.listOccupations(filter);
  }
}
