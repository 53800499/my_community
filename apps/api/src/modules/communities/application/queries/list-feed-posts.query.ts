import { Injectable, Inject } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity.js';
import {
  type PostReaderPort,
  POST_READER_PORT,
} from '../ports/post-reader.port.js';

export interface ListFeedPostsParams {
  limit?: number;
  offset?: number;
}

/**
 * Cas d'Usage de Consultation : Flux global d'actualités citoyennes (Feed)
 * Conforme SOLID : SRP, DIP.
 */
@Injectable()
export class ListFeedPostsQuery {
  constructor(
    @Inject(POST_READER_PORT)
    private readonly postReader: PostReaderPort,
  ) {}

  async execute(params?: ListFeedPostsParams): Promise<PostEntity[]> {
    return this.postReader.listFeed(params?.limit, params?.offset);
  }
}
