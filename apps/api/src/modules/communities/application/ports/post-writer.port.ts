import { PostEntity } from '../../domain/entities/post.entity.js';

export const POST_WRITER_PORT = Symbol('POST_WRITER_PORT');

/**
 * Port Abstrait d'Écriture : Mutations des Publications (ISP, DIP)
 */
export interface PostWriterPort {
  save(post: PostEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
