export interface ApiOccupation {
  id: string;
  roomId: string;
  occupantUserId: string;
  occupantName?: string;
  occupantPhone?: string;
  associationId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  status: "ACTIVE" | "TERMINATED";
}

export interface ApiQuarter {
  id: string;
  associationId: string;
  name: string;
  city: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiBuilding {
  id: string;
  quarterId: string;
  name: string;
  address: string;
  landlordName: string;
  landlordPhone: string;
  landlordIbanOrMomo?: string;
  floorsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiRoom {
  id: string;
  buildingId: string;
  roomNumber: string;
  floor?: number;
  type?: string;
  capacity: number;
  monthlyRentXOF?: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  createdAt: string;
  updatedAt?: string;
  currentOccupation?: ApiOccupation | null;
}

export interface ApiResidenceStats {
  totalQuarters: number;
  totalBuildings: number;
  totalRooms: number;
  totalCapacity: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  activeOccupations: number;
  occupancyRate: number;
}

export interface ApiResidentContract {
  id: string;
  roomId: string;
  roomNumber: string;
  buildingName: string;
  quarterName: string;
  quarterCity: string;
  associationId: string;
  associationName?: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  status: string;
}

export interface ApiCurrentRoomDetails {
  roomId: string;
  roomNumber: string;
  buildingName: string;
  quarterName: string;
  quarterCity: string;
  landlordName?: string;
  landlordPhone?: string;
}

export interface ApiResident {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  city?: string | null;
  avatarKey?: string | null;
  isActiveResident: boolean;
  currentRoom?: ApiCurrentRoomDetails | null;
  contractsCount: number;
  contracts: ApiResidentContract[];
}

export interface ApiBuildingConvention {
  id: string;
  buildingId: string;
  buildingName: string;
  quarterId: string;
  quarterName: string;
  quarterCity: string;
  associationId: string;
  associationName: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail?: string;
  landlordIbanOrMomo?: string;
  conventionNumber: string;
  type: "MANDAT_GESTION" | "BAIL_COMMERCIAL" | "MISE_A_DISPOSITION_SOLIDAIRE" | "CONVENTION_EXPLOITATION";
  status: "ACTIVE" | "PENDING_VALIDATION" | "EXPIRED" | "TERMINATED";
  monthlyMasterRentXOF: number;
  guaranteeDepositXOF: number;
  startDate: string;
  endDate: string;
  renewalType: "TACITE_REDUCTION" | "EXPRESSE" | "FERME";
  roomsCovered: number;
  clauses: string[];
  complianceCheck: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResidenceAdmissionRules {
  id: string;
  associationId: string;
  associationName: string;
  status: "OPEN" | "WAITLIST" | "CLOSED";
  approvalMode: "COMMISSION_REVIEW" | "SOCIAL_CRITERIA" | "FIRST_COME_FIRST_SERVED";
  depositMonths: number;
  applicationFeeXOF: number;
  minStayMonths: number;
  requiresGuarantor: boolean;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  houseRulesArticles: { id: string; title: string; content: string }[];
  internalRegulationsPdfName?: string;
  internalRegulationsPdfData?: string;
  internalRegulationsPdfSize?: string;
  updatedAt: string;
  updatedByUserName: string;
  updatedByUserRole: string;
}

export interface ApiResidentDelegateContract {
  id: string;
  associationId: string;
  associationName: string;
  buildingId?: string;
  buildingName?: string;
  contractNumber: string;
  delegateUserId: string;
  delegateName: string;
  delegatePhone?: string;
  delegateEmail?: string;
  roomNumber?: string;
  delegateRole: "CHEF_PAVILLON" | "DELEGUE_RESIDENTS" | "RESPONSABLE_HYGIENE" | "RESPONSABLE_SECURITE" | "MEDIATEUR";
  positionTitle: string;
  type: "MANDAT_DELEGUE_PAVILLON" | "DELEGATION_GESTION_LOCATIVE" | "CHARTE_COMITE_RESIDENTS" | "CONVENTION_MEDIATION";
  status: "ACTIVE" | "PENDING_SIGNATURE" | "EXPIRED" | "TERMINATED";
  termStartDate: string;
  termEndDate: string;
  delegations: string[];
  ethicalObligations: string[];
  monthlyRentReductionXOF: number;
  isSigned: boolean;
  signedAt?: string | null;
  signatoryDelegateName?: string;
  signatorySupervisorName?: string;
  pdfFileName?: string;
  pdfFileData?: string;
  pdfFileSize?: string;
  pdfUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}
