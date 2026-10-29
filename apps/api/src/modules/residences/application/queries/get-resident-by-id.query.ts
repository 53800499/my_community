import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
  type ResidentSummary,
} from '../ports/residence-reader.port.js';

@Injectable()
export class GetResidentByIdQuery {
  public constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly residenceReader: ResidenceReaderPort,
  ) {}

  public async execute(userId: string): Promise<ResidentSummary> {
    const resident = await this.residenceReader.findResidentById(userId);
    if (!resident) {
      throw new NotFoundException(`Aucun résident trouvé avec l'identifiant ${userId}`);
    }
    return resident;
  }
}
