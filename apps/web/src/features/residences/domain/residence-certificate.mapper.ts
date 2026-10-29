import { ApiResident, ApiResidentContract, ApiRoom } from "@/lib/api";
import { ResidenceCertificateData } from "./residence-certificate.types";

/**
 * Data Mapper statique et pur (Patterns Pragmatiques & SRP)
 * Isole la conversion des formats API vers le contrat pur du certificat.
 */
export class ResidenceCertificateMapper {
  private static readonly DEFAULT_ASSOCIATION_NAME = "Association Conventionnée";
  private static readonly DEFAULT_PREFECTURE_ORDER = "Enregistrement Préfectoral Conforme";
  private static readonly DEFAULT_RENT_XOF = 0;

  /**
   * Mappe un ApiResident avec un contrat vers un modèle de certificat officiel
   */
  public static fromResident(
    resident: ApiResident,
    activeContract?: ApiResidentContract | null
  ): ResidenceCertificateData {
    const contract =
      activeContract ||
      resident.contracts.find((c) => c.status === "ACTIVE") ||
      resident.contracts[0];

    const todayFormatted = new Date().toLocaleDateString("fr-BJ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const certificateRef = `ATT-MC-${new Date().getFullYear()}-${resident.userId
      .slice(0, 6)
      .toUpperCase()}`;

    const startDateFormatted = contract?.startDate
      ? new Date(contract.startDate).toLocaleDateString("fr-BJ")
      : todayFormatted;

    const endDateFormatted = contract?.endDate
      ? new Date(contract.endDate).toLocaleDateString("fr-BJ")
      : "Durée conventionnelle";

    return {
      certificateRef,
      issueDateFormatted: todayFormatted,
      resident: {
        fullName: `${resident.firstName} ${resident.lastName}`.trim(),
        phoneNumber: resident.phoneNumber,
        email: resident.email || null,
        statusText:
          contract?.status === "ACTIVE"
            ? "LOCATAIRE ACTIF & EN RÈGLE"
            : "SÉJOUR CONVENTIONNÉ",
      },
      housing: {
        quarterName: contract?.quarterName || resident.currentRoom?.quarterName || "Zone Résidentielle",
        quarterCity: contract?.quarterCity || resident.currentRoom?.quarterCity || resident.city || "Commune",
        buildingName: contract?.buildingName || resident.currentRoom?.buildingName || "Bâtiment Conventionné",
        landlordName: resident.currentRoom?.landlordName || "Bailleur Conventionné",
        roomNumber: contract?.roomNumber || resident.currentRoom?.roomNumber || "01",
        monthlyRentXOF: this.DEFAULT_RENT_XOF,
        startDateFormatted,
        endDateFormatted,
      },
      association: {
        name: contract?.associationName || this.DEFAULT_ASSOCIATION_NAME,
        prefectureOrder: this.DEFAULT_PREFECTURE_ORDER,
      },
    };
  }

  /**
   * Mappe une ApiRoom physique avec occupant vers un modèle de certificat officiel
   */
  public static fromRoom(room: ApiRoom): ResidenceCertificateData {
    const todayFormatted = new Date().toLocaleDateString("fr-BJ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const occupantName = room.currentOccupation?.occupantName || "Résident Hébergé";
    const occupantPhone = room.currentOccupation?.occupantPhone || "";
    const refCode = room.id.slice(0, 6).toUpperCase();

    const startDateFormatted = room.currentOccupation?.startDate
      ? new Date(room.currentOccupation.startDate).toLocaleDateString("fr-BJ")
      : todayFormatted;

    const endDateFormatted = room.currentOccupation?.endDate
      ? new Date(room.currentOccupation.endDate).toLocaleDateString("fr-BJ")
      : "Durée conventionnelle";

    return {
      certificateRef: `ATT-MC-${new Date().getFullYear()}-${refCode}`,
      issueDateFormatted: todayFormatted,
      resident: {
        fullName: occupantName,
        phoneNumber: occupantPhone,
        email: null,
        statusText: "LOCATAIRE ACTIF & EN RÈGLE",
      },
      housing: {
        quarterName: "Zone Résidentielle",
        quarterCity: "Commune",
        buildingName: "Bâtiment Conventionné",
        landlordName: "Bailleur Conventionné",
        roomNumber: room.roomNumber,
        monthlyRentXOF: room.monthlyRentXOF || this.DEFAULT_RENT_XOF,
        startDateFormatted,
        endDateFormatted,
      },
      association: {
        name: this.DEFAULT_ASSOCIATION_NAME,
        prefectureOrder: this.DEFAULT_PREFECTURE_ORDER,
      },
    };
  }
}
