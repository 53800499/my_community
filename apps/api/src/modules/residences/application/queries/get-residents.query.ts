import { Injectable, Inject } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
  type ResidentSummary,
} from '../ports/residence-reader.port.js';

export interface GetResidentsParams {
  associationId?: string;
  isActive?: boolean;
}

@Injectable()
export class GetResidentsQuery {
  public constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly residenceReader: ResidenceReaderPort,
  ) {}

  public async execute(params?: GetResidentsParams): Promise<ResidentSummary[]> {
    return this.residenceReader.listResidents(params);
  }
}
