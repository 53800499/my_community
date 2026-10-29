import { ResidenceCertificateData } from "../domain/residence-certificate.types";

/**
 * Port abstrait du générateur de certificat (Principe DIP & LSP)
 * Tout adaptateur concret (jsPDF, PDFKit, API Serveur, Mocks de test)
 * doit implémenter cette interface sans dépendre de React.
 */
export interface CertificateGeneratorPort {
  /**
   * Génère et déclenche le téléchargement du document PDF officiel
   */
  generateAndDownloadPdf(data: ResidenceCertificateData): Promise<void>;
}
