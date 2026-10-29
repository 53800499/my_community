export interface CreateBuildingCommand {
  quarterId: string;
  name: string;
  address: string;
  landlordName: string;
  landlordPhone?: string;
  landlordIbanOrMomo?: string;
  floorsCount?: number;
  requesterUserId: string;
}
