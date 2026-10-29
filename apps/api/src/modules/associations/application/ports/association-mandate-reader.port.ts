import { AssociationMandateEntity } from '../../domain/entities/association-mandate.entity.js';

export const ASSOCIATION_MANDATE_READER_PORT = Symbol('ASSOCIATION_MANDATE_READER_PORT');

/**
 * Port Secondaire en Lecture : Consultation des Mandats et Périodes de Service (ISP / DIP)
 */
export interface AssociationMandateReaderPort {
  listMandates(associationId: string): Promise<AssociationMandateEntity[]>;
  findMandateById(
    associationId: string,
    mandateId: string,
  ): Promise<AssociationMandateEntity | null>;
  findActiveMandate(associationId: string): Promise<AssociationMandateEntity | null>;
}
