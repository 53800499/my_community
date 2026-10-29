import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';
import { UserReaderPort, USER_READER_PORT } from '../ports/user-reader.port.js';

/**
 * Cas d'Usage de Consultation : Lecture du Profil Citoyen (GetUserProfileQuery)
 */
@Injectable()
export class GetUserProfileQuery {
  constructor(
    @Inject(USER_READER_PORT)
    private readonly userReader: UserReaderPort,
  ) {}

  async execute(userId: string): Promise<UserProfileEntity> {
    const profile = await this.userReader.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profil introuvable pour l'utilisateur ${userId}`);
    }
    return profile;
  }
}
