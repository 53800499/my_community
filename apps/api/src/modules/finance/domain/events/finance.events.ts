export class TransactionPostedEvent {
  public static readonly EVENT_NAME = 'finance.transaction.posted';

  constructor(
    public readonly transactionId: string,
    public readonly associationId: string | null,
    public readonly amount: number,
    public readonly type: string,
    public readonly reference: string | null,
    public readonly recordedById: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class CotisationRecordedEvent {
  public static readonly EVENT_NAME = 'finance.cotisation.recorded';

  constructor(
    public readonly cotisationId: string,
    public readonly associationId: string,
    public readonly memberId: string,
    public readonly amount: number,
    public readonly period: string,
    public readonly reference: string | null,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class IntegrationFeePaidEvent {
  public static readonly EVENT_NAME = 'finance.integration_fee.paid';

  constructor(
    public readonly paymentId: string,
    public readonly dueId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly remainingAmount: number,
    public readonly receiptReference: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class BuildingRentPaidEvent {
  public static readonly EVENT_NAME = 'finance.building_rent.paid';

  constructor(
    public readonly expenseId: string,
    public readonly leaseId: string,
    public readonly monthYear: string,
    public readonly amount: number,
    public readonly transactionId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class DonationReceivedEvent {
  public static readonly EVENT_NAME = 'finance.donation.received';

  constructor(
    public readonly donationId: string,
    public readonly associationId: string,
    public readonly donorName: string,
    public readonly amount: number,
    public readonly reference: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ExpenseRecordedEvent {
  public static readonly EVENT_NAME = 'finance.expense.recorded';

  constructor(
    public readonly expenseId: string,
    public readonly associationId: string,
    public readonly category: string,
    public readonly amount: number,
    public readonly transactionId: string | null,
    public readonly timestamp: Date = new Date(),
  ) {}
}
