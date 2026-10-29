import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePostUseCase } from '../../../application/commands/create-post.use-case.js';
import { ListCommunityPostsQuery } from '../../../application/queries/list-community-posts.query.js';
import { ListFeedPostsQuery } from '../../../application/queries/list-feed-posts.query.js';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { PostResponseDto } from '../dto/post-response.dto.js';
import { PostMapper } from '../../../infrastructure/mappers/post.mapper.js';

/**
 * Contrôleur REST : Publications & Fil Citoyen (PostsController)
 * Conforme SOLID : Contrôleur mince, délégation directe aux cas d'usage applicatifs (SRP).
 */
@ApiTags('Publications & Fil Citoyen')
@Controller('communities')
export class PostsController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly listCommunityPostsQuery: ListCommunityPostsQuery,
    private readonly listFeedPostsQuery: ListFeedPostsQuery,
  ) {}

  @Get('feed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter le fil citoyen global (Feed)',
    description: 'Renvoie les dernières publications citoyennes publiques et communautaires par ordre antéchronologique.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Flux d’actualités citoyen récupéré avec succès.',
    type: [PostResponseDto],
  })
  async getFeed(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PostResponseDto[]> {
    const posts = await this.listFeedPostsQuery.execute({ limit, offset });
    return posts.map((p) => PostMapper.toResponseDto(p));
  }

  @Post(':communityId/posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une publication dans une communauté',
    description: 'Publie un nouveau message ou appel à l’action citoyenne dans l’espace spécifié.',
  })
  @ApiParam({
    name: 'communityId',
    description: 'Identifiant unique (UUID v4) de la communauté cible',
    format: 'uuid',
    example: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc',
  })
  @ApiResponse({
    status: 201,
    description: 'Publication créée avec succès.',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté introuvable.',
  })
  async create(
    @Param('communityId') communityId: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.createPostUseCase.execute({
      communityId,
      authorId: dto.authorId,
      title: dto.title,
      content: dto.content,
      visibility: dto.visibility,
    });
    return PostMapper.toResponseDto(post);
  }

  @Get(':communityId/posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les publications d’une communauté',
    description: 'Renvoie toutes les publications rattachées à la communauté sélectionnée.',
  })
  @ApiParam({
    name: 'communityId',
    description: 'Identifiant unique (UUID v4) de la communauté',
    format: 'uuid',
    example: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Publications de la communauté récupérées avec succès.',
    type: [PostResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté introuvable.',
  })
  async listByCommunity(
    @Param('communityId') communityId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PostResponseDto[]> {
    const posts = await this.listCommunityPostsQuery.execute({
      communityId,
      limit,
      offset,
    });
    return posts.map((p) => PostMapper.toResponseDto(p));
  }
}
