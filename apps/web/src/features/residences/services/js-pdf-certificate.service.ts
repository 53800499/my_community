import { CertificateGeneratorPort } from "./certificate-generator.port";
import { ResidenceCertificateData } from "../domain/residence-certificate.types";

/**
 * Adaptateur concret du générateur PDF utilisant jsPDF (DIP & SRP)
 * Isole les détails techniques d'implémentation vectorielle.
 */
export class JsPdfCertificateService implements CertificateGeneratorPort {
  public async generateAndDownloadPdf(data: ResidenceCertificateData): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. En-tête officiel de la République du Bénin
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70); // vert républicain foncé #065f46
    doc.text("RÉPUBLIQUE DU BÉNIN", 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Fraternité — Justice — Travail", 20, 21);

    // Référence du certificat à droite
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(data.certificateRef, 190, 21, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association & Références d'enregistrement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(data.association.name, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Gestion des Logements & Résidences Universitaires Partenaires", 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`${data.association.prefectureOrder} • Plateforme Citoyenne My Community`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(20, 48, 170, 13, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text("ATTESTATION D'HÉBERGEMENT & CONVENTION DE SÉJOUR", 105, 56.5, { align: "center" });

    // 4. Paragraphe introductif
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(
      "Le Bureau Exécutif de l'association certifie par la présente que le citoyen désigné ci-après :",
      20,
      69
    );

    // 5. Cadre Identité du Résident
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 73, 170, 34, 2.5, 2.5, "FD");

    // Nom et prénom
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("NOM & PRÉNOM(S) :", 25, 80);
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    doc.text(data.resident.fullName.toUpperCase(), 25, 86);

    // Téléphone
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("NUMÉRO DE TÉLÉPHONE :", 110, 80);
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text(data.resident.phoneNumber, 110, 86);

    // Email
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("ADRESSE EMAIL :", 25, 94);
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(data.resident.email || "Non renseigné", 25, 100);

    // Statut
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("STATUT DU RÉSIDENT :", 110, 94);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text(data.resident.statusText, 110, 100);

    // 6. Paragraphe Logement
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text("Est régulièrement hébergé(e) dans les locaux conventionnés selon les modalités suivantes :", 20, 114);

    // 7. Cadre Logement & Modalités
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(20, 118, 170, 48, 2.5, 2.5, "FD");

    // Campus / Quartier
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("CAMPUS / QUARTIER :", 25, 126);
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text(data.housing.quarterName, 25, 132);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text(data.housing.quarterCity, 25, 136);

    // Pavillon
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("PAVILLON / BÂTIMENT :", 82, 126);
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text(data.housing.buildingName, 82, 132);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Bailleur: " + (data.housing.landlordName || "Conventionné"), 82, 136);

    // Chambre physique
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("CHAMBRE PHYSIQUE :", 140, 126);
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text(`Chambre ${data.housing.roomNumber}`, 140, 133);

    // Dates & Loyer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("PRISE D'EFFET :", 25, 146);
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(data.housing.startDateFormatted, 25, 152);

    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("ÉCHÉANCE DU SÉJOUR :", 82, 146);
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(data.housing.endDateFormatted, 82, 152);

    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("REDEVANCE MENSUELLE :", 140, 146);
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(`${data.housing.monthlyRentXOF.toLocaleString()} FCFA / mois`, 140, 152);

    // 8. Clauses d'engagement
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 172, 170, 26, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text("ENGAGEMENTS ET CLAUSES D'OCCUPATION :", 25, 178);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text("• L'occupant s'engage au respect strict du règlement intérieur, de la salubrité et du bon voisinage.", 25, 184);
    doc.text("• Toute sous-location ou cession de chambre à des tiers est formellement interdite et passible d'expulsion.", 25, 188.5);
    doc.text("• Ce document est délivré pour servir et valoir ce que de droit (Inscription universitaire, dossier bancaire).", 25, 193);

    // 9. Signatures et Validation Officielle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`Fait à ${data.housing.quarterCity}, le ${data.issueDateFormatted}`, 25, 215);

    // Cadre Sceau officiel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("Pour le Bureau Exécutif", 155, 212, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Le Secrétaire Général aux Logements", 155, 217, { align: "center" });

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(6, 95, 70);
    doc.roundedRect(125, 222, 60, 20, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text("[ SCEAU OFFICIEL CERTIFIÉ ]", 155, 230, { align: "center" });

    doc.setFontSize(6.5);
    doc.setTextColor(4, 120, 87);
    doc.text(`${data.association.name} — Service Résidences`, 155, 235, { align: "center" });

    // 10. Pied de page sécurisé
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document authentifié numériquement • Réf : ${data.certificateRef} • Plateforme Nationale My Community Bénin`,
      105,
      275,
      { align: "center" }
    );

    const cleanName = data.resident.fullName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Attestation_Hebergement_${cleanName}.pdf`;

    doc.save(filename);
  }
}

// Instance singleton par défaut pour injection pratique
export const defaultCertificateGenerator: CertificateGeneratorPort =
  new JsPdfCertificateService();
