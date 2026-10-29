import { ApiResidentDelegateContract } from "@/lib/api";

export class ResidentDelegateContractPdfService {
  public static async generateAndDownload(contract: ApiResidentDelegateContract): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. En-tête officiel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70); // vert républicain foncé
    doc.text("RÉPUBLIQUE DU BÉNIN", 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Fraternité — Justice — Travail", 20, 21);

    // Référence officielle à droite
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(contract.contractNumber, 190, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Mandat de Représentation Résidentielle", 190, 22, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association & Résidence
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`${contract.associationName} — Gestion Résidentielle`, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text(`Pavillon / Résidence : ${contract.buildingName || "Toutes Résidences Partenaires"} • My Community Bénin`, 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Mandat : ${contract.positionTitle} • Statut : ${contract.status === "ACTIVE" ? "MANDAT CONFIRMÉ & ACTIF" : "EN ATTENTE DE SIGNATURE"}`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(240, 253, 250); // Teal très clair
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(20, 48, 170, 15, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110); // #0f766e
    doc.text("ACTE OFFICIEL DE MANDAT DU DÉLÉGUÉ DE RÉSIDENCE / PAVILLON", 105, 57, { align: "center" });

    // 4. Cartouche Délégué
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 68, 170, 38, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("IDENTIFICATION DU DÉLÉGUÉ TITULAIRE :", 25, 74);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`${contract.delegateName}`, 25, 81);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(`Rôle : ${contract.delegateRole} • Intitulé : ${contract.positionTitle}`, 25, 86);
    doc.text(`Pavillon de Rattachement : ${contract.buildingName || "Pavillon Universitaire"} (${contract.roomNumber || "Logement Délégué"})`, 25, 91);
    doc.text(`Période de Validité : Du ${contract.termStartDate} au ${contract.termEndDate}`, 25, 96);
    doc.text(`Avantage / Réduction Loyer : ${contract.monthlyRentReductionXOF > 0 ? `${contract.monthlyRentReductionXOF.toLocaleString("fr-FR")} FCFA / mois de réduction` : "Bénévolat et engagement solidaire de pavillon"}`, 25, 101);

    // 5. Prérogatives & Délégations
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("I. PRÉROGATIVES ET DÉLÉGATIONS DE GESTION AU SEIN DU PAVILLON :", 20, 114);

    let currentY = 120;
    contract.delegations.forEach((delegation) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${delegation}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 6. Obligations Déontologiques
    currentY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("II. ENGAGEMENTS DÉONTOLOGIQUES DU DÉLÉGUÉ DE RÉSIDENCE :", 20, currentY);

    currentY += 6;
    contract.ethicalObligations.forEach((obligation) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${obligation}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 7. Zone de Signatures
    currentY = Math.max(currentY + 6, 225);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, currentY, 170, 48, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("VALIDATION ET SIGNATURE DU MANDAT DE DÉLÉGUÉ", 25, currentY + 7);

    // Signataire 1 : Le Délégué
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(17, 24, 39);
    doc.text("Le Délégué de Résidence Titulaire :", 25, currentY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Nom : ${contract.delegateName}`, 25, currentY + 20);
    doc.text(`Mention : « Lu et engagement au vivre-ensemble »`, 25, currentY + 24);

    if (contract.isSigned) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(22, 101, 52);
      doc.text(`[SIGNÉ ÉLECTRONIQUEMENT LE ${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}]`, 25, currentY + 31);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38);
      doc.text("[En attente de signature du titulaire]", 25, currentY + 31);
    }

    // Signataire 2 : Pour l'Association Gestionnaire
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(17, 24, 39);
    doc.text("Pour l'Association & la Commission Résidence :", 110, currentY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Représentant : ${contract.signatorySupervisorName || "Direction du Logement Solidaire"}`, 110, currentY + 20);
    doc.text(`Mention : « Mandat conféré pour le pavillon »`, 110, currentY + 24);

    // Cachet rond certifié
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.6);
    doc.circle(150, currentY + 34, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(15, 118, 110);
    doc.text("DÉLÉGUÉ AGRÉÉ", 150, currentY + 33, { align: "center" });
    doc.text("MY COMMUNITY", 150, currentY + 36, { align: "center" });

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document officiel généré le ${new Date().toLocaleDateString("fr-FR")} • Acte d'animation et de médiation résidentielle conforme à la réglementation béninoise`,
      105,
      287,
      { align: "center" }
    );

    const sanitizedTitle = (contract.delegateName || "delegue").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Mandat_Delegue_${contract.contractNumber}_${sanitizedTitle}.pdf`);
  }
}
