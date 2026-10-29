import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  CommunityMembershipEntity,
  MembershipStatus,
} from '../../domain/entities/community-membership.entity.js';
import {
  MembershipReaderPort,
  MEMBERSHIP_READER_PORT,
} from '../ports/membership-reader.port.js';

export interface ListCommunityMembersParams {
  communityId: string;
  status?: MembershipStatus;
}

@Injectable()
export class ListCommunityMembersQuery {
  constructor(
    @Inject(MEMBERSHIP_READER_PORT)
    private readonly reader: MembershipReaderPort,
  ) {}

  async execute(params: ListCommunityMembersParams): Promise<CommunityMembershipEntity[]> {
    if (!params.communityId || params.communityId.trim().length === 0) {
      throw new BadRequestException("L'identifiant de la communauté est obligatoire.");
    }
    return this.reader.listByCommunity(params.communityId, params.status);
  }
}
