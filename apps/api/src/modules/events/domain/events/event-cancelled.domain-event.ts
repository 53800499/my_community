export class EventCancelledDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly eventId: string,
    public readonly communityId: string,
    public readonly cancelledByUserId: string,
  ) {
    this.occurredOn = new Date();
  }
}
