/**
 * Événement de Domaine : Nouveau Compte Citoyen Enregistré
 * Consommé de manière découplée par le module audit et les notifications.
 */
export class UserRegisteredEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly phoneNumber: string,
    public readonly email: string | null,
  ) {
    this.occurredAt = new Date();
  }
}
