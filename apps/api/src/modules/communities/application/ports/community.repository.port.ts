import { CommunityEntity } from '../../domain/entities/community.entity.js';
import { CommunityReaderPort } from './community-reader.port.js';
import { CommunityWriterPort } from './community-writer.port.js';

export { CommunityEntity };
export * from './community-reader.port.js';
export * from './community-writer.port.js';

/**
 * Port Agrégé Hexagonal : Interface abstraite complète du Repository Communauté
 * Conforme ISP & DIP : Combine les ports ségrégués CommunityReaderPort et CommunityWriterPort.
 * Les implémentations complètes (ex: PrismaCommunityRepository) implémentent cette classe.
 */
export abstract class CommunityRepositoryPort implements CommunityReaderPort, CommunityWriterPort {
  abstract findById(id: string): Promise<CommunityEntity | null>;
  abstract findBySlug(slug: string): Promise<CommunityEntity | null>;
  abstract listAll(): Promise<CommunityEntity[]>;
  abstract save(community: CommunityEntity): Promise<void>;
  abstract updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

export const COMMUNITY_REPOSITORY_PORT = Symbol('COMMUNITY_REPOSITORY_PORT');
