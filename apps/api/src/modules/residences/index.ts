// Module
export { ResidencesModule } from './residences.module.js';

// Domaine
export { QuarterEntity } from './domain/entities/quarter.entity.js';
export type { QuarterProps } from './domain/entities/quarter.entity.js';

export { BuildingEntity } from './domain/entities/building.entity.js';
export type { BuildingProps } from './domain/entities/building.entity.js';

export { RoomEntity } from './domain/entities/room.entity.js';
export type { RoomProps, RoomStatusValue } from './domain/entities/room.entity.js';

export { RoomOccupationEntity } from './domain/entities/room-occupation.entity.js';
export type {
  RoomOccupationProps,
  OccupationStatusValue,
} from './domain/entities/room-occupation.entity.js';

export { RoomOccupiedDomainEvent } from './domain/events/room-occupied.domain-event.js';
export { RoomVacatedDomainEvent } from './domain/events/room-vacated.domain-event.js';

// Ports
export {
  RESIDENCE_READER_PORT,
} from './application/ports/residence-reader.port.js';
export type {
  ResidenceReaderPort,
  ListOccupationsFilter,
  ResidenceStats,
} from './application/ports/residence-reader.port.js';

export {
  RESIDENCE_WRITER_PORT,
} from './application/ports/residence-writer.port.js';
export type {
  ResidenceWriterPort,
} from './application/ports/residence-writer.port.js';

// Cas d'usage
export { CreateQuarterUseCase } from './application/commands/create-quarter.use-case.js';
export type { CreateQuarterResult } from './application/commands/create-quarter.use-case.js';
export type { CreateQuarterCommand } from './application/commands/create-quarter.command.js';

export { UpdateQuarterUseCase } from './application/commands/update-quarter.use-case.js';
export type { UpdateQuarterResult } from './application/commands/update-quarter.use-case.js';
export type { UpdateQuarterCommand } from './application/commands/update-quarter.command.js';

export { DeleteQuarterUseCase } from './application/commands/delete-quarter.use-case.js';
export type { DeleteQuarterCommand } from './application/commands/delete-quarter.command.js';

export { CreateBuildingUseCase } from './application/commands/create-building.use-case.js';
export type { CreateBuildingResult } from './application/commands/create-building.use-case.js';
export type { CreateBuildingCommand } from './application/commands/create-building.command.js';

export { UpdateBuildingUseCase } from './application/commands/update-building.use-case.js';
export type { UpdateBuildingResult } from './application/commands/update-building.use-case.js';
export type { UpdateBuildingCommand } from './application/commands/update-building.command.js';

export { DeleteBuildingUseCase } from './application/commands/delete-building.use-case.js';
export type { DeleteBuildingCommand } from './application/commands/delete-building.command.js';

export { CreateRoomUseCase } from './application/commands/create-room.use-case.js';
export type { CreateRoomResult } from './application/commands/create-room.use-case.js';
export type { CreateRoomCommand } from './application/commands/create-room.command.js';

export { UpdateRoomUseCase } from './application/commands/update-room.use-case.js';
export type { UpdateRoomResult } from './application/commands/update-room.use-case.js';
export type { UpdateRoomCommand } from './application/commands/update-room.command.js';

export { UpdateRoomStatusUseCase } from './application/commands/update-room-status.use-case.js';
export type { UpdateRoomStatusResult } from './application/commands/update-room-status.use-case.js';
export type { UpdateRoomStatusCommand } from './application/commands/update-room-status.command.js';

export { DeleteRoomUseCase } from './application/commands/delete-room.use-case.js';
export type { DeleteRoomCommand } from './application/commands/delete-room.command.js';

export { AssignRoomOccupationUseCase } from './application/commands/assign-room-occupation.use-case.js';
export type { AssignRoomOccupationResult } from './application/commands/assign-room-occupation.use-case.js';
export type { AssignRoomOccupationCommand } from './application/commands/assign-room-occupation.command.js';

export { TerminateRoomOccupationUseCase } from './application/commands/terminate-room-occupation.use-case.js';
export type { TerminateRoomOccupationResult } from './application/commands/terminate-room-occupation.use-case.js';
export type { TerminateRoomOccupationCommand } from './application/commands/terminate-room-occupation.command.js';

// Requêtes
export { ListQuartersQuery } from './application/queries/list-quarters.query.js';
export { GetQuarterByIdQuery } from './application/queries/get-quarter-by-id.query.js';
export { ListBuildingsQuery } from './application/queries/list-buildings.query.js';
export { GetBuildingByIdQuery } from './application/queries/get-building-by-id.query.js';
export { ListRoomsQuery } from './application/queries/list-rooms.query.js';
export { GetRoomByIdQuery } from './application/queries/get-room-by-id.query.js';
export { ListOccupationsQuery } from './application/queries/list-occupations.query.js';
export { GetResidenceStatsQuery } from './application/queries/get-residence-stats.query.js';
export { GetResidentsQuery } from './application/queries/get-residents.query.js';
export { GetResidentByIdQuery } from './application/queries/get-resident-by-id.query.js';

// Contrôleur et DTOs
export { ResidencesController } from './presentation/http/residences.controller.js';
export { CreateQuarterDto } from './presentation/http/dto/create-quarter.dto.js';
export { UpdateQuarterDto } from './presentation/http/dto/update-quarter.dto.js';
export { CreateBuildingDto } from './presentation/http/dto/create-building.dto.js';
export { UpdateBuildingDto } from './presentation/http/dto/update-building.dto.js';
export { CreateRoomDto } from './presentation/http/dto/create-room.dto.js';
export { UpdateRoomDto } from './presentation/http/dto/update-room.dto.js';
export { UpdateRoomStatusDto } from './presentation/http/dto/update-room-status.dto.js';
export { AssignRoomOccupationDto } from './presentation/http/dto/assign-room-occupation.dto.js';
export { TerminateRoomOccupationDto } from './presentation/http/dto/terminate-room-occupation.dto.js';
export {
  QuarterResponseDto,
  BuildingResponseDto,
  RoomResponseDto,
  RoomOccupationResponseDto,
} from './presentation/http/dto/residence-responses.dto.js';
export { ResidenceStatsResponseDto } from './presentation/http/dto/residence-stats-response.dto.js';
export {
  ResidentResponseDto,
  ResidentContractResponseDto,
} from './presentation/http/dto/resident-response.dto.js';

