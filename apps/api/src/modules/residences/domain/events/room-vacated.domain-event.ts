export class RoomVacatedDomainEvent {
  public static readonly EVENT_NAME = 'residence.room_vacated';

  public readonly eventName = RoomVacatedDomainEvent.EVENT_NAME;
  public readonly occurredAt: Date;

  constructor(
    public readonly occupationId: string,
    public readonly roomId: string,
    public readonly occupantUserId: string,
    public readonly associationId: string,
    public readonly endDate: Date,
    occurredAt?: Date,
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}
