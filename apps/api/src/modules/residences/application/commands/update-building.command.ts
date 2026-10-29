export interface UpdateBuildingCommand {
  buildingId: string;
  name?: string;
  address?: string;
  landlordName?: string;
  landlordPhone?: string | null;
  landlordIbanOrMomo?: string | null;
  floorsCount?: number;
  requesterUserId: string;
}
