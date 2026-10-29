import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListRootTerritoriesQuery } from '../../application/queries/list-root-territories.query.js';
import { GetTerritoryChildrenQuery } from '../../application/queries/get-territory-children.query.js';
import { GetTerritoryByCodeQuery } from '../../application/queries/get-territory-by-code.query.js';
import { TerritoryMapper, TerritoryResponseDto } from '../../infrastructure/mappers/territory.mapper.js';

@ApiTags('Territoires')
@Controller('territories')
export class TerritoriesController {
  constructor(
    private readonly listRootQuery: ListRootTerritoriesQuery,
    private readonly getChildrenQuery: GetTerritoryChildrenQuery,
    private readonly getByCodeQuery: GetTerritoryByCodeQuery,
  ) {}

  @Get('roots')
  @ApiOperation({
    summary: 'Lister les territoires racines (Pays)',
    description: 'Retourne la liste de tous les territoires de premier niveau hiérarchique (type COUNTRY).',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des pays racines récupérée avec succès.',
    type: [TerritoryResponseDto],
  })
  async getRoots(): Promise<TerritoryResponseDto[]> {
    const roots = await this.listRootQuery.execute();
    return roots.map(TerritoryMapper.toResponseDto);
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Obtenir un territoire par son code',
    description: 'Recherche un territoire par son code unique (ex: BEN, LITTORAL, COTONOU).',
  })
  @ApiParam({
    name: 'code',
    description: 'Code officiel ou acronyme du territoire recherché',
    example: 'BEN',
  })
  @ApiResponse({
    status: 200,
    description: 'Territoire trouvé.',
    type: TerritoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Territoire introuvable pour le code spécifié.',
  })
  async getByCode(@Param('code') code: string): Promise<TerritoryResponseDto> {
    const territory = await this.getByCodeQuery.execute({ code });
    return TerritoryMapper.toResponseDto(territory);
  }

  @Get(':id/children')
  @ApiOperation({
    summary: 'Lister les subdivisions enfants d’un territoire',
    description:
      'Retourne la liste des territoires enfants directement rattachés (ex: les départements pour un pays, les communes pour un département).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du territoire parent',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des subdivisions administratives enfants.',
    type: [TerritoryResponseDto],
  })
  async getChildren(@Param('id') parentId: string): Promise<TerritoryResponseDto[]> {
    const children = await this.getChildrenQuery.execute({ parentId });
    return children.map(TerritoryMapper.toResponseDto);
  }
}
