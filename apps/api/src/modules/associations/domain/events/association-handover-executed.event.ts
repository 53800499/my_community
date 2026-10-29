/**
 * Événement Métier Découplé : Passation de Service Réalisée (AssociationHandoverExecutedEvent)
 * Déclenché lors de la clôture officielle d'une mandature et de la transmission des pouvoirs
 * au nouveau bureau élu. Permet la notification des adhérents, la mise à jour des droits
 * et l'audit sans couplage fort (SOLID OCP & Observer Pattern).
 */
export class AssociationHandoverExecutedEvent {
  public static readonly EVENT_NAME = 'association.handover.executed';

  constructor(
    public readonly payload: {
      associationId: string;
      previousMandateId: string | null;
      newMandateId: string;
      outgoingPresidentId: string | null;
      outgoingPresidentName: string | null;
      incomingPresidentId: string;
      incomingPresidentName: string;
      handoverDate: Date;
      treasuryTransferredAmount: number;
      academicYear: string;
    },
  ) {}
}
