import { ApiAssociationIntegrationRules } from "@/lib/api";

export class IntegrationRulesPdfService {
  public static async generateAndDownload(rules: ApiAssociationIntegrationRules): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. En-tête officiel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70);
    doc.text("RÉPUBLIQUE DU BÉNIN", 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Fraternité — Justice — Travail", 20, 21);

    // Référence
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`REG-INT-${rules.associationId.slice(0, 8).toUpperCase()}`, 190, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Règlement Intérieur & Charte Officielle", 190, 22, { align: "right" });

    // Ligne verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(rules.associationName, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Conditions Officielles d'Adhésion & Charte Déontologique des Membres", 20, 38);

    // 3. Bandeau Titre
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(20, 45, 170, 15, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52);
    doc.text("RÈGLES D'INTÉGRATION ET CHARTE DE L'ADHÉRENT CITOYEN", 105, 54, { align: "center" });

    // 4. Modalités Générales d'Adhésion
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 65, 170, 30, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("MODALITÉS OFFICIELLES D'ADMISSION :", 25, 72);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`• Statut de la Campagne d'Intégration : ${rules.status === "OPEN" ? "OUVERTE À TOUS" : rules.status === "INVITATION_ONLY" ? "SUR INVITATION / COOPTATION" : "CLÔTURÉE"}`, 25, 78);
    doc.text(`• Mode de Validation : ${rules.approvalMode === "AUTOMATIC" ? "Validation automatique après vérification des pièces" : rules.approvalMode === "BUREAU_REVIEW" ? "Examen et approbation par le Bureau Exécutif" : "Vote en Assemblée Générale ordinaire"}`, 25, 83);
    doc.text(`• Droit d'adhésion initial : ${rules.membershipFeeXOF.toLocaleString("fr-FR")} FCFA • Cotisation annuelle : ${rules.annualDuesXOF.toLocaleString("fr-FR")} FCFA`, 25, 88);

    // 5. Critères d'Éligibilité
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("I. CRITÈRES D'ÉLIGIBILITÉ ET CONDITIONS REQUISES :", 20, 102);

    let currentY = 108;
    rules.eligibilityCriteria.forEach((criterion) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${criterion}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 6. Pièces Justificatives Obligatoires
    currentY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("II. DOSSIER D'ADHÉSION & PIÈCES JUSTIFICATIVES :", 20, currentY);

    currentY += 6;
    rules.requiredDocuments.forEach((docName) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(`• ${docName}`, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.2 + 1.5;
    });

    // 7. Charte Déontologique
    currentY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("III. CHARTE CIVIQUE & ENGAGEMENT DU MEMBRE :", 20, currentY);

    currentY += 6;
    rules.charterArticles.forEach((article) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.text(article.title, 25, currentY);
      currentY += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(75, 85, 99);
      const lines = doc.splitTextToSize(article.content, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4 + 2;
    });

    // 8. Signatures & Approbation
    currentY = Math.max(currentY + 5, 235);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(20, currentY, 170, 38, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("VALIDATION ET PROMULGATION PAR LES ORGANES DIRIGEANTS", 25, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`Approuvé par le Bureau Exécutif de : ${rules.associationName}`, 25, currentY + 14);
    doc.text(`Dernière mise à jour : ${new Date(rules.updatedAt).toLocaleDateString("fr-FR")} par ${rules.updatedByUserName} (${rules.updatedByUserRole})`, 25, currentY + 20);

    // Cachet rond
    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.6);
    doc.circle(150, currentY + 24, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(22, 101, 52);
    doc.text("RÈGLEMENT ADOPTÉ", 150, currentY + 23, { align: "center" });
    doc.text("BUREAU EXÉCUTIF", 150, currentY + 26, { align: "center" });

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document officiel généré le ${new Date().toLocaleDateString("fr-FR")} • Valable pour toute nouvelle adhésion`,
      105,
      287,
      { align: "center" }
    );

    const sanitizedName = rules.associationName.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Regles_Integration_${sanitizedName}.pdf`);
  }
}
