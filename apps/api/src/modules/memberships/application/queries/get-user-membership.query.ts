import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CommunityMembershipEntity } from '../../domain/entities/community-membership.entity.js';
import {
  MembershipReaderPort,
  MEMBERSHIP_READER_PORT,
} from '../ports/membership-reader.port.js';

export interface GetUserMembershipParams {
  communityId: string;
  userId: string;
}

@Injectable()
export class GetUserMembershipQuery {
  constructor(
    @Inject(MEMBERSHIP_READER_PORT)
    private readonly reader: MembershipReaderPort,
  ) {}

  async execute(params: GetUserMembershipParams): Promise<CommunityMembershipEntity | null> {
    if (!params.communityId || !params.userId) {
      throw new BadRequestException('communityId et userId sont obligatoires.');
    }
    return this.reader.findByCommunityAndUser(params.communityId, params.userId);
  }
}
