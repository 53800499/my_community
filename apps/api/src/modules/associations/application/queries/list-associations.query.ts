import { Injectable, Inject } from '@nestjs/common';
import { AssociationEntity } from '../../domain/entities/association.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';

@Injectable()
export class ListAssociationsQuery {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
  ) {}

  async execute(): Promise<AssociationEntity[]> {
    return this.reader.listAll();
  }
}
