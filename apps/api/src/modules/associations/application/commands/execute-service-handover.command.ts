export interface OfficerAssignment {
  userId: string;
  userName: string;
}

export interface OtherOfficerAssignment extends OfficerAssignment {
  positionId: string;
}

export interface ExecuteServiceHandoverCommand {
  associationId: string;
  requesterUserId: string;
  mandateTitle: string;
  academicYear: string;
  handoverDate?: Date;
  handoverNotes?: string;
  treasuryTransferredAmount?: number;
  pvDocumentRef?: string;
  newPresident: OfficerAssignment;
  newSecretary?: OfficerAssignment;
  newTreasurer?: OfficerAssignment;
  otherOfficers?: OtherOfficerAssignment[];
}
