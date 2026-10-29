export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED';

export interface ApiFinancialTransaction {
  id: string;
  associationId?: string | null;
  associationName?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  description?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  recordedById?: string;
  createdAt: string;
}

export interface ApiCotisation {
  id: string;
  associationId: string;
  associationName?: string;
  memberId: string;
  citizenName?: string;
  phone?: string;
  amountXOF: number;
  currency: string;
  period: string;
  status: 'ENCAISSE' | 'EN_ATTENTE' | 'PAID' | 'PENDING' | 'OVERDUE';
  paymentMethod: string;
  channel?: 'MTN_MOMO' | 'MOOV_MONEY' | 'ESPECES';
  reference: string;
  transactionId?: string | null;
  notes?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface ApiBuildingLease {
  id: string;
  buildingId: string;
  buildingName?: string;
  associationId: string;
  associationName?: string;
  monthlyRentAmount: number;
  currency: string;
  paymentDayOfMonth: number;
  leaseStartDate: string;
  leaseEndDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBuildingRentExpense {
  id: string;
  leaseId: string;
  buildingName?: string;
  monthYear: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  transactionId?: string | null;
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface ApiIntegrationFeePlan {
  id: string;
  associationId: string;
  academicYear: string;
  name: string;
  amount: number;
  currency: string;
  installmentsAllowed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiIntegrationFeeDue {
  id: string;
  occupationId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  roomNumber?: string;
  buildingName?: string;
  quarterName?: string;
  planId: string;
  planName?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDonation {
  id: string;
  associationId: string;
  donorName: string;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  campaignName?: string | null;
  reference: string;
  transactionId?: string | null;
  notes?: string | null;
  receivedAt: string;
  createdAt: string;
}

export type ExpenseStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface ApiExpense {
  id: string;
  associationId: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  beneficiary: string;
  paymentMethod: string;
  status: ExpenseStatus;
  receiptRef?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  expenseDate: string;
  recordedById: string;
  createdAt: string;
}

export interface ApiFinanceStats {
  totalIncomeXOF: number;
  totalExpenseXOF: number;
  netBalanceXOF: number;
  totalCotisationsXOF: number;
  totalDonationsXOF: number;
  totalIntegrationFeesXOF: number;
  totalLandlordRentsXOF: number;
  pendingIntegrationDuesXOF: number;
  pendingBuildingRentXOF: number;
  transactionsCount: number;
  expensesByCategory: Record<string, number>;
  monthlyBreakdown: Array<{ month: string; income: number; expense: number }>;
}

export interface RecordDonationPayload {
  associationId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  campaignName?: string;
  notes?: string;
}

export interface RecordExpensePayload {
  associationId: string;
  title: string;
  category: string;
  amount: number;
  currency?: string;
  beneficiary: string;
  paymentMethod?: string;
  status?: string;
  receiptRef?: string;
  notes?: string;
}

export interface PayIntegrationFeePayload {
  amount: number;
  paymentMethod: string;
}

