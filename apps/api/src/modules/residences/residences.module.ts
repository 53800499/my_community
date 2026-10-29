import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Ports
import { RESIDENCE_READER_PORT } from './application/ports/residence-reader.port.js';
import { RESIDENCE_WRITER_PORT } from './application/ports/residence-writer.port.js';

// Repositories
import { PrismaResidenceRepository } from './infrastructure/repositories/prisma-residence.repository.js';

// Cas d'usage
import { CreateQuarterUseCase } from './application/commands/create-quarter.use-case.js';
import { UpdateQuarterUseCase } from './application/commands/update-quarter.use-case.js';
import { DeleteQuarterUseCase } from './application/commands/delete-quarter.use-case.js';

import { CreateBuildingUseCase } from './application/commands/create-building.use-case.js';
import { UpdateBuildingUseCase } from './application/commands/update-building.use-case.js';
import { DeleteBuildingUseCase } from './application/commands/delete-building.use-case.js';

import { CreateRoomUseCase } from './application/commands/create-room.use-case.js';
import { UpdateRoomUseCase } from './application/commands/update-room.use-case.js';
import { UpdateRoomStatusUseCase } from './application/commands/update-room-status.use-case.js';
import { DeleteRoomUseCase } from './application/commands/delete-room.use-case.js';

import { AssignRoomOccupationUseCase } from './application/commands/assign-room-occupation.use-case.js';
import { TerminateRoomOccupationUseCase } from './application/commands/terminate-room-occupation.use-case.js';

// Requêtes
import { ListQuartersQuery } from './application/queries/list-quarters.query.js';
import { GetQuarterByIdQuery } from './application/queries/get-quarter-by-id.query.js';
import { ListBuildingsQuery } from './application/queries/list-buildings.query.js';
import { GetBuildingByIdQuery } from './application/queries/get-building-by-id.query.js';
import { ListRoomsQuery } from './application/queries/list-rooms.query.js';
import { GetRoomByIdQuery } from './application/queries/get-room-by-id.query.js';
import { ListOccupationsQuery } from './application/queries/list-occupations.query.js';
import { GetResidenceStatsQuery } from './application/queries/get-residence-stats.query.js';
import { GetResidentsQuery } from './application/queries/get-residents.query.js';
import { GetResidentByIdQuery } from './application/queries/get-resident-by-id.query.js';

// Contrôleurs
import { ResidencesController } from './presentation/http/residences.controller.js';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [ResidencesController],
  providers: [
    {
      provide: RESIDENCE_READER_PORT,
      useClass: PrismaResidenceRepository,
    },
    {
      provide: RESIDENCE_WRITER_PORT,
      useClass: PrismaResidenceRepository,
    },
    CreateQuarterUseCase,
    UpdateQuarterUseCase,
    DeleteQuarterUseCase,
    CreateBuildingUseCase,
    UpdateBuildingUseCase,
    DeleteBuildingUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    UpdateRoomStatusUseCase,
    DeleteRoomUseCase,
    AssignRoomOccupationUseCase,
    TerminateRoomOccupationUseCase,
    ListQuartersQuery,
    GetQuarterByIdQuery,
    ListBuildingsQuery,
    GetBuildingByIdQuery,
    ListRoomsQuery,
    GetRoomByIdQuery,
    ListOccupationsQuery,
    GetResidenceStatsQuery,
    GetResidentsQuery,
    GetResidentByIdQuery,
  ],
  exports: [
    RESIDENCE_READER_PORT,
    RESIDENCE_WRITER_PORT,
    CreateQuarterUseCase,
    UpdateQuarterUseCase,
    DeleteQuarterUseCase,
    CreateBuildingUseCase,
    UpdateBuildingUseCase,
    DeleteBuildingUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    UpdateRoomStatusUseCase,
    DeleteRoomUseCase,
    AssignRoomOccupationUseCase,
    TerminateRoomOccupationUseCase,
    ListQuartersQuery,
    GetQuarterByIdQuery,
    ListBuildingsQuery,
    GetBuildingByIdQuery,
    ListRoomsQuery,
    GetRoomByIdQuery,
    ListOccupationsQuery,
    GetResidenceStatsQuery,
    GetResidentsQuery,
    GetResidentByIdQuery,
  ],
})
export class ResidencesModule {}
