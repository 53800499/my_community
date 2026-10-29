import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { TERRITORY_READER_PORT } from './application/ports/territory-reader.port.js';
import { TERRITORY_WRITER_PORT } from './application/ports/territory-writer.port.js';
import { PrismaTerritoryRepository } from './infrastructure/persistence/prisma-territory.repository.js';
import { ListRootTerritoriesQuery } from './application/queries/list-root-territories.query.js';
import { GetTerritoryChildrenQuery } from './application/queries/get-territory-children.query.js';
import { GetTerritoryByCodeQuery } from './application/queries/get-territory-by-code.query.js';
import { TerritoriesController } from './presentation/http/territories.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [TerritoriesController],
  providers: [
    PrismaTerritoryRepository,
    {
      provide: TERRITORY_READER_PORT,
      useExisting: PrismaTerritoryRepository,
    },
    {
      provide: TERRITORY_WRITER_PORT,
      useExisting: PrismaTerritoryRepository,
    },
    ListRootTerritoriesQuery,
    GetTerritoryChildrenQuery,
    GetTerritoryByCodeQuery,
  ],
  exports: [
    TERRITORY_READER_PORT,
    TERRITORY_WRITER_PORT,
    ListRootTerritoriesQuery,
    GetTerritoryChildrenQuery,
    GetTerritoryByCodeQuery,
  ],
})
export class TerritoriesModule {}
