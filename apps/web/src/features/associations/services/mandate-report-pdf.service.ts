import { ApiMandateAuditAction, ApiMandatePeriodSummary } from "../types/association-api.types";

export class MandateReportPdfService {
  public static async generateAndDownload(params: {
    associationName: string;
    associationAcronym?: string;
    summary: ApiMandatePeriodSummary;
    actions: ApiMandateAuditAction[];
  }): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. En-tête officiel de la République du Bénin
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70); // #065f46
    doc.text("RÉPUBLIQUE DU BÉNIN", 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Fraternité — Justice — Travail", 20, 21);

    // Référence officielle à droite
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`TRAÇABILITÉ-MANDAT-${params.summary.mandatePeriod.replace(/[^a-zA-Z0-9]/g, "")}`, 190, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Acte Scellé au Registre d'Audit Immuable", 190, 22, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Identification Association
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(
      `${params.associationName} ${params.associationAcronym ? `(${params.associationAcronym})` : ""}`,
      20,
      33
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Registre Central de Traçabilité & Reddition des Comptes de Mandature", 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Période d'Exercice : Du ${params.summary.termStartDate} au ${params.summary.termEndDate} • Statut : ${params.summary.status}`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    doc.roundedRect(20, 48, 170, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    doc.text("PROCÈS-VERBAL OFFICIEL DE TRAÇABILITÉ DES ACTES DU MANDAT", 105, 57, { align: "center" });

    // 4. Cartouche Synthèse Mandat
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 66, 170, 28, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("SYNTHÈSE DE LA MANDATURE :", 25, 73);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Période Élective : ${params.summary.mandatePeriod}`, 25, 80);
    doc.text(`Président(e) Titulaire : ${params.summary.presidentName}`, 25, 85);
    doc.text(`Trésorier(e) Général(e) : ${params.summary.treasurerName || "En cours de désignation"}`, 25, 90);

    doc.text(`Total Actes Enregistrés : ${params.summary.actionsCount} opérations`, 110, 80);
    doc.text(`Recettes Collectées : ${params.summary.totalIncomeXOF.toLocaleString("fr-FR")} FCFA`, 110, 85);
    doc.text(`Dépenses Décaissées : ${params.summary.totalExpenseXOF.toLocaleString("fr-FR")} FCFA`, 110, 90);

    // 5. Tableau des Actes Réalisés
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("JOURNAL CHRONOLOGIQUE DES ACTIONS SCELLÉES AU MANDAT :", 20, 102);

    let currentY = 108;
    const maxEntries = Math.min(params.actions.length, 12);

    // Entête tableau
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.rect(20, currentY, 170, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(67, 56, 202);
    doc.text("DATE & HEURE", 22, currentY + 4.8);
    doc.text("ACTION & RESSOURCE", 55, currentY + 4.8);
    doc.text("MANDATAIRE RESPONSABLE", 115, currentY + 4.8);
    doc.text("SCEAU D'INTÉGRITÉ", 155, currentY + 4.8);

    currentY += 7;

    for (let i = 0; i < maxEntries; i++) {
      const act = params.actions[i];
      const dateStr = new Date(act.timestamp).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      doc.setDrawColor(241, 245, 249);
      doc.line(20, currentY + 9, 190, currentY + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(dateStr, 22, currentY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text(act.actionTitle.slice(0, 38), 55, currentY + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(act.details.slice(0, 48), 55, currentY + 7.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(`${act.actorName} (${act.actorRole})`.slice(0, 28), 115, currentY + 5.5);

      doc.setFont("courier", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text("CERTIFIÉ CONFORME", 155, currentY + 5.5);

      currentY += 10;
    }

    if (params.actions.length > maxEntries) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`... et ${params.actions.length - maxEntries} autres actions scellées dans le registre numérique My Community.`, 20, currentY + 3);
      currentY += 6;
    }

    // 6. Signatures et Validation Légale
    currentY = Math.max(currentY + 6, 235);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, currentY, 170, 42, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text("CLÔTURE & CERTIFICATION DE CONFORMITÉ RÉPUBLICAINE", 25, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("Le présent procès-verbal consigne l'ensemble des actes accomplis durant la mandature sous serment citoyen.", 25, currentY + 12);
    doc.text("Fait foi auprès des assemblées générales, des commissaires aux comptes et de l'administration béninoise.", 25, currentY + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text("Le Président du Bureau Sortant :", 25, currentY + 24);
    doc.text("Le Commissaire aux Comptes / Tutelle :", 110, currentY + 24);

    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.text("« Reçu pour audit & conformité »", 25, currentY + 34);
    doc.text("« Quitus officiel validé »", 110, currentY + 34);

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document certifié ADR-006 • Émis le ${new Date().toLocaleDateString("fr-FR")} • Système National My Community Bénin`,
      105,
      288,
      { align: "center" }
    );

    const safeTitle = params.summary.mandatePeriod.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Rapport_Tracabilite_${safeTitle}.pdf`);
  }
}
