export interface CancelEventCommand {
  eventId: string;
  requesterUserId: string;
  isPrivileged?: boolean;
}
