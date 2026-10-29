/**
 * Contrats de données pour l'Attestation d'Hébergement & Contrat Résidentiel
 * Principe ISP : Interface Segregation Principle
 * Le modèle est restreint au strict nécessaire pour un document officiel,
 * sans dépendance aux entités de base de données ni aux DTOs de transport.
 */

export interface CertificateResidentInfo {
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  statusText: string;
}

export interface CertificateHousingInfo {
  quarterName: string;
  quarterCity: string;
  buildingName: string;
  landlordName?: string;
  roomNumber: string;
  monthlyRentXOF: number;
  startDateFormatted: string;
  endDateFormatted: string;
}

export interface CertificateAssociationInfo {
  name: string;
  prefectureOrder: string;
}

export interface ResidenceCertificateData {
  certificateRef: string;
  issueDateFormatted: string;
  resident: CertificateResidentInfo;
  housing: CertificateHousingInfo;
  association: CertificateAssociationInfo;
}
