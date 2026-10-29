export class EventCreatedDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly eventId: string,
    public readonly communityId: string,
    public readonly title: string,
    public readonly organizerUserId: string,
    public readonly startsAt: Date,
  ) {
    this.occurredOn = new Date();
  }
}
