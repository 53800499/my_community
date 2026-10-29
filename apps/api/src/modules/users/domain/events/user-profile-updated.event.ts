/**
 * Événement de Domaine : Profil Citoyen Mis à Jour
 */
export class UserProfileUpdatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly profileId: string,
  ) {
    this.occurredAt = new Date();
  }
}
