import {
  apiClient,
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  generateUuid,
} from '@/lib/api-client';
import {
  ApiFinancialTransaction,
  ApiCotisation,
  ApiBuildingLease,
  ApiBuildingRentExpense,
  ApiIntegrationFeePlan,
  ApiIntegrationFeeDue,
  ApiDonation,
  ApiExpense,
  ApiFinanceStats,
  RecordDonationPayload,
  RecordExpensePayload,
} from '../types/finance-api.types';
import { mandateAuditTrailService } from '@/features/associations/services/mandate-audit-trail.service';

export const financeApiService = {
  // ---------------------------------------------------------------------------
  // 1. STATS
  // ---------------------------------------------------------------------------
  async getStats(associationId?: string): Promise<ApiFinanceStats> {
    try {
      const query = associationId ? `?associationId=${encodeURIComponent(associationId)}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: ApiFinanceStats }>(`finance/stats${query}`);
      if (res && res.data) return res.data;
    } catch (err) {
      console.warn('financeApiService.getStats fetch fallback:', err);
    }

    const txs = await this.getTransactions({ associationId });
    const dues = await this.getIntegrationFeeDues();

    let totalIncome = 0;
    let totalExpense = 0;
    let totalCotisations = 0;
    let totalDonations = 0;
    let totalIntegrationFees = 0;
    let totalLandlordRents = 0;
    const expensesByCategory: Record<string, number> = {};

    for (const tx of txs) {
      if (tx.status !== 'POSTED') continue;
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (tx.category === 'COTISATION') totalCotisations += tx.amount;
        else if (tx.category === 'DON' || tx.category === 'DONATION') totalDonations += tx.amount;
        else if (tx.category === 'INTEGRATION_FEE') totalIntegrationFees += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
        if (tx.category === 'BUILDING_RENT' || tx.category === 'LOYER_BAILLEUR') {
          totalLandlordRents += tx.amount;
        }
        if (tx.category) {
          expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
        }
      } else if (tx.type === 'ADJUSTMENT') {
        totalIncome += tx.amount;
      }
    }

    const pendingIntegrationDues = dues.reduce(
      (sum, d) => sum + (d.status !== 'SETTLED' ? d.remainingAmount : 0),
      0,
    );

    return {
      totalIncomeXOF: totalIncome,
      totalExpenseXOF: totalExpense,
      netBalanceXOF: totalIncome - totalExpense,
      totalCotisationsXOF: totalCotisations,
      totalDonationsXOF: totalDonations,
      totalIntegrationFeesXOF: totalIntegrationFees,
      totalLandlordRentsXOF: totalLandlordRents,
      pendingIntegrationDuesXOF: pendingIntegrationDues,
      pendingBuildingRentXOF: 0,
      transactionsCount: txs.length,
      expensesByCategory,
      monthlyBreakdown: [],
    };
  },

  // ---------------------------------------------------------------------------
  // 2. TRANSACTIONS / GRAND LIVRE (ADR-006)
  // ---------------------------------------------------------------------------
  async getTransactions(filter?: {
    associationId?: string;
    type?: string;
    category?: string;
  }): Promise<ApiFinancialTransaction[]> {
    const stored = getLocalState<ApiFinancialTransaction[]>(STORAGE_KEYS.FINANCE_TRANSACTIONS, []);
    try {
      const params = new URLSearchParams();
      if (filter?.associationId) params.append('associationId', filter.associationId);
      if (filter?.type) params.append('type', filter.type);
      if (filter?.category) params.append('category', filter.category);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiClient.fetch<{ success: boolean; data: ApiFinancialTransaction[] }>(
        `finance/transactions${query}`,
      );
      if (res && Array.isArray(res.data)) {
        const map = new Map<string, ApiFinancialTransaction>();
        stored.forEach((t) => map.set(t.id, t));
        res.data.forEach((t) => map.set(t.id, t));
        const merged = Array.from(map.values());
        setLocalState(STORAGE_KEYS.FINANCE_TRANSACTIONS, merged);
        return filter?.associationId
          ? merged.filter((t) => t.associationId === filter.associationId)
          : merged;
      }
    } catch (err) {
      console.warn('financeApiService.getTransactions fallback to storage:', err);
    }
    return filter?.associationId
      ? stored.filter((t) => t.associationId === filter.associationId)
      : stored;
  },

  async createTransaction(data: {
    associationId?: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
    reference?: string;
    description?: string;
    category?: string;
    paymentMethod?: string;
  }): Promise<ApiFinancialTransaction> {
    const txs = await this.getTransactions();
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiFinancialTransaction }>(
        'finance/transactions',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) {
        setLocalState(STORAGE_KEYS.FINANCE_TRANSACTIONS, [res.data, ...txs.filter((t) => t.id !== res.data.id)]);
        mandateAuditTrailService.recordAction({
          associationId: data.associationId || 'ALL',
          mandatePeriod: 'Mandat 2026-2028 (Actuel)',
          mandateContractNumber: 'MANDAT-2026-001',
          actorId: 'usr-tres-01',
          actorName: 'Trésorier(ère) Général(e)',
          actorRole: 'Bureau Exécutif',
          category: 'FINANCE',
          actionType: 'TRANSACTION_RECORDED',
          actionTitle: `Écriture Grand Livre : ${data.type} (${(data.amount || 0).toLocaleString('fr-FR')} FCFA)`,
          resourceType: 'FINANCIAL_TRANSACTION',
          resourceId: res.data.id,
          amountXOF: data.amount,
          details: data.description || 'Opération de caisse enregistrée au Grand Livre',
        }).catch(() => {});
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.createTransaction API error, saving locally:', err);
    }

    const localTx: ApiFinancialTransaction = {
      id: generateUuid(),
      associationId: data.associationId,
      amount: data.amount,
      currency: 'XOF',
      type: data.type,
      status: 'POSTED',
      reference: data.reference || `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod || 'MOBILE_MONEY',
      createdAt: new Date().toISOString(),
    };

    setLocalState(STORAGE_KEYS.FINANCE_TRANSACTIONS, [localTx, ...txs]);
    mandateAuditTrailService.recordAction({
      associationId: data.associationId || 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'FINANCE',
      actionType: 'TRANSACTION_RECORDED',
      actionTitle: `Écriture Grand Livre : ${data.type} (${(data.amount || 0).toLocaleString('fr-FR')} FCFA)`,
      resourceType: 'FINANCIAL_TRANSACTION',
      resourceId: localTx.id,
      amountXOF: data.amount,
      details: data.description || 'Opération de caisse enregistrée au Grand Livre',
    }).catch(() => {});
    return localTx;
  },

  async createAdjustment(id: string, data: { adjustmentAmount: number; reason: string }): Promise<ApiFinancialTransaction> {
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiFinancialTransaction }>(
        `finance/transactions/${id}/adjust`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) {
        const txs = await this.getTransactions();
        setLocalState(STORAGE_KEYS.FINANCE_TRANSACTIONS, [res.data, ...txs]);
        mandateAuditTrailService.recordAction({
          associationId: res.data.associationId || 'ALL',
          mandatePeriod: 'Mandat 2026-2028 (Actuel)',
          mandateContractNumber: 'MANDAT-2026-001',
          actorId: 'usr-tres-01',
          actorName: 'Trésorier(ère) Général(e)',
          actorRole: 'Bureau Exécutif',
          category: 'FINANCE',
          actionType: 'ADJUSTMENT_POSTED',
          actionTitle: `Ajustement compensatoire ADR-006 : ${(data.adjustmentAmount || 0).toLocaleString('fr-FR')} FCFA`,
          resourceType: 'FINANCIAL_TRANSACTION',
          resourceId: res.data.id,
          amountXOF: data.adjustmentAmount,
          details: `Régularisation sur transaction : ${data.reason}`,
        }).catch(() => {});
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.createAdjustment error:', err);
    }

    const txs = await this.getTransactions();
    const orig = txs.find((t) => t.id === id);
    const localAdj: ApiFinancialTransaction = {
      id: generateUuid(),
      associationId: orig?.associationId,
      amount: data.adjustmentAmount,
      currency: 'XOF',
      type: 'ADJUSTMENT',
      status: 'POSTED',
      reference: `ADJ-${orig?.reference || id.slice(0, 8)}`,
      description: `Ajustement de la transaction ${orig?.reference || id} : ${data.reason}`,
      category: orig?.category || 'AJUSTEMENT',
      paymentMethod: orig?.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    setLocalState(STORAGE_KEYS.FINANCE_TRANSACTIONS, [localAdj, ...txs]);
    mandateAuditTrailService.recordAction({
      associationId: orig?.associationId || 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'FINANCE',
      actionType: 'ADJUSTMENT_POSTED',
      actionTitle: `Ajustement compensatoire ADR-006 : ${(data.adjustmentAmount || 0).toLocaleString('fr-FR')} FCFA`,
      resourceType: 'FINANCIAL_TRANSACTION',
      resourceId: localAdj.id,
      amountXOF: data.adjustmentAmount,
      details: `Régularisation sur transaction ${orig?.reference || id} : ${data.reason}`,
    }).catch(() => {});
    return localAdj;
  },

  // ---------------------------------------------------------------------------
  // 3. COTISATIONS ADHÉRENTS
  // ---------------------------------------------------------------------------
  async getCotisations(filter?: {
    associationId?: string;
    memberId?: string;
    period?: string;
  }): Promise<ApiCotisation[]> {
    const stored = getLocalState<ApiCotisation[]>(STORAGE_KEYS.FINANCE_COTISATIONS, []);
    try {
      const params = new URLSearchParams();
      if (filter?.associationId) params.append('associationId', filter.associationId);
      if (filter?.memberId) params.append('memberId', filter.memberId);
      if (filter?.period) params.append('period', filter.period);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiClient.fetch<{ success: boolean; data: ApiCotisation[] }>(
        `finance/cotisations${query}`,
      );
      if (res && Array.isArray(res.data)) {
        const map = new Map<string, ApiCotisation>();
        stored.forEach((c) => map.set(c.id, c));
        res.data.forEach((c) => map.set(c.id, c));
        const merged = Array.from(map.values());
        setLocalState(STORAGE_KEYS.FINANCE_COTISATIONS, merged);
        return filter?.associationId
          ? merged.filter((c) => c.associationId === filter.associationId)
          : merged;
      }
    } catch (err) {
      console.warn('financeApiService.getCotisations fallback:', err);
    }
    return filter?.associationId
      ? stored.filter((c) => c.associationId === filter.associationId)
      : stored;
  },

  async recordCotisation(data: {
    associationId: string;
    memberId: string;
    citizenName?: string;
    phone?: string;
    amount: number;
    period: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<ApiCotisation> {
    const list = await this.getCotisations();
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiCotisation }>(
        'finance/cotisations',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) {
        setLocalState(STORAGE_KEYS.FINANCE_COTISATIONS, [res.data, ...list]);
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.recordCotisation API error, saving locally:', err);
    }

    const localCot: ApiCotisation = {
      id: generateUuid(),
      associationId: data.associationId,
      memberId: data.memberId,
      citizenName: data.citizenName || 'Adhérent Associatif',
      phone: data.phone || '+229 97 00 00 00',
      amountXOF: data.amount,
      currency: 'XOF',
      period: data.period,
      status: 'ENCAISSE',
      paymentMethod: data.paymentMethod || 'MOBILE_MONEY',
      channel: (data.paymentMethod as any) || 'MTN_MOMO',
      reference: `MOMO-BJ-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: data.notes,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setLocalState(STORAGE_KEYS.FINANCE_COTISATIONS, [localCot, ...list]);

    // Also record transaction in ledger
    await this.createTransaction({
      associationId: data.associationId,
      amount: data.amount,
      type: 'INCOME',
      category: 'COTISATION',
      paymentMethod: data.paymentMethod || 'MOBILE_MONEY',
      reference: localCot.reference,
      description: `Cotisation membre : ${data.citizenName || 'Adhérent'} (${data.period})`,
    });

    return localCot;
  },

  // ---------------------------------------------------------------------------
  // 4. BAUX PROPRIÉTAIRES & CHARGES DE LOYER
  // ---------------------------------------------------------------------------
  async getBuildingLeases(associationId?: string): Promise<ApiBuildingLease[]> {
    const stored = getLocalState<ApiBuildingLease[]>(STORAGE_KEYS.FINANCE_LEASES, []);
    try {
      const query = associationId ? `?associationId=${encodeURIComponent(associationId)}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: ApiBuildingLease[] }>(
        `finance/building-leases${query}`,
      );
      if (res && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.getBuildingLeases fallback:', err);
    }
    return associationId ? stored.filter((l) => l.associationId === associationId) : stored;
  },

  async createBuildingLease(data: {
    buildingId: string;
    associationId: string;
    monthlyRentAmount: number;
    paymentDayOfMonth?: number;
    leaseStartDate: string;
    leaseEndDate?: string;
  }): Promise<ApiBuildingLease> {
    const leases = await this.getBuildingLeases();
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiBuildingLease }>(
        'finance/building-leases',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) {
        setLocalState(STORAGE_KEYS.FINANCE_LEASES, [res.data, ...leases]);
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.createBuildingLease error:', err);
    }

    const localLease: ApiBuildingLease = {
      id: generateUuid(),
      buildingId: data.buildingId,
      associationId: data.associationId,
      monthlyRentAmount: data.monthlyRentAmount,
      currency: 'XOF',
      paymentDayOfMonth: data.paymentDayOfMonth || 5,
      leaseStartDate: data.leaseStartDate,
      leaseEndDate: data.leaseEndDate,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalState(STORAGE_KEYS.FINANCE_LEASES, [localLease, ...leases]);
    return localLease;
  },

  async getBuildingRentExpenses(filter?: { leaseId?: string; monthYear?: string }): Promise<ApiBuildingRentExpense[]> {
    const stored = getLocalState<ApiBuildingRentExpense[]>(STORAGE_KEYS.FINANCE_RENT_EXPENSES, []);
    try {
      const params = new URLSearchParams();
      if (filter?.leaseId) params.append('leaseId', filter.leaseId);
      if (filter?.monthYear) params.append('monthYear', filter.monthYear);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: ApiBuildingRentExpense[] }>(
        `finance/building-rent-expenses${query}`,
      );
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getBuildingRentExpenses fallback:', err);
    }
    return stored;
  },

  async settleBuildingRentExpense(id: string, data: { paymentMethod?: string; notes?: string }): Promise<ApiBuildingRentExpense> {
    const expenses = await this.getBuildingRentExpenses();
    let result: ApiBuildingRentExpense | undefined;
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiBuildingRentExpense }>(
        `finance/building-rent-expenses/${id}/settle`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) result = res.data;
    } catch (err) {
      console.warn('financeApiService.settleBuildingRentExpense error:', err);
    }

    if (!result) {
      const updated = expenses.map((e) =>
        e.id === id ? { ...e, status: 'PAID' as const, paidAt: new Date().toISOString() } : e,
      );
      setLocalState(STORAGE_KEYS.FINANCE_RENT_EXPENSES, updated);
      result = updated.find((e) => e.id === id)!;
    }

    mandateAuditTrailService.recordAction({
      associationId: 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'RESIDENCES',
      actionType: 'LANDLORD_RENT_SETTLED',
      actionTitle: `Paiement Loyer Bailleur (${(result?.amount || 0).toLocaleString('fr-FR')} FCFA)`,
      resourceType: 'BUILDING_RENT_EXPENSE',
      resourceId: id,
      amountXOF: result?.amount,
      details: data.notes || `Règlement du loyer bailleur échéance ${result?.monthYear || ''}`,
    }).catch(() => {});

    return result;
  },

  // ---------------------------------------------------------------------------
  // 5. FRAIS D’INTÉGRATION DES ÉTUDIANTS (RECETTES)
  // ---------------------------------------------------------------------------
  async getIntegrationFeePlans(associationId?: string): Promise<ApiIntegrationFeePlan[]> {
    const stored = getLocalState<ApiIntegrationFeePlan[]>(STORAGE_KEYS.FINANCE_FEE_PLANS, []);
    try {
      const query = associationId ? `?associationId=${encodeURIComponent(associationId)}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: ApiIntegrationFeePlan[] }>(
        `finance/integration-fee-plans${query}`,
      );
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getIntegrationFeePlans fallback:', err);
    }
    return stored;
  },

  async createIntegrationFeePlan(data: {
    associationId: string;
    academicYear: string;
    name: string;
    amount: number;
    installmentsAllowed?: number;
  }): Promise<ApiIntegrationFeePlan> {
    const plans = await this.getIntegrationFeePlans();
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiIntegrationFeePlan }>(
        'finance/integration-fee-plans',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) {
        setLocalState(STORAGE_KEYS.FINANCE_FEE_PLANS, [res.data, ...plans]);
        return res.data;
      }
    } catch (err) {
      console.warn('financeApiService.createIntegrationFeePlan error:', err);
    }

    const localPlan: ApiIntegrationFeePlan = {
      id: generateUuid(),
      associationId: data.associationId,
      academicYear: data.academicYear,
      name: data.name,
      amount: data.amount,
      currency: 'XOF',
      installmentsAllowed: data.installmentsAllowed || 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalState(STORAGE_KEYS.FINANCE_FEE_PLANS, [localPlan, ...plans]);
    return localPlan;
  },

  async getIntegrationFeeDues(filter?: { userId?: string; status?: string }): Promise<ApiIntegrationFeeDue[]> {
    const stored = getLocalState<ApiIntegrationFeeDue[]>(STORAGE_KEYS.FINANCE_FEE_DUES, []);
    try {
      const params = new URLSearchParams();
      if (filter?.userId) params.append('userId', filter.userId);
      if (filter?.status) params.append('status', filter.status);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: ApiIntegrationFeeDue[] }>(
        `finance/integration-fee-dues${query}`,
      );
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getIntegrationFeeDues fallback:', err);
    }
    return stored;
  },

  async getIntegrationFeeDebtors(associationId?: string): Promise<any[]> {
    try {
      const query = associationId ? `?associationId=${encodeURIComponent(associationId)}` : '';
      const res = await apiClient.fetch<{ success: boolean; data: any[] }>(
        `finance/integration-fee-debtors${query}`,
      );
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getIntegrationFeeDebtors fallback:', err);
    }
    return [];
  },

  async payIntegrationFee(dueId: string, data: { amount: number; paymentMethod: string }): Promise<any> {
    let result: any;
    try {
      const res = await apiClient.fetch<{ success: boolean; data: any }>(
        `finance/integration-fee-dues/${dueId}/pay`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      if (res && res.data) result = res.data;
    } catch (err) {
      console.warn('financeApiService.payIntegrationFee error:', err);
    }

    mandateAuditTrailService.recordAction({
      associationId: 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'MEMBERSHIPS',
      actionType: 'INTEGRATION_FEE_COLLECTED',
      actionTitle: `Encaissement Frais d'Intégration Étudiante (${(data.amount || 0).toLocaleString('fr-FR')} FCFA)`,
      resourceType: 'INTEGRATION_FEE_DUE',
      resourceId: dueId,
      amountXOF: data.amount,
      details: `Paiement reçu via ${data.paymentMethod}. Quittance générée sous le mandat actif.`,
    }).catch(() => {});

    return result || { success: true, dueId, amount: data.amount };
  },

  // ---------------------------------------------------------------------------
  // 6. DONS & PHILANTHROPIE
  // ---------------------------------------------------------------------------
  async getDonations(filter?: {
    associationId?: string;
    campaignName?: string;
    paymentMethod?: string;
  }): Promise<ApiDonation[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.associationId) params.append('associationId', filter.associationId);
      if (filter?.campaignName) params.append('campaignName', filter.campaignName);
      if (filter?.paymentMethod) params.append('paymentMethod', filter.paymentMethod);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiClient.fetch<{ success: boolean; data: ApiDonation[] }>(`finance/donations${query}`);
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getDonations fallback:', err);
    }
    return [];
  },

  async recordDonation(payload: RecordDonationPayload): Promise<ApiDonation> {
    let result: ApiDonation | undefined;
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiDonation }>('finance/donations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.data) result = res.data;
    } catch (err) {
      console.warn('financeApiService.recordDonation error:', err);
    }

    if (!result) {
      result = {
        id: generateUuid(),
        associationId: payload.associationId,
        donorName: payload.donorName || 'Donateur Citoyen',
        donorEmail: payload.donorEmail,
        donorPhone: payload.donorPhone,
        amount: payload.amount,
        currency: 'XOF',
        campaignName: payload.campaignName,
        paymentMethod: payload.paymentMethod || 'MOBILE_MONEY',
        reference: `DON-${Date.now()}`,
        notes: payload.notes,
        receivedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const stored = getLocalState<ApiDonation[]>('mc_dyn_finance_donations', []);
      setLocalState('mc_dyn_finance_donations', [result, ...stored]);
    }

    mandateAuditTrailService.recordAction({
      associationId: payload.associationId || 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'FINANCE',
      actionType: 'DONATION_RECEIVED',
      actionTitle: `Don / Philanthropie Encaissé : ${(payload.amount || 0).toLocaleString('fr-FR')} FCFA (${payload.donorName || 'Donateur'})`,
      resourceType: 'DONATION',
      resourceId: result.id,
      amountXOF: payload.amount,
      details: `Campagne : ${payload.campaignName || 'Soutien Général'} • Réf : ${result.reference || 'N/A'}`,
    }).catch(() => {});

    return result;
  },

  // ---------------------------------------------------------------------------
  // 7. DÉPENSES & DÉCAISSEMENTS
  // ---------------------------------------------------------------------------
  async getExpenses(filter?: {
    associationId?: string;
    category?: string;
    status?: string;
  }): Promise<ApiExpense[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.associationId) params.append('associationId', filter.associationId);
      if (filter?.category) params.append('category', filter.category);
      if (filter?.status) params.append('status', filter.status);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiClient.fetch<{ success: boolean; data: ApiExpense[] }>(`finance/expenses${query}`);
      if (res && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('financeApiService.getExpenses fallback:', err);
    }
    return [];
  },

  async recordExpense(payload: RecordExpensePayload): Promise<ApiExpense> {
    let result: ApiExpense | undefined;
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiExpense }>('finance/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.data) result = res.data;
    } catch (err) {
      console.warn('financeApiService.recordExpense error:', err);
    }

    if (!result) {
      result = {
        id: generateUuid(),
        associationId: payload.associationId,
        category: payload.category,
        title: payload.title,
        amount: payload.amount,
        currency: 'XOF',
        beneficiary: payload.beneficiary || 'Bénéficiaire',
        paymentMethod: payload.paymentMethod || 'CASH',
        receiptRef: payload.receiptRef,
        notes: payload.notes,
        status: 'PENDING_APPROVAL',
        expenseDate: new Date().toISOString(),
        recordedById: 'usr-tres-01',
        createdAt: new Date().toISOString(),
      };
      const stored = getLocalState<ApiExpense[]>('mc_dyn_finance_expenses', []);
      setLocalState('mc_dyn_finance_expenses', [result, ...stored]);
    }

    mandateAuditTrailService.recordAction({
      associationId: payload.associationId || 'ALL',
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-tres-01',
      actorName: 'Trésorier(ère) Général(e)',
      actorRole: 'Bureau Exécutif',
      category: 'FINANCE',
      actionType: 'EXPENSE_RECORDED',
      actionTitle: `Note de Frais Engagée : ${payload.title} (${(payload.amount || 0).toLocaleString('fr-FR')} FCFA)`,
      resourceType: 'EXPENSE',
      resourceId: result.id,
      amountXOF: payload.amount,
      details: `Catégorie : ${payload.category} • Bénéficiaire : ${payload.beneficiary || 'N/A'} • Motif : ${payload.notes || 'Non renseigné'}`,
    }).catch(() => {});

    return result;
  },

  async approveExpense(expenseId: string): Promise<ApiExpense> {
    let result: ApiExpense | undefined;
    try {
      const res = await apiClient.fetch<{ success: boolean; data: ApiExpense }>(`finance/expenses/${expenseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res && res.data) result = res.data;
    } catch (err) {
      console.warn('financeApiService.approveExpense error:', err);
    }

    if (!result) {
      const stored = getLocalState<ApiExpense[]>('mc_dyn_finance_expenses', []);
      const updated = stored.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: 'APPROVED' as const,
              approvedByUserId: 'usr-pres-01',
              approvedAt: new Date().toISOString(),
            }
          : e,
      );
      setLocalState('mc_dyn_finance_expenses', updated);
      result = updated.find((e) => e.id === expenseId);
    }

    if (result) {
      mandateAuditTrailService.recordAction({
        associationId: result.associationId || 'ALL',
        mandatePeriod: 'Mandat 2026-2028 (Actuel)',
        mandateContractNumber: 'MANDAT-2026-001',
        actorId: 'usr-pres-01',
        actorName: 'Président(e) du Bureau',
        actorRole: 'Présidence',
        category: 'FINANCE',
        actionType: 'EXPENSE_APPROVED',
        actionTitle: `Visa d'Approbation Dépense : ${result.title} (${(result.amount || 0).toLocaleString('fr-FR')} FCFA)`,
        resourceType: 'EXPENSE',
        resourceId: expenseId,
        amountXOF: result.amount,
        details: `Visa présidentiel apposé pour la dépense ordonnée au profit de ${result.beneficiary || 'bénéficiaire'}`,
      }).catch(() => {});
    }

    return result!;
  },
};

