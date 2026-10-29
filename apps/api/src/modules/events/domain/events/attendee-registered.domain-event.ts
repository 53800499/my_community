export class AttendeeRegisteredDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly registrationId: string,
    public readonly eventId: string,
    public readonly userId: string,
  ) {
    this.occurredOn = new Date();
  }
}
