export interface UpdateAssociationMandateCommand {
  associationId: string;
  mandateId: string;
  requesterUserId: string;
  title?: string;
  academicYear?: string;
  startDate?: Date;
  endDate?: Date | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  presidentUserId?: string;
  presidentName?: string;
  secretaryUserId?: string | null;
  secretaryName?: string | null;
  treasurerUserId?: string | null;
  treasurerName?: string | null;
  handoverNotes?: string | null;
  treasuryTransferredAmount?: number;
  pvDocumentRef?: string | null;
}
