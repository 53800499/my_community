import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { AssociationEntity } from '../../domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from '../ports/association-reader.port.js';

export interface GetAssociationResult {
  association: AssociationEntity;
  members: AssociationMemberEntity[];
  linkedCommunityIds: string[];
}

@Injectable()
export class GetAssociationQuery {
  constructor(
    @Inject(ASSOCIATION_READER_PORT)
    private readonly reader: AssociationReaderPort,
  ) {}

  async execute(id: string): Promise<GetAssociationResult> {
    if (!id || id.trim().length === 0) {
      throw new BadRequestException("L'identifiant de l'association est obligatoire.");
    }

    const association = await this.reader.findById(id);
    if (!association) {
      throw new NotFoundException(`Association ${id} introuvable.`);
    }

    const members = await this.reader.listMembers(id);
    const links = await this.reader.listCommunityLinks(id);

    return {
      association,
      members,
      linkedCommunityIds: links.map((l) => l.communityId),
    };
  }
}
