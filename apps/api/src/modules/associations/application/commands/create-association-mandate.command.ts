export interface MandateOfficerInput {
  positionId?: string;
  positionTitle: string;
  userId: string;
  userName: string;
  roleCategory: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateAssociationMandateCommand {
  associationId: string;
  requesterUserId: string;
  title: string;
  academicYear: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  presidentUserId: string;
  presidentName: string;
  secretaryUserId?: string;
  secretaryName?: string;
  treasurerUserId?: string;
  treasurerName?: string;
  officers?: MandateOfficerInput[];
  setAsActive?: boolean;
}
