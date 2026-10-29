/**
 * Typage unifié du système de gestion des erreurs (SRP & ISP).
 * Transforme les erreurs techniques brutes en structures compréhensibles par les utilisateurs.
 */

export type ErrorSeverity = "error" | "warning" | "info";

export type ErrorCategory =
  | "NETWORK"
  | "AUTH"
  | "PERMISSION"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE"
  | "SERVER"
  | "UNKNOWN";

export interface ErrorAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface AppError {
  /** Titre concis et lisible pour l'utilisateur */
  title: string;
  /** Explication détaillée formulée de façon bienveillante */
  message: string;
  /** Niveau de sévérité pour le style visuel */
  severity: ErrorSeverity;
  /** Catégorie sémantique pour le ciblage */
  category: ErrorCategory;
  /** Code technique standardisé (ex: DATABASE_UNAVAILABLE, VALIDATION_FAILED) */
  code?: string;
  /** Statut HTTP associé si applicable */
  status?: number;
  /** Erreurs par champ pour les formulaires (clé = nom du champ, valeur = messages) */
  fieldErrors?: Record<string, string[]>;
  /** Action de remédiation suggérée (ex: Réessayer, Se connecter) */
  action?: ErrorAction;
  /** Détail technique optionnel pour les logs ou le support */
  technicalDetail?: string;
  /** Horodatage ISO de survenue de l'erreur */
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
  duration?: number;
  action?: ErrorAction;
}
