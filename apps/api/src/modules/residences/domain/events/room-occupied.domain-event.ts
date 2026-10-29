export class RoomOccupiedDomainEvent {
  public static readonly EVENT_NAME = 'residence.room_occupied';

  public readonly eventName = RoomOccupiedDomainEvent.EVENT_NAME;
  public readonly occurredAt: Date;

  constructor(
    public readonly occupationId: string,
    public readonly roomId: string,
    public readonly occupantUserId: string,
    public readonly associationId: string,
    public readonly startDate: Date,
    occurredAt?: Date,
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}
