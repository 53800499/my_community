import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';

export const ASSOCIATION_MANDATE_WRITER_PORT = Symbol('ASSOCIATION_MANDATE_WRITER_PORT');

/**
 * Port Secondaire en Écriture : Persistance et Clôture des Mandats Associatifs (ISP / DIP)
 */
export interface AssociationMandateWriterPort {
  saveMandate(mandate: AssociationMandateEntity): Promise<void>;
  updateMandate(mandate: AssociationMandateEntity): Promise<void>;
  deleteMandate(associationId: string, mandateId: string): Promise<void>;
}
