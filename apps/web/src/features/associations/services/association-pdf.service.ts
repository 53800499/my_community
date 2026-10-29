import { jsPDF } from 'jspdf';
import { Association, AssociationPosition } from '../domain/association.types';

/**
 * Service Pur : Génération PDF de l'Organigramme & Procès-Verbal Officiel du Bureau (SRP & DIP)
 * Produit un document vectoriel conforme aux standards administratifs du Bénin.
 */
export class AssociationPdfService {
  public static generateOrganigrammePdf(params: {
    association: Association;
    positions: AssociationPosition[];
  }): void {
    const { association, positions } = params;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    // 1. En-tête officiel République du Bénin
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('RÉPUBLIQUE DU BÉNIN', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Fraternité - Justice - Travail', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text(`Département de l'${association.departmentName || 'Atlantique'} — Commune d'${association.city || 'Abomey-Calavi'}`, pageWidth / 2, y, { align: 'center' });
    y += 6;

    // Ligne décorative vert/jaune/rouge du drapeau
    doc.setDrawColor(0, 135, 81); // Vert Bénin
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth * 0.33, y);

    doc.setDrawColor(253, 209, 22); // Jaune Bénin
    doc.line(margin + contentWidth * 0.33, y, margin + contentWidth * 0.66, y);

    doc.setDrawColor(232, 17, 45); // Rouge Bénin
    doc.line(margin + contentWidth * 0.66, y, margin + contentWidth, y);
    y += 8;

    // 2. Fiche Association
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(association.name, margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Sigle : ${association.acronym || 'N/A'}  •  Récépissé N° : ${association.registrationNumber || 'En cours d’enregistrement'}`, margin + 5, y + 14);
    doc.text(`Siège social : ${association.territory || 'Bénin'}  •  Adhérents enregistrés : ${association.membersCount} membres`, margin + 5, y + 19);
    y += 30;

    // 3. Titre du document
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('ORGANIGRAMME OFFICIEL DU BUREAU EXÉCUTIF & COMMISSIONS', pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Arrêté au ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} — Mandat en cours`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // 4. Tableau des Postes de Gouvernance
    // En-tête tableau
    doc.setFillColor(79, 70, 229); // Brand primary
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('POSTE / RÔLE DE DIRECTION', margin + 3, y + 5);
    doc.text('PÔLE / COMMISSION', margin + 65, y + 5);
    doc.text('TITULAIRE DÉSIGNÉ', margin + 115, y + 5);
    doc.text('STATUT', margin + 155, y + 5);
    y += 7;

    // Lignes du tableau
    positions.forEach((pos, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const isEven = index % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 10, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 10, margin + contentWidth, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(pos.title.length > 32 ? pos.title.slice(0, 30) + '...' : pos.title, margin + 3, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(pos.department.length > 25 ? pos.department.slice(0, 23) + '...' : pos.department, margin + 65, y + 6);

      doc.setFont('helvetica', pos.assignedUserName ? 'bold' : 'italic');
      doc.setTextColor(pos.assignedUserName ? 15 : 148, pos.assignedUserName ? 23 : 163, pos.assignedUserName ? 42 : 184);
      doc.text(pos.assignedUserName || 'Poste à pourvoir (Vacant)', margin + 115, y + 6);

      // Badge Statut
      if (pos.status === 'OCCUPIED') {
        doc.setTextColor(16, 149, 106);
        doc.text('POURVU', margin + 155, y + 6);
      } else {
        doc.setTextColor(217, 119, 6);
        doc.text('VACANT', margin + 155, y + 6);
      }

      y += 10;
    });

    y += 10;

    // 5. Bloc de certification & Signatures
    if (y > 230) {
      doc.addPage();
      y = 25;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Certifié exact et conforme aux délibérations statutaires de l’Assemblée Générale des membres.',
      margin,
      y,
    );
    y += 12;

    const colWidth = contentWidth / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text('Pour le Secrétariat Général', margin + 10, y);
    doc.text('Pour la Présidence du Bureau Exécutif', margin + colWidth + 10, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('(Signature & Sceau officiel)', margin + 10, y);
    doc.text('(Signature & Sceau officiel)', margin + colWidth + 10, y);

    y += 20;

    // Bas de page sécurisé
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 280, margin + contentWidth, 280);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Document officiel généré par la plateforme civique My Community Bénin • Identifiant d'authenticité : MC-ORG-${association.id.slice(0, 8).toUpperCase()}`,
      pageWidth / 2,
      284,
      { align: 'center' },
    );

    // Télécharger le PDF
    const filename = `Organigramme_${(association.acronym || association.name).replace(/\s+/g, '_')}_2026.pdf`;
    doc.save(filename);
  }
}
