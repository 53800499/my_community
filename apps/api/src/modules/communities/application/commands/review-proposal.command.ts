export interface ReviewProposalCommand {
  proposalId: string;
  reviewerId: string;
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}
