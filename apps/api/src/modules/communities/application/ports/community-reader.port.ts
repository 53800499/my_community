import { CommunityEntity } from '../../domain/entities/community.entity.js';

/**
 * Port Sortant Hexagonal : Lecture de Communautés
 * Conforme ISP (Interface Segregation Principle) :
 * Isole les méthodes de consultation afin que les Use Cases de lecture (Queries)
 * ne soient pas couplés aux méthodes d'écriture/mutation.
 */
export abstract class CommunityReaderPort {
  abstract findById(id: string): Promise<CommunityEntity | null>;
  abstract findBySlug(slug: string): Promise<CommunityEntity | null>;
  abstract listAll(): Promise<CommunityEntity[]>;
}

export const COMMUNITY_READER_PORT = Symbol('COMMUNITY_READER_PORT');
