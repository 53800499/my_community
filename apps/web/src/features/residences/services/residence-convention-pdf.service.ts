import { ApiBuildingConvention } from "@/lib/api";

export class ResidenceConventionPdfService {
  public static async generateAndDownload(conv: ApiBuildingConvention): Promise<void> {
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
    doc.text(conv.conventionNumber, 190, 21, { align: "right" });

    // Ligne séparatrice verte
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // 2. Nom de l'Association Gestionnaire
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(conv.associationName, 20, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("Gestion du Patrimoine Résidentiel & Chambres Citoyennes", 20, 38);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Convention d'Exploitation Immobilière • Bâtiment: ${conv.buildingName} (${conv.quarterCity})`, 20, 43);

    // 3. Bandeau Titre
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(20, 48, 170, 14, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52); // #166534
    doc.text("CONVENTION DE GESTION & BAIL D'EXPLOITATION RÉSIDENCE", 105, 57, { align: "center" });

    // 4. Cartouche Parties
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 68, 170, 48, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("LES PARTIES CONTRACTANTES :", 25, 75);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`1. LE BAILLEUR / PROPRIÉTAIRE DU BÂTIMENT :`, 25, 82);
    doc.text(`   Nom : ${conv.landlordName}`, 25, 87);
    doc.text(`   Contact : ${conv.landlordPhone} ${conv.landlordEmail ? `• ${conv.landlordEmail}` : ""}`, 25, 92);
    if (conv.landlordIbanOrMomo) {
      doc.text(`   Coordonnées de règlement : ${conv.landlordIbanOrMomo}`, 25, 97);
    }

    doc.text(`2. L'ASSOCIATION GESTIONNAIRE : ${conv.associationName}`, 25, 105);
    doc.text(`   Campus / Quartier : ${conv.quarterName} (${conv.quarterCity})`, 25, 110);

    // 5. Objet & Conditions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("OBJET DE LA CONVENTION ET CONDITIONS FINANCIÈRES :", 20, 126);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(`Bâtiment conventionné : ${conv.buildingName} • Capacité conventionnée : ${conv.roomsCovered} logements`, 25, 133);
    doc.text(`Redevance mensuelle versée au bailleur : ${conv.monthlyMasterRentXOF.toLocaleString("fr-FR")} FCFA (XOF) / mois`, 25, 138);
    doc.text(`Dépôt de garantie versé : ${conv.guaranteeDepositXOF.toLocaleString("fr-FR")} FCFA (XOF)`, 25, 143);
    doc.text(`Période de convention : Du ${conv.startDate} au ${conv.endDate} (Renouvellement : ${conv.renewalType})`, 25, 148);

    // 6. Clauses d'exploitation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text("CLAUSES ET ENGAGEMENTS PARTICULIERS :", 20, 160);

    let currentY = 167;
    conv.clauses.forEach((cl) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(cl, 165);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4.5 + 2;
    });

    // 7. Signatures et Cachet
    const signY = Math.max(currentY + 12, 220);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Pour le Bailleur :", 35, signY);
    doc.text("Pour l'Association Gestionnaire :", 120, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(conv.landlordName, 35, signY + 6);
    doc.text(conv.associationName, 120, signY + 6);

    // Cachet
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(120, signY + 12, 58, 20, 2, 2, "FD");
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text("GESTION RÉSIDENTIELLE", 149, signY + 17, { align: "center" });
    doc.text("BAIL D'EXPLOITATION ACTIF", 149, signY + 22, { align: "center" });
    doc.setFontSize(6.5);
    doc.text(`Vérifié conforme le ${new Date().toLocaleDateString("fr-FR")}`, 149, signY + 27, { align: "center" });

    // Pied de page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Convention officielle de gestion locative et d'exploitation résidentielle — Plateforme My Community.",
      105,
      287,
      { align: "center" }
    );

    doc.save(`Convention-Bailleur-${conv.buildingName.replace(/\s+/g, "_")}-${conv.conventionNumber}.pdf`);
  }
}
