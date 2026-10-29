import { useState, useCallback } from "react";
import { ResidenceCertificateData } from "../domain/residence-certificate.types";
import { CertificateGeneratorPort } from "../services/certificate-generator.port";
import { defaultCertificateGenerator } from "../services/js-pdf-certificate.service";

interface UseResidenceCertificateOptions {
  generator?: CertificateGeneratorPort;
}

/**
 * Custom Hook gérant l'exportation et le cycle de vie du certificat officiel (SRP & OCP)
 * Permet d'injecter n'importe quel générateur implémentant CertificateGeneratorPort (DIP).
 */
export function useResidenceCertificate(options?: UseResidenceCertificateOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generator = options?.generator || defaultCertificateGenerator;

  const downloadPdf = useCallback(
    async (data: ResidenceCertificateData): Promise<boolean> => {
      setIsGenerating(true);
      setError(null);

      try {
        await generator.generateAndDownloadPdf(data);
        return true;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la génération du document PDF.";
        console.error("useResidenceCertificate error:", err);
        setError(msg);
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    [generator]
  );

  const print = useCallback(() => {
    window.print();
  }, []);

  return {
    isGenerating,
    error,
    downloadPdf,
    print,
  };
}
