export interface CreateEventCommand {
  communityId: string;
  organizerUserId: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  maxAttendees?: number | null;
}
