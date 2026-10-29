import { ApiAssociationExecutiveContract } from "@/lib/api";

export class ExecutiveContractPdfService {
  public static async generateAndDownload(contract: ApiAssociationExecutiveContract): Promise<void> {
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

    // Référence officielle à droite
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(contract.contractNumber, 190, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Acte Enregistré au Registre des Dirigeants", 190, 22, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association & Plateforme
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(contract.associationName, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Administration & Gouvernance Associative • My Community Bénin", 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Mandat : ${contract.positionTitle} • Statut : ${contract.status === "ACTIVE" ? "MANDAT VALIDÉ & ACTIF" : "EN ATTENTE DE SIGNATURE"}`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(238, 242, 255); // Indigo très clair
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(20, 48, 170, 15, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(67, 56, 202); // #4338ca
    doc.text("ACTE DE NOMINATION & CONTRAT DE MANDAT DU HAUT DIRIGEANT", 105, 57, { align: "center" });

    // 4. Cartouche Haut Membre / Mandataire
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 68, 170, 38, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("IDENTIFICATION DU TITULAIRE DU MANDAT :", 25, 74);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`${contract.officerName}`, 25, 81);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(`Fonction / Poste : ${contract.positionTitle} (Rôle : ${contract.officerRole})`, 25, 86);
    doc.text(`Contact : ${contract.officerPhone || "Non renseigné"} • Email : ${contract.officerEmail || "officiel@association.bj"}`, 25, 91);
    doc.text(`Période Officielle du Mandat : Du ${contract.termStartDate} au ${contract.termEndDate}`, 25, 96);
    doc.text(`Rémunération / Indemnité de Mandat : ${contract.monthlyIndemnityXOF > 0 ? `${contract.monthlyIndemnityXOF.toLocaleString("fr-FR")} FCFA / mois` : "Bénévolat citoyen d'intérêt général (Défraiement sur justificatifs)"}`, 25, 101);

    // 5. Délégations de Pouvoirs et Prérogatives
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("I. PÉRIMÈTRE DES DÉLÉGATIONS DE POUVOIRS & PRÉROGATIVES :", 20, 114);

    let currentY = 120;
    contract.delegations.forEach((delegation, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${delegation}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 6. Engagements Déontologiques & Probite
    currentY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("II. OBLIGATIONS DÉONTOLOGIQUES & ENGAGEMENT DE PROBITÉ :", 20, currentY);

    currentY += 6;
    contract.ethicalObligations.forEach((obligation) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${obligation}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 7. Zone de Signatures Officielles
    currentY = Math.max(currentY + 6, 225);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, currentY, 170, 48, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("APPROBATION ET SIGNATURES OFFICIELLES DU MANDAT", 25, currentY + 7);

    // Signataire 1 : Le Dirigeant Titulaire
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(17, 24, 39);
    doc.text("Le Dirigeant Titulaire (Mandataire) :", 25, currentY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Nom : ${contract.officerName}`, 25, currentY + 20);
    doc.text(`Mention : « Lu, approuvé et engagement formel »`, 25, currentY + 24);

    if (contract.isSigned) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(22, 101, 52);
      doc.text(`[SIGNÉ ÉLECTRONIQUEMENT LE ${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}]`, 25, currentY + 31);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38);
      doc.text("[En attente de signature formelle]", 25, currentY + 31);
    }

    // Signataire 2 : Pour l'Association / AG
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(17, 24, 39);
    doc.text("Pour l'Association & l'Assemblée Générale :", 110, currentY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Représentant : ${contract.signatorySupervisorName || "Conseil d'Administration"}`, 110, currentY + 20);
    doc.text(`Mention : « Mandat conféré selon statuts »`, 110, currentY + 24);

    // Cachet rond certifié
    doc.setDrawColor(67, 56, 202);
    doc.setLineWidth(0.6);
    doc.circle(150, currentY + 34, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(67, 56, 202);
    doc.text("CERTIFIÉ CONFORME", 150, currentY + 33, { align: "center" });
    doc.text("MY COMMUNITY", 150, currentY + 36, { align: "center" });

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document officiel généré le ${new Date().toLocaleDateString("fr-FR")} • Acte de gouvernance associative conforme aux directives de la République du Bénin`,
      105,
      287,
      { align: "center" }
    );

    // Téléchargement
    const sanitizedTitle = (contract.officerName || "dirigeant").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Mandat_${contract.contractNumber}_${sanitizedTitle}.pdf`);
  }
}
