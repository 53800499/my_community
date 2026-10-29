export interface ApiAssociationMember {
  id: string;
  associationId: string;
  userId: string;
  userName?: string;
  roles: ("PRESIDENT" | "SECRETARY" | "TREASURER" | "MANAGER" | "MEMBER")[];
  joinedAt: string;
  professionalInfo?: import('../domain/association.types').MemberProfessionalInfo;
}

export interface ApiAssociation {
  id: string;
  name: string;
  acronym?: string;
  registrationNumber?: string;
  description?: string;
  status: string;
  createdAt: string;
  membersCount?: number;
  monthlyDuesXOF?: number;
  treasuryBalanceXOF?: number;
  territory?: string;
  members?: ApiAssociationMember[];
  linkedCommunityIds?: string[];
}

export interface ApiAssociationContract {
  id: string;
  associationId: string;
  associationName: string;
  associationAcronym?: string;
  contractNumber: string;
  type: "CHARTE_INTEGRATION" | "CONVENTION_PARTENARIAT" | "DELEGATION_SERVICE";
  status: "ACTIVE" | "PENDING_SIGNATURE" | "EXPIRED" | "TERMINATED";
  signatoryPresident: string;
  signatoryPlatform: string;
  signedAt?: string | null;
  startDate: string;
  endDate: string;
  annualFeeXOF: number;
  articlesCount: number;
  description: string;
  terms: string[];
  complianceStatus: "COMPLIANT" | "NEEDS_UPDATE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface ApiAssociationIntegrationRules {
  id: string;
  associationId: string;
  associationName: string;
  status: "OPEN" | "INVITATION_ONLY" | "CLOSED";
  approvalMode: "AUTOMATIC" | "BUREAU_REVIEW" | "VOTE_GA";
  membershipFeeXOF: number;
  annualDuesXOF: number;
  minAge?: number;
  requiresSponsorship: boolean;
  sponsorsCountRequired: number;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  charterArticles: { id: string; title: string; content: string }[];
  internalRegulationsPdfName?: string;
  internalRegulationsPdfData?: string;
  internalRegulationsPdfSize?: string;
  updatedAt: string;
  updatedByUserName: string;
  updatedByUserRole: string;
}

export interface ApiAssociationExecutiveContract {
  id: string;
  associationId: string;
  associationName: string;
  associationAcronym?: string;
  contractNumber: string;
  officerUserId: string;
  officerName: string;
  officerPhone?: string;
  officerEmail?: string;
  officerRole: "PRESIDENT" | "VICE_PRESIDENT" | "SECRETARY" | "TREASURER" | "BOARD_MEMBER" | "AUDITOR";
  positionTitle: string;
  type: "MANDAT_ELECTIF" | "DELEGATION_POUVOIRS" | "CHARTE_DEONTOLOGIQUE" | "CONVENTION_BENEVOLAT_DIRIGEANT";
  status: "ACTIVE" | "PENDING_SIGNATURE" | "EXPIRED" | "TERMINATED";
  termStartDate: string;
  termEndDate: string;
  delegations: string[];
  ethicalObligations: string[];
  monthlyIndemnityXOF: number;
  isSigned: boolean;
  signedAt?: string | null;
  signatoryOfficerName?: string;
  signatorySupervisorName?: string;
  pdfFileName?: string;
  pdfFileData?: string;
  pdfFileSize?: string;
  pdfUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MandateActionCategory =
  | "FINANCE"
  | "RESIDENCES"
  | "GOVERNANCE"
  | "MEMBERSHIPS"
  | "ADMINISTRATION";

export interface ApiMandateAuditAction {
  id: string;
  associationId: string;
  associationName?: string;
  mandatePeriod: string; // ex: "Mandat 2026-2028"
  mandateContractNumber?: string; // ex: "MANDAT-2026-001"
  actorId: string;
  actorName: string;
  actorRole: string; // ex: "Président(e)", "Trésorier(ère) Général(e)", "Secrétaire Général(e)"
  category: MandateActionCategory;
  actionType: string; // ex: "EXPENSE_RECORDED", "COTISATION_COLLECTED", "ROOM_ASSIGNED"
  actionTitle: string; // Libellé clair de l'action
  resourceType: string;
  resourceId: string;
  amountXOF?: number;
  details: string; // Justification et contexte
  integrityHash: string; // Signature d'inaltérabilité
  timestamp: string;
}

export interface ApiMandatePeriodSummary {
  mandatePeriod: string;
  termStartDate: string;
  termEndDate: string;
  presidentName: string;
  treasurerName?: string;
  secretaryName?: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  actionsCount: number;
  totalIncomeXOF: number;
  totalExpenseXOF: number;
}

export interface ApiMandateOfficer {
  positionId?: string;
  positionTitle: string;
  userId: string;
  userName: string;
  roleCategory: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiAssociationMandate {
  id: string;
  associationId: string;
  title: string;
  academicYear: string;
  startDate: string;
  endDate?: string | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  presidentUserId: string;
  presidentName: string;
  secretaryUserId?: string | null;
  secretaryName?: string | null;
  treasurerUserId?: string | null;
  treasurerName?: string | null;
  officers: ApiMandateOfficer[];
  handoverDate?: string | null;
  outgoingPresidentName?: string | null;
  incomingPresidentName?: string | null;
  handoverNotes?: string | null;
  treasuryTransferredAmount?: number;
  pvDocumentRef?: string | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

