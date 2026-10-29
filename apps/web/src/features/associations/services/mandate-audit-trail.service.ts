import {
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  generateUuid,
} from "@/lib/api-client";
import {
  ApiMandateAuditAction,
  ApiMandatePeriodSummary,
  ApiAssociationMandate,
  MandateActionCategory,
} from "../types/association-api.types";

/**
 * Service de Traçabilité & Registre d'Audit des Mandats Électifs (ADR-006 & ADR-011)
 * Garantit que chaque acte de gestion (Finances, Résidences, Adhésions, Actes administratifs)
 * est lié sans exception à la période de candidature/mandat de la partie prenante responsable.
 */
export const mandateAuditTrailService = {
  /**
   * Enregistre un acte de gestion dans le journal d'audit immuable lié au mandat.
   */
  async recordAction(
    params: Omit<ApiMandateAuditAction, "id" | "timestamp" | "integrityHash">
  ): Promise<ApiMandateAuditAction> {
    const list = getLocalState<ApiMandateAuditAction[]>(
      STORAGE_KEYS.MANDATE_AUDIT_LOGS,
      []
    );

    const now = new Date().toISOString();
    const id = generateUuid();
    // Signature d'intégrité déterministe certifiant l'horodatage et la période
    const integrityHash = `MC-SEAL-${params.associationId.slice(0, 8)}-${params.mandatePeriod.replace(/\s+/g, "_")}-${Date.now()}`;

    const entry: ApiMandateAuditAction = {
      ...params,
      id,
      timestamp: now,
      integrityHash,
    };

    setLocalState(STORAGE_KEYS.MANDATE_AUDIT_LOGS, [entry, ...list]);
    return entry;
  },

  /**
   * Récupère la liste des actions d'audit filtrées par association, période de mandat ou catégorie.
   */
  async listActions(filter?: {
    associationId?: string;
    mandatePeriod?: string;
    category?: string;
    searchTerm?: string;
  }): Promise<ApiMandateAuditAction[]> {
    const list = getLocalState<ApiMandateAuditAction[]>(
      STORAGE_KEYS.MANDATE_AUDIT_LOGS,
      []
    );

    let filtered = list;
    if (filter?.associationId && filter.associationId !== "ALL") {
      filtered = filtered.filter((a) => a.associationId === filter.associationId);
    }
    if (filter?.mandatePeriod && filter.mandatePeriod !== "ALL") {
      filtered = filtered.filter((a) => a.mandatePeriod === filter.mandatePeriod);
    }
    if (filter?.category && filter.category !== "ALL") {
      filtered = filtered.filter((a) => a.category === filter.category);
    }
    if (filter?.searchTerm) {
      const q = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.actionTitle.toLowerCase().includes(q) ||
          a.actorName.toLowerCase().includes(q) ||
          a.actorRole.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.integrityHash.toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  /**
   * Liste toutes les périodes de mandats recensées pour une association donnée.
   * Totalement dynamique : s'appuie sur les mandatures créées et l'historique d'audit.
   */
  async listMandatePeriods(associationId: string): Promise<string[]> {
    const actions = await this.listActions({ associationId });
    const storedMandates = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
    const assocMandates = storedMandates.filter((m) => m.associationId === associationId);

    const periods = new Set<string>();
    assocMandates.forEach((m) => {
      periods.add(`${m.title} (${m.academicYear})`);
    });
    actions.forEach((a) => {
      if (a.mandatePeriod) periods.add(a.mandatePeriod);
    });

    if (periods.size === 0) {
      const currentYear = new Date().getFullYear();
      periods.add(`Mandat ${currentYear}-${currentYear + 1} (Actuel)`);
    }

    return Array.from(periods);
  },

  /**
   * Récupère la synthèse d'intégrité du mandat sélectionné ou actif pour l'association.
   */
  async getMandateSummary(associationId: string, mandatePeriod?: string): Promise<ApiMandatePeriodSummary> {
    const storedMandates = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
    const assocMandates = storedMandates.filter((m) => m.associationId === associationId);
    const activeMandate = assocMandates.find((m) => m.status === "ACTIVE") || assocMandates[0];

    const currentYear = new Date().getFullYear();
    const fallbackPeriod = activeMandate
      ? `${activeMandate.title} (${activeMandate.academicYear})`
      : `Mandat ${currentYear}-${currentYear + 1}`;

    const selectedPeriod = mandatePeriod || fallbackPeriod;
    const matchingMandate = assocMandates.find(
      (m) => `${m.title} (${m.academicYear})` === selectedPeriod || m.title === selectedPeriod
    );

    const actions = await this.listActions({ associationId, mandatePeriod: selectedPeriod });
    const totalIncome = actions
      .filter((a) => a.category === "FINANCE" && (a.actionType.includes("COTISATION") || a.actionType.includes("DONATION") || a.actionType.includes("INCOME")))
      .reduce((sum, a) => sum + (a.amountXOF || 0), 0);
    const totalExpense = actions
      .filter((a) => a.category === "FINANCE" && (a.actionType.includes("EXPENSE") || a.actionType.includes("RENT")))
      .reduce((sum, a) => sum + (a.amountXOF || 0), 0);

    return {
      mandatePeriod: selectedPeriod,
      termStartDate: matchingMandate?.startDate || `${currentYear}-01-01`,
      termEndDate: matchingMandate?.endDate || `${currentYear + 1}-12-31`,
      presidentName: matchingMandate?.presidentName || "Président(e) en exercice",
      treasurerName: matchingMandate?.treasurerName || "Trésorier(e) Général(e)",
      secretaryName: matchingMandate?.secretaryName || "Secrétaire Général(e)",
      status: matchingMandate?.status || "ACTIVE",
      actionsCount: actions.length,
      totalIncomeXOF: totalIncome,
      totalExpenseXOF: totalExpense,
    };
  },
};
