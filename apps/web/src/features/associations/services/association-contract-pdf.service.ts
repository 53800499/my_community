import { ApiAssociationContract } from "@/lib/api";

export class AssociationContractPdfService {
  public static async generateAndDownload(contract: ApiAssociationContract): Promise<void> {
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

    // Référence à droite
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(contract.contractNumber, 190, 21, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(contract.associationName, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Plateforme Numérique Citoyenne & Participative My Community", 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Convention Cadre d'Intégration Institutionnelle • Statut: ${contract.status === "ACTIVE" ? "CONVENTION ACTIVE & CERTIFIÉE" : "EN COURS DE SIGNATURE"}`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(20, 48, 170, 14, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52); // #166534
    doc.text("CONVENTION D'INTÉGRATION ET D'HABILITATION ASSOCIATIVE", 105, 57, { align: "center" });

    // 4. Cartouche Parties Signataires
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 68, 170, 42, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("ENTRE LES SOUSSIGNÉS :", 25, 75);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`1. LA DIRECTION DE LA PLATEFORME MY COMMUNITY (BÉNIN)`, 25, 82);
    doc.text(`   Représentée par : ${contract.signatoryPlatform}`, 25, 87);

    doc.text(`2. L'ASSOCIATION : ${contract.associationName} (${contract.associationAcronym || "Bénin"})`, 25, 95);
    doc.text(`   Représentée légalement par son Président / Mandataire : ${contract.signatoryPresident}`, 25, 100);

    // 5. Clauses & Conditions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("DISPOSITIONS CONTRACTUELLES ET ENGAGEMENTS :", 20, 118);

    let currentY = 126;
    contract.terms.forEach((term) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(term, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.5 + 2;
    });

    // 6. Cadre financier et durée
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, currentY + 3, 170, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("PÉRIODE DE VALIDITÉ & REDEVANCE :", 25, currentY + 9);

    doc.setFont("helvetica", "normal");
    doc.text(`Date d'effet : ${contract.startDate}   •   Date d'échéance : ${contract.endDate}`, 25, currentY + 15);
    doc.text(`Redevance annuelle de plateforme : ${contract.annualFeeXOF.toLocaleString("fr-FR")} FCFA (XOF)`, 25, currentY + 20);

    // 7. Signatures et Cachet
    const signY = currentY + 36;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Pour l'Association :", 35, signY);
    doc.text("Pour My Community (Bénin) :", 125, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(contract.signatoryPresident, 35, signY + 6);
    doc.text(contract.signatoryPlatform, 125, signY + 6);

    // Cachet / Badge sécurisé
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(120, signY + 12, 55, 18, 2, 2, "FD");
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text("MY COMMUNITY BENIN", 147.5, signY + 17, { align: "center" });
    doc.text("CONVENTION CONFORME", 147.5, signY + 22, { align: "center" });
    doc.setFontSize(6.5);
    doc.text(`Signé le ${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString("fr-FR") : "En attente"}`, 147.5, signY + 26, { align: "center" });

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Document contractuel officiel émis sous convention d'adhésion à la plateforme My Community — République du Bénin.",
      105,
      287,
      { align: "center" }
    );

    doc.save(`Convention-Integration-${contract.associationAcronym || "Assoc"}-${contract.contractNumber}.pdf`);
  }
}
