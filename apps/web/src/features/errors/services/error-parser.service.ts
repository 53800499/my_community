import { ProblemDetails } from "@my-community/contracts";
import { AppError, ErrorCategory } from "../types/error.types";

interface ApiErrorShape {
  problem?: ProblemDetails;
  message?: string;
  status?: number;
}

/**
 * Service pur de parsing et de traduction des erreurs (SRP).
 * Découple l'analyse des exceptions techniques de la couche de rendu UI.
 */
export class ErrorParserService {
  public static parse(error: unknown, fallbackMessage?: string): AppError {
    const timestamp = new Date().toISOString();

    // 1. Erreur RFC 7807 provenant de l'API (MyCommunityApiClient / ApiError)
    if (this.isApiError(error)) {
      const problem = error.problem!;
      const status = problem.status || 500;
      const category = this.categorizeStatus(status, problem.code);

      return {
        title: problem.title || this.getDefaultTitleForCategory(category),
        message: problem.detail || fallbackMessage || "Une anomalie s'est produite lors du traitement.",
        severity: status >= 500 ? "error" : "warning",
        category,
        code: problem.code,
        status,
        fieldErrors: problem.errors,
        technicalDetail: `Status: ${status} | Code: ${problem.code || "N/A"} | Instance: ${problem.instance || "N/A"}`,
        timestamp,
      };
    }

    // 2. Erreurs réseau / Socket Hang up / Offline
    if (this.isNetworkError(error)) {
      return {
        title: "Connexion impossible",
        message:
          "Impossible de joindre le serveur. Veuillez vérifier votre connexion Internet ou vous assurer que le serveur API local est démarré.",
        severity: "error",
        category: "NETWORK",
        code: "NETWORK_ERROR",
        technicalDetail: error instanceof Error ? error.message : String(error),
        timestamp,
      };
    }

    // 3. Erreur standard JavaScript Error
    if (error instanceof Error) {
      const msg = error.message;

      // Détection base de données PostgreSQL
      if (msg.includes("localhost:5434") || msg.includes("Can't reach database server")) {
        return {
          title: "Base de données inaccessible",
          message:
            "Le conteneur PostgreSQL local (port 5434) n'est pas joignable. Veuillez démarrer le conteneur Docker via 'docker start my-community-postgres'.",
          severity: "error",
          category: "DATABASE",
          code: "DATABASE_UNAVAILABLE",
          technicalDetail: msg,
          timestamp,
        };
      }

      return {
        title: "Erreur inattendue",
        message: fallbackMessage || msg || "Une anomalie est survenue dans l'application.",
        severity: "error",
        category: "UNKNOWN",
        technicalDetail: error.stack || msg,
        timestamp,
      };
    }

    // 4. Chaîne de caractères directe
    if (typeof error === "string") {
      return {
        title: "Information",
        message: error || fallbackMessage || "Une opération a échoué.",
        severity: "warning",
        category: "UNKNOWN",
        timestamp,
      };
    }

    // 5. Fallback inconnu
    return {
      title: "Anomalie non identifiée",
      message: fallbackMessage || "Une erreur inconnue s'est produite. Veuillez réessayer ultérieurement.",
      severity: "error",
      category: "UNKNOWN",
      technicalDetail: JSON.stringify(error),
      timestamp,
    };
  }

  private static isApiError(err: unknown): err is ApiErrorShape {
    return (
      typeof err === "object" &&
      err !== null &&
      "problem" in err &&
      typeof (err as ApiErrorShape).problem === "object"
    );
  }

  private static isNetworkError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("socket hang up") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("load failed")
    );
  }

  private static categorizeStatus(status: number, code?: string): ErrorCategory {
    if (code?.includes("DATABASE")) return "DATABASE";
    if (status === 401) return "AUTH";
    if (status === 403) return "PERMISSION";
    if (status === 400 || status === 422 || code === "VALIDATION_FAILED") return "VALIDATION";
    if (status === 404) return "NOT_FOUND";
    if (status === 409 || code === "DUPLICATE_ENTRY") return "CONFLICT";
    if (status >= 500) return "SERVER";
    return "UNKNOWN";
  }

  private static getDefaultTitleForCategory(cat: ErrorCategory): string {
    switch (cat) {
      case "NETWORK":
        return "Réseau indisponible";
      case "AUTH":
        return "Session non reconnue";
      case "PERMISSION":
        return "Accès restreint";
      case "VALIDATION":
        return "Formulaire incomplet ou invalide";
      case "NOT_FOUND":
        return "Élément introuvable";
      case "CONFLICT":
        return "Conflit d'enregistrement";
      case "DATABASE":
        return "Stockage de données indisponible";
      case "SERVER":
        return "Erreur du serveur central";
      default:
        return "Alerte système";
    }
  }
}
