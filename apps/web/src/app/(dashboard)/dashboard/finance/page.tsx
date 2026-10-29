"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { BanknoteIcon, PlusIcon, ArrowUpIcon, SearchIcon, CheckIcon } from "@/components/icons";
import {
  X,
  RefreshCw,
  AlertTriangle,
  Building2,
  UserCheck,
  ShieldCheck,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  Heart,
  CreditCard,
  Printer,
  PieChart,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveAssociation } from "@/context/AssociationContext";
import { apiService, ApiAssociation } from "@/lib/api";
import {
  financeApiService,
  ApiFinancialTransaction,
  ApiBuildingLease,
  ApiBuildingRentExpense,
  ApiIntegrationFeePlan,
  ApiIntegrationFeeDue,
  ApiDonation,
  ApiExpense,
  ApiCotisation,
  ApiFinanceStats,
} from "@/features/finance";

type FinanceTab = "overview" | "donations" | "expenses" | "cotisations" | "integration" | "ledger" | "leases";

function FinancePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FinanceTab | null;

  const [activeTab, setActiveTab] = useState<FinanceTab>(() => {
    if (tabParam && ["overview", "donations", "expenses", "cotisations", "integration", "ledger", "leases"].includes(tabParam)) {
      return tabParam;
    }
    return "overview";
  });

  // Synchronisation dynamique si l'URL change (ex: clic dans le sidebar sur un sous-menu précis)
  useEffect(() => {
    if (tabParam && ["overview", "donations", "expenses", "cotisations", "integration", "ledger", "leases"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const { activeAssociationId, activeAssociation } = useActiveAssociation();

  // Données principales
  const [stats, setStats] = useState<ApiFinanceStats | null>(null);
  const [transactions, setTransactions] = useState<ApiFinancialTransaction[]>([]);
  const [donations, setDonations] = useState<ApiDonation[]>([]);
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [cotisations, setCotisations] = useState<ApiCotisation[]>([]);
  const [leases, setLeases] = useState<ApiBuildingLease[]>([]);
  const [rentExpenses, setRentExpenses] = useState<ApiBuildingRentExpense[]>([]);
  const [feePlans, setFeePlans] = useState<ApiIntegrationFeePlan[]>([]);
  const [feeDues, setFeeDues] = useState<ApiIntegrationFeeDue[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);

  // Recherche & État de chargement
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals d'actions
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isFeePaymentModalOpen, setIsFeePaymentModalOpen] = useState(false);
  const [isSettleRentModalOpen, setIsSettleRentModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCotisationModalOpen, setIsCotisationModalOpen] = useState(false);

  // Modals de visualisation & impression de reçus officiels
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<ApiDonation | null>(null);
  const [selectedResidentForReceipt, setSelectedResidentForReceipt] = useState<any | null>(null);

  // Éléments sélectionnés pour formulaires
  const [selectedTxForAdj, setSelectedTxForAdj] = useState<ApiFinancialTransaction | null>(null);
  const [selectedDueForPay, setSelectedDueForPay] = useState<ApiIntegrationFeeDue | null>(null);
  const [selectedExpenseForSettle, setSelectedExpenseForSettle] = useState<ApiBuildingRentExpense | null>(null);

  // Formulaires
  const [txForm, setTxForm] = useState({
    associationId: "",
    amount: "10000",
    type: "INCOME" as "INCOME" | "EXPENSE",
    category: "COTISATION",
    paymentMethod: "MTN Mobile Money Bénin (*880#)",
    description: "",
    reference: "",
  });

  const [donationForm, setDonationForm] = useState({
    associationId: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "50000",
    campaignName: "Rentrée Solidaire 2026",
    paymentMethod: "MTN Mobile Money Bénin (*880#)",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    associationId: "",
    title: "",
    category: "EQUIPEMENT",
    amount: "25000",
    beneficiary: "",
    paymentMethod: "MTN Mobile Money Bénin (*880#)",
    status: "PAID",
    receiptRef: "",
    notes: "",
  });

  const [cotisationForm, setCotisationForm] = useState({
    associationId: "",
    citizenName: "",
    phone: "",
    period: "2026-10",
    amount: "1000",
    paymentMethod: "MTN Mobile Money Bénin (*880#)",
    notes: "",
  });

  const [adjForm, setAdjForm] = useState({
    amount: "5000",
    reason: "",
  });

  const [feePayForm, setFeePayForm] = useState({
    amount: "15000",
    paymentMethod: "MTN Mobile Money Bénin (*880#)",
  });

  const [rentSettleForm, setRentSettleForm] = useState({
    paymentMethod: "Virement Bancaire (UBA / BOA)",
    notes: "",
  });

  // Notifications toast & erreurs de formulaire
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadAllFinanceData = async () => {
    setIsLoading(true);
    try {
      const aList = await apiService.associations.list();
      setAssociations(aList);

      const targetAssocId = activeAssociationId && activeAssociationId !== "ALL" ? activeAssociationId : undefined;

      const [
        statsData,
        txsData,
        donationsData,
        expensesData,
        cotisationsData,
        leasesData,
        rentExpData,
        plansData,
        duesData,
        debtorsData,
      ] = await Promise.all([
        financeApiService.getStats(targetAssocId),
        financeApiService.getTransactions(targetAssocId ? { associationId: targetAssocId } : undefined),
        financeApiService.getDonations(targetAssocId ? { associationId: targetAssocId } : undefined),
        financeApiService.getExpenses(targetAssocId ? { associationId: targetAssocId } : undefined),
        financeApiService.getCotisations(targetAssocId ? { associationId: targetAssocId } : undefined),
        financeApiService.getBuildingLeases(targetAssocId),
        financeApiService.getBuildingRentExpenses(),
        financeApiService.getIntegrationFeePlans(targetAssocId),
        financeApiService.getIntegrationFeeDues(),
        financeApiService.getIntegrationFeeDebtors(targetAssocId),
      ]);

      setStats(statsData);
      setTransactions(txsData);
      setDonations(donationsData);
      setExpenses(expensesData);
      setCotisations(cotisationsData);
      setLeases(leasesData);
      setRentExpenses(rentExpData);
      setFeePlans(plansData);
      setFeeDues(duesData);
      setDebtors(debtorsData);

      const defaultAssoc = targetAssocId || aList[0]?.id || "";
      if (defaultAssoc) {
        setTxForm((prev) => ({ ...prev, associationId: defaultAssoc }));
        setDonationForm((prev) => ({ ...prev, associationId: defaultAssoc }));
        setExpenseForm((prev) => ({ ...prev, associationId: defaultAssoc }));
        setCotisationForm((prev) => ({ ...prev, associationId: defaultAssoc }));
      }
    } catch (err) {
      console.error("Erreur chargement données finance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllFinanceData();
  }, [activeAssociationId]);

  // Actions
  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const amt = Number(donationForm.amount) || 10000;
      const created = await financeApiService.recordDonation({
        associationId: donationForm.associationId,
        donorName: donationForm.donorName || "Donateur Bienfaiteur",
        donorEmail: donationForm.donorEmail,
        donorPhone: donationForm.donorPhone,
        amount: amt,
        campaignName: donationForm.campaignName,
        paymentMethod: donationForm.paymentMethod,
        notes: donationForm.notes,
      });

      setDonations((prev) => [created, ...prev]);
      setIsDonationModalOpen(false);
      showToast(`Don de ${amt.toLocaleString("fr-FR")} FCFA enregistré ! Réf: ${created.reference}`);
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement du don.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const amt = Number(expenseForm.amount) || 5000;
      const created = await financeApiService.recordExpense({
        associationId: expenseForm.associationId,
        title: expenseForm.title,
        category: expenseForm.category,
        amount: amt,
        beneficiary: expenseForm.beneficiary,
        paymentMethod: expenseForm.paymentMethod,
        status: expenseForm.status,
        receiptRef: expenseForm.receiptRef,
        notes: expenseForm.notes,
      });

      setExpenses((prev) => [created, ...prev]);
      setIsExpenseModalOpen(false);
      showToast(`Dépense "${created.title}" enregistrée (${created.status === "PAID" ? "Décaissée" : "En attente"}) !`);
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la dépense.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handleApproveExpense = async (expId: string) => {
    try {
      const approved = await financeApiService.approveExpense(expId);
      setExpenses((prev) => prev.map((e) => (e.id === expId ? approved : e)));
      showToast(`Dépense "${approved.title}" validée et décaissée au grand livre !`);
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'approbation de la dépense.";
      showToast(msg);
    }
  };

  const handleRecordCotisation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const amt = Number(cotisationForm.amount) || 1000;
      const created = await financeApiService.recordCotisation({
        associationId: cotisationForm.associationId,
        memberId: "adh-" + Date.now(),
        citizenName: cotisationForm.citizenName || "Adhérent Actif",
        phone: cotisationForm.phone,
        amount: amt,
        period: cotisationForm.period,
        paymentMethod: cotisationForm.paymentMethod,
        notes: cotisationForm.notes,
      });

      setCotisations((prev) => [created, ...prev]);
      setIsCotisationModalOpen(false);
      showToast(`Cotisation de ${amt.toLocaleString("fr-FR")} FCFA (${cotisationForm.period}) enregistrée !`);
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la cotisation.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const created = await financeApiService.createTransaction({
        associationId: txForm.associationId,
        amount: Number(txForm.amount) || 10000,
        type: txForm.type,
        category: txForm.category,
        paymentMethod: txForm.paymentMethod,
        reference: txForm.reference || `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        description: txForm.description || "Opération de caisse",
      });

      setTransactions((prev) => [created, ...prev]);
      setIsTxModalOpen(false);
      showToast("Transaction enregistrée dans le Grand Livre avec succès !");
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement de l'écriture comptable.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedTxForAdj) return;
    try {
      const adj = await financeApiService.createAdjustment(selectedTxForAdj.id, {
        adjustmentAmount: Number(adjForm.amount) || 1000,
        reason: adjForm.reason,
      });
      setTransactions((prev) => [adj, ...prev]);
      setIsAdjustmentModalOpen(false);
      setSelectedTxForAdj(null);
      setAdjForm({ amount: "5000", reason: "" });
      showToast("Écriture d'ajustement compensatoire (ADR-006) enregistrée !");
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'ajustement compensatoire.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedDueForPay) return;
    try {
      const result = await financeApiService.payIntegrationFee(selectedDueForPay.id, {
        amount: Number(feePayForm.amount) || 10000,
        paymentMethod: feePayForm.paymentMethod,
      });
      setIsFeePaymentModalOpen(false);
      setSelectedDueForPay(null);
      showToast(
        `Versement validé ! Reçu officiel ${result.receiptReference} émis. Reste dû : ${result.remainingAmount.toLocaleString("fr-FR")} FCFA`,
      );
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'encaissement des frais d'intégration.";
      setActionError(msg);
      showToast(msg);
    }
  };

  const handleSettleRent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedExpenseForSettle) return;
    try {
      await financeApiService.settleBuildingRentExpense(selectedExpenseForSettle.id, {
        paymentMethod: rentSettleForm.paymentMethod,
        notes: rentSettleForm.notes,
      });
      setIsSettleRentModalOpen(false);
      setSelectedExpenseForSettle(null);
      showToast("Loyer bailleur décaissé et imputé aux dépenses associatives !");
      loadAllFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du décaissement du loyer bailleur.";
      setActionError(msg);
      showToast(msg);
    }
  };

  // Filtrages
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const q = searchTerm.toLowerCase();
      return (
        d.donorName.toLowerCase().includes(q) ||
        (d.campaignName?.toLowerCase().includes(q) ?? false) ||
        d.reference.toLowerCase().includes(q)
      );
    });
  }, [donations, searchTerm]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchTerm.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.beneficiary.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [expenses, searchTerm]);

  const filteredCotisations = useMemo(() => {
    return cotisations.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        (c.citizenName?.toLowerCase().includes(q) ?? false) ||
        c.period.toLowerCase().includes(q) ||
        c.reference.toLowerCase().includes(q)
      );
    });
  }, [cotisations, searchTerm]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchTerm.toLowerCase();
      return (
        (tx.reference?.toLowerCase().includes(q) ?? false) ||
        (tx.description?.toLowerCase().includes(q) ?? false) ||
        (tx.category?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [transactions, searchTerm]);

  const filteredFeeDues = useMemo(() => {
    return feeDues.filter((due) => {
      const q = searchTerm.toLowerCase();
      return (
        (due.userName?.toLowerCase().includes(q) ?? false) ||
        (due.roomNumber?.toLowerCase().includes(q) ?? false) ||
        (due.buildingName?.toLowerCase().includes(q) ?? false) ||
        (due.quarterName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [feeDues, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-emerald-600 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckIcon className="size-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Trésorerie &amp; Finances Associatives
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Devise XOF (FCFA)
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="size-3" />
              Certifié ADR-006 (Immuable)
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Gestion consolidée : Dons philanthropiques, Dépenses &amp; Décaissements, Cotisations, et Frais d&apos;Intégration des Résidents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indicateur de communauté active synchronisé avec la barre latérale */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white/90 px-3 py-1.5 shadow-2xs dark:border-gray-800 dark:bg-gray-900/90">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold text-[10px] dark:bg-brand-950 dark:text-brand-300">
              {activeAssociation?.acronym || (activeAssociationId === "ALL" ? "ALL" : "MC")}
            </div>
            <div className="text-left">
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Filtré par
              </span>
              <p className="max-w-[170px] truncate text-xs font-bold text-gray-900 dark:text-white">
                {activeAssociation ? activeAssociation.name : "Toutes les associations"}
              </p>
            </div>
          </div>

          {/* Boutons d'actions rapides */}
          <button
            type="button"
            onClick={() => setIsDonationModalOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-pink-700"
          >
            <Heart className="size-4" />
            <span>Nouveau Don</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700"
          >
            <ArrowDownRight className="size-4" />
            <span>Engager Dépense</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Consolidées */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Solde Net Disponible */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Solde Net de Trésorerie
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BanknoteIcon className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {isLoading ? "..." : `${(stats?.netBalanceXOF ?? 750000).toLocaleString("fr-FR")} FCFA`}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpIcon className="size-3" />
            <span>Fonds disponibles en caisse &amp; banques</span>
          </p>
        </div>

        {/* 2. Recettes Totales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Recettes Globales (INCOME)
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-brand-600 dark:text-brand-400">
            {isLoading ? "..." : `${(stats?.totalIncomeXOF ?? 1450000).toLocaleString("fr-FR")} FCFA`}
          </h3>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Dons + Cotisations + Intégration
          </p>
        </div>

        {/* 3. Dépenses Totales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Dépenses Décaissées (EXPENSE)
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ArrowDownRight className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : `${(stats?.totalExpenseXOF ?? 700000).toLocaleString("fr-FR")} FCFA`}
          </h3>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Loyers bailleurs, logistique, événements
          </p>
        </div>

        {/* 4. Créances Intégration à Recouvrer */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Créances Résidents en Attente
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {isLoading ? "..." : `${(stats?.pendingIntegrationDuesXOF ?? 120000).toLocaleString("fr-FR")} FCFA`}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            {debtors.length} résidents avec reste à régler
          </p>
        </div>
      </div>

      {/* Onglets de Navigation Fluides & Adaptatifs */}
      <div className="flex overflow-x-auto border-b border-gray-200 pb-px dark:border-gray-800 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "overview"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <PieChart className="size-4" />
          <span>Statistiques &amp; Ratios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "donations"
              ? "border-pink-600 text-pink-600 dark:border-pink-400 dark:text-pink-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Heart className="size-4" />
          <span>Dons &amp; Mécénat ({donations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "expenses"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <ArrowDownRight className="size-4" />
          <span>Dépenses &amp; Décaissements ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cotisations")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "cotisations"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <CreditCard className="size-4" />
          <span>Cotisations Membres ({cotisations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integration")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "integration"
              ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <UserCheck className="size-4" />
          <span>Finances Résidents (Intégration) ({feeDues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "ledger"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <BanknoteIcon className="size-4" />
          <span>Grand Livre Général ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leases")}
          className={`flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
            activeTab === "leases"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Building2 className="size-4" />
          <span>Baux Bailleurs ({leases.length})</span>
        </button>
      </div>

      {/* =========================================================================
          ONGLET 1 : STATISTIQUES FINANCIÈRES & RATIOS CONSOLIDÉS
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Ventilation des Recettes par Source */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Ventilation des Recettes Associatives
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {((stats?.totalIncomeXOF || 1450000)).toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* 1. Droits & Frais d'Intégration */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Frais d&apos;Intégration Résidence</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {(stats?.totalIntegrationFeesXOF ?? 650000).toLocaleString("fr-FR")} FCFA (45%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>

                {/* 2. Cotisations Adhérents */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Cotisations des Membres</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {(stats?.totalCotisationsXOF ?? 450000).toLocaleString("fr-FR")} FCFA (31%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: "31%" }} />
                  </div>
                </div>

                {/* 3. Dons & Philanthropie */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Dons, Mécénat &amp; Quêtes</span>
                    <span className="text-pink-600 dark:text-pink-400">
                      {(stats?.totalDonationsXOF ?? 350000).toLocaleString("fr-FR")} FCFA (24%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Dépenses par Catégorie */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="size-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Ventilation des Dépenses &amp; Charges
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {((stats?.totalExpenseXOF || 700000)).toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* 1. Loyer Bailleur */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Loyers aux Bailleurs Propriétaires</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {(stats?.totalLandlordRentsXOF ?? 350000).toLocaleString("fr-FR")} FCFA (50%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>

                {/* 2. Logistique & Maintenance */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Logistique &amp; Entretien Résidences</span>
                    <span className="text-blue-600 dark:text-blue-400">180 000 FCFA (26%)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "26%" }} />
                  </div>
                </div>

                {/* 3. Événements & Assemblées */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Événements, Assemblées &amp; Accueil</span>
                    <span className="text-purple-600 dark:text-purple-400">120 000 FCFA (17%)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "17%" }} />
                  </div>
                </div>

                {/* 4. Équipement & Bureau */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">Équipement &amp; Fournitures Bureau</span>
                    <span className="text-orange-600 dark:text-orange-400">50 000 FCFA (7%)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "7%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Évolution Mensuelle sur 6 mois */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Évolution Mensuelle des Flux de Trésorerie
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comparaison des entrées (recettes) et sorties (dépenses décaissées)
                </p>
              </div>
              <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                Semestre 2026
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(stats?.monthlyBreakdown || [
                { month: "2026-05", income: 280000, expense: 120000 },
                { month: "2026-06", income: 320000, expense: 150000 },
                { month: "2026-07", income: 290000, expense: 110000 },
                { month: "2026-08", income: 250000, expense: 90000 },
                { month: "2026-09", income: 410000, expense: 230000 },
                { month: "2026-10", income: 450000, expense: 180000 },
              ]).map((m) => (
                <div key={m.month} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40 text-center">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{m.month}</p>
                  <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    +{m.income.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    -{m.expense.toLocaleString("fr-FR")}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    Net: {(m.income - m.expense).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ONGLET 2 : GESTION TOTALE DES DONS
         ========================================================================= */}
      {activeTab === "donations" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Dons, Mécénat &amp; Philanthropie
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Suivi transparent des fonds caritatifs collectés, émissions de reçus officiels pour défiscalisation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon className="size-3.5" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Donateur, campagne..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsDonationModalOpen(true)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-pink-700"
              >
                <PlusIcon className="size-4" />
                <span>Enregistrer un Don</span>
              </button>
            </div>
          </div>

          {filteredDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Réf / Reçu</th>
                    <th className="px-5 py-3">Donateur</th>
                    <th className="px-5 py-3">Campagne / Objet</th>
                    <th className="px-5 py-3">Règlement</th>
                    <th className="px-5 py-3 text-right">Montant (FCFA)</th>
                    <th className="px-5 py-3 text-center">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                          {d.reference}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 dark:text-white">{d.donorName}</p>
                        <p className="text-[10px] text-gray-400">{d.donorPhone || d.donorEmail || "Anonyme"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700 dark:bg-pink-950/60 dark:text-pink-400">
                          <Sparkles className="size-3" />
                          {d.campaignName || "Fonds Général"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {d.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +{d.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-center text-gray-400 text-[11px]">
                        {new Date(d.receivedAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDonationForReceipt(d)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <Printer className="size-3" />
                          <span>Reçu Officiel</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Heart}
                title={searchTerm ? "Aucun don ne correspond à votre recherche" : "Aucun don enregistré"}
                description={
                  searchTerm
                    ? `Aucun donateur ou référence ne correspond au filtre "${searchTerm}".`
                    : `Les contributions spontanées et mécénats pour ${activeAssociation?.name || "cette structure"} s'afficheront ici.`
                }
                action={
                  !searchTerm
                    ? {
                        label: "Enregistrer un premier don",
                        onClick: () => setIsDonationModalOpen(true),
                        icon: PlusIcon,
                      }
                    : undefined
                }
                secondaryAction={
                  searchTerm
                    ? {
                        label: "Effacer la recherche",
                        onClick: () => setSearchTerm(""),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ONGLET 3 : GESTION TOTALE DES DÉPENSES
         ========================================================================= */}
      {activeTab === "expenses" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Dépenses, Achats &amp; Décaissements
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Engagements de dépenses, validations hiérarchiques et imputation instantanée au Grand Livre.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon className="size-3.5" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Intitulé, prestataire..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
              >
                <PlusIcon className="size-4" />
                <span>Engager Dépense</span>
              </button>
            </div>
          </div>

          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Intitulé / Justificatif</th>
                    <th className="px-5 py-3">Catégorie</th>
                    <th className="px-5 py-3">Bénéficiaire</th>
                    <th className="px-5 py-3">Règlement</th>
                    <th className="px-5 py-3 text-right">Montant (FCFA)</th>
                    <th className="px-5 py-3 text-center">Statut</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 dark:text-white">{e.title}</p>
                        <p className="font-mono text-[10px] text-gray-400">Réf: {e.receiptRef || "SANS-PIÈCE"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-800 dark:text-gray-200 font-medium">
                        {e.beneficiary}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-[11px]">
                        {e.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-rose-600 dark:text-rose-400">
                        -{e.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {e.status === "PAID" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            PAYÉ
                          </span>
                        )}
                        {e.status === "PENDING_APPROVAL" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <Clock className="size-3" />
                            EN ATTENTE
                          </span>
                        )}
                        {e.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <X className="size-3" />
                            REJETÉ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {e.status === "PENDING_APPROVAL" && (
                          <button
                            type="button"
                            onClick={() => handleApproveExpense(e.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <CheckIcon className="size-3" />
                            <span>Approuver &amp; Décaisser</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={CreditCard}
                title={searchTerm ? "Aucune dépense ne correspond à votre recherche" : "Aucune dépense enregistrée"}
                description={
                  searchTerm
                    ? `Aucune facture ou bénéficiaire trouvé pour "${searchTerm}".`
                    : `Engagez et suivez les décaissements, factures de fonctionnement et prestations pour ${activeAssociation?.name || "cette structure"}.`
                }
                action={
                  !searchTerm
                    ? {
                        label: "Engager une dépense",
                        onClick: () => setIsExpenseModalOpen(true),
                        icon: PlusIcon,
                      }
                    : undefined
                }
                secondaryAction={
                  searchTerm
                    ? {
                        label: "Effacer la recherche",
                        onClick: () => setSearchTerm(""),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ONGLET 4 : GESTION TOTALE DES COTISATIONS
         ========================================================================= */}
      {activeTab === "cotisations" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Cotisations des Membres Adhérents
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Encaissements périodiques, adhésions et régularité des cotisations associatives.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon className="size-3.5" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom de membre, période..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCotisationModalOpen(true)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700"
              >
                <PlusIcon className="size-4" />
                <span>Encaisser Cotisation</span>
              </button>
            </div>
          </div>

          {filteredCotisations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Réf / Reçu</th>
                    <th className="px-5 py-3">Adhérent</th>
                    <th className="px-5 py-3">Période</th>
                    <th className="px-5 py-3">Canal</th>
                    <th className="px-5 py-3 text-right">Montant (FCFA)</th>
                    <th className="px-5 py-3 text-center">Statut</th>
                    <th className="px-5 py-3 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCotisations.map((c) => (
                    <tr key={c.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {c.reference}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 dark:text-white">{c.citizenName || "Adhérent"}</p>
                        <p className="text-[10px] text-gray-400">{c.phone || "+229 --"}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                        {c.period}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                        {c.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +{c.amountXOF.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          ENCAISSÉ
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-gray-400 text-[11px]">
                        {new Date(c.paidAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title={searchTerm ? "Aucune cotisation ne correspond à votre recherche" : "Aucune cotisation enregistrée"}
                description={
                  searchTerm
                    ? `Aucun adhérent ne correspond au critère "${searchTerm}".`
                    : `Les cotisations périodiques versées par les membres de ${activeAssociation?.name || "cette structure"} apparaîtront ici.`
                }
                action={
                  !searchTerm
                    ? {
                        label: "Encaisser une cotisation",
                        onClick: () => setIsCotisationModalOpen(true),
                        icon: PlusIcon,
                      }
                    : undefined
                }
                secondaryAction={
                  searchTerm
                    ? {
                        label: "Effacer la recherche",
                        onClick: () => setSearchTerm(""),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ONGLET 5 : FINANCES DES RÉSIDENTS (INTÉGRATION)
         ========================================================================= */}
      {activeTab === "integration" && (
        <div className="space-y-6">
          {/* Barèmes en vigueur */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Barèmes Officiels des Frais d&apos;Intégration
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Montants forfaitaires dus par chaque étudiant résidant selon l&apos;année universitaire.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Forfait Standard : 35 000 FCFA (2 tranches max)
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feePlans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Année {plan.academicYear}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white mt-1">{plan.name}</h4>
                  <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">
                    {plan.amount.toLocaleString("fr-FR")} FCFA
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Tranches autorisées : {plan.installmentsAllowed} versements
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Suivi des Contrats & Créances Résidents */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Situation Financière des Résidents Entrants
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Suivi par chambre, relance des débiteurs et délivrance de quittance certifiée.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon className="size-3.5" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Étudiant, chambre, quartier..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {filteredFeeDues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3">Résident Entrant</th>
                      <th className="px-5 py-3">Logement / Chambre</th>
                      <th className="px-5 py-3 text-right">Total Dû</th>
                      <th className="px-5 py-3 text-right">Déjà Réglé</th>
                      <th className="px-5 py-3 text-right">Reste à Payer</th>
                      <th className="px-5 py-3 text-center">Statut</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredFeeDues.map((due) => (
                      <tr key={due.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-gray-900 dark:text-white">{due.userName || "Étudiant Résident"}</p>
                          <p className="text-[10px] text-gray-400">{due.userPhone || "+229 97 00 11 22"}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{due.roomNumber || "Ch. 104"}</p>
                          <p className="text-[10px] text-gray-400">{due.buildingName || "Pavillon Ouest"}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                          {due.totalAmount.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {due.paidAmount.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-rose-600 dark:text-rose-400">
                          {due.remainingAmount.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {due.status === "SETTLED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              SOLDÉ
                            </span>
                          )}
                          {due.status === "PARTIAL" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                              <Clock className="size-3" />
                              PARTIEL
                            </span>
                          )}
                          {due.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                              <AlertTriangle className="size-3" />
                              IMPAYÉ
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {due.status !== "SETTLED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDueForPay(due);
                                setFeePayForm({ amount: String(due.remainingAmount), paymentMethod: "MTN Mobile Money Bénin (*880#)" });
                                setIsFeePaymentModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-brand-700"
                            >
                              <CreditCard className="size-3" />
                              <span>Encaisser</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedResidentForReceipt(due)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <Printer className="size-3" />
                            <span>Quittance</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={CheckCircle2}
                  title={searchTerm ? "Aucun résident trouvé pour cette recherche" : "Situation des résidents à jour"}
                  description={
                    searchTerm
                      ? `Aucun résident ne correspond à "${searchTerm}".`
                      : `Aucune créance de frais d'intégration en souffrance pour ${activeAssociation?.name || "cette structure"}.`
                  }
                  secondaryAction={
                    searchTerm
                      ? {
                          label: "Effacer la recherche",
                          onClick: () => setSearchTerm(""),
                        }
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ONGLET 6 : GRAND LIVRE COMPTABLE (ADR-006)
         ========================================================================= */}
      {activeTab === "ledger" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Journal Immuable des Écritures Comptables
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toutes les écritures confirmées (POSTED) sont inaltérables selon la décision ADR-006.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <SearchIcon className="size-3.5" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer par réf, catégorie..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsTxModalOpen(true)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700"
              >
                <PlusIcon className="size-4" />
                <span>Nouvelle Écriture</span>
              </button>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Réf / Horodatage</th>
                    <th className="px-5 py-3">Type Flux</th>
                    <th className="px-5 py-3">Catégorie &amp; Description</th>
                    <th className="px-5 py-3">Mode Règlement</th>
                    <th className="px-5 py-3 text-right">Montant (FCFA)</th>
                    <th className="px-5 py-3 text-center">Statut ADR-006</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {tx.reference}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {tx.type === "INCOME" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <ArrowUpRight className="size-3" />
                            RECETTE
                          </span>
                        )}
                        {tx.type === "EXPENSE" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <ArrowDownRight className="size-3" />
                            DÉPENSE
                          </span>
                        )}
                        {tx.type === "ADJUSTMENT" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <RefreshCw className="size-3" />
                            AJUSTEMENT
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {tx.category || "OPÉRATION"}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {tx.description}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-[11px]">
                        {tx.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-gray-900 dark:text-white">
                        {tx.type === "EXPENSE" ? `-${tx.amount.toLocaleString("fr-FR")}` : `+${tx.amount.toLocaleString("fr-FR")}`} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          POSTED
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {tx.type !== "ADJUSTMENT" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTxForAdj(tx);
                              setAdjForm({ amount: "5000", reason: "" });
                              setIsAdjustmentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <RefreshCw className="size-3" />
                            <span>Ajuster</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title={searchTerm ? "Aucune écriture comptable trouvée" : "Le journal comptable est vierge"}
                description={
                  searchTerm
                    ? `Aucune transaction ne correspond à "${searchTerm}".`
                    : `Toutes les écritures d'encaissement et de décaissement validées pour ${activeAssociation?.name || "cette structure"} sont inscrites ici de façon immuable.`
                }
                action={
                  !searchTerm
                    ? {
                        label: "Nouvelle écriture manuelle",
                        onClick: () => setIsTxModalOpen(true),
                        icon: PlusIcon,
                      }
                    : undefined
                }
                secondaryAction={
                  searchTerm
                    ? {
                        label: "Effacer la recherche",
                        onClick: () => setSearchTerm(""),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ONGLET 7 : BAUX & LOYERS BAILLEURS
         ========================================================================= */}
      {activeTab === "leases" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-5 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Baux de Logements &amp; Engagements envers les Propriétaires
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paiement mensuel des loyers aux bailleurs pour garantir la sécurité d&apos;hébergement des résidents.
              </p>
            </div>

            {leases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3">Bâtiment / Résidence</th>
                      <th className="px-5 py-3">Loyer Mensuel</th>
                      <th className="px-5 py-3">Jour Paiement</th>
                      <th className="px-5 py-3">Période du Bail</th>
                      <th className="px-5 py-3 text-center">Statut Contrat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {leases.map((lease) => (
                      <tr key={lease.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                          {lease.buildingName || "Résidence Universitaire"}
                        </td>
                        <td className="px-5 py-3.5 font-black text-rose-600 dark:text-rose-400">
                          {lease.monthlyRentAmount.toLocaleString("fr-FR")} FCFA / mois
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                          Chaque {lease.paymentDayOfMonth} du mois
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-[11px]">
                          Depuis le {new Date(lease.leaseStartDate).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            ACTIF
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={Building2}
                  title="Aucun contrat de bail bailleur rattaché"
                  description={`Les contrats de bail immobilier conclus avec les propriétaires fonciers pour ${activeAssociation?.name || "cette structure"} apparaîtront ici.`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL D'ENREGISTREMENT DE DON
         ========================================================================= */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-pink-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Enregistrer un Don Philanthropique
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDonationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDonation} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {activeAssociation ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Structure Associative
                    </span>
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                      Active (Sidebar)
                    </span>
                  </div>
                  <p className="mt-0.5 font-bold text-xs text-gray-900 dark:text-white truncate">
                    {activeAssociation.name}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Association Bénéficiaire *
                  </label>
                  <Select2
                    value={donationForm.associationId}
                    onChange={(e) => setDonationForm({ ...donationForm, associationId: e.target.value })}
                    className="mt-1 w-full"
                  >
                    {associations.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select2>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom ou Raison Sociale du Donateur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fondation d'Aide à l'Éducation, Dr. Kodjo..."
                  value={donationForm.donorName}
                  onChange={(e) => setDonationForm({ ...donationForm, donorName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+229 97 00 00 00"
                    value={donationForm.donorPhone}
                    onChange={(e) => setDonationForm({ ...donationForm, donorPhone: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Email du Donateur
                  </label>
                  <input
                    type="email"
                    placeholder="contact@donateur.org"
                    value={donationForm.donorEmail}
                    onChange={(e) => setDonationForm({ ...donationForm, donorEmail: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Montant du Don (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Campagne ou Motif
                  </label>
                  <input
                    type="text"
                    value={donationForm.campaignName}
                    onChange={(e) => setDonationForm({ ...donationForm, campaignName: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Moyen de Règlement *
                </label>
                <Select2
                  value={donationForm.paymentMethod}
                  onChange={(e) => setDonationForm({ ...donationForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full"
                >
                  <option>MTN Mobile Money Bénin (*880#)</option>
                  <option>Moov Money Bénin (*855#)</option>
                  <option>Wave Côte d&apos;Ivoire / Sénégal</option>
                  <option>Espèces (Caisse centrale)</option>
                  <option>Virement Bancaire</option>
                  <option>Chèque</option>
                </Select2>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Notes ou Précisions
                </label>
                <textarea
                  rows={2}
                  placeholder="Affectation spécifique souhaitée par le mécène..."
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
                >
                  Valider le Don &amp; Imputer au Grand Livre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL D'ENREGISTREMENT DE DÉPENSE
         ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="size-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Engager ou Décaisser une Dépense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {activeAssociation ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Structure Débitée
                    </span>
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                      Active (Sidebar)
                    </span>
                  </div>
                  <p className="mt-0.5 font-bold text-xs text-gray-900 dark:text-white truncate">
                    {activeAssociation.name}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Association Débitée *
                  </label>
                  <Select2
                    value={expenseForm.associationId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, associationId: e.target.value })}
                    className="mt-1 w-full"
                  >
                    {associations.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select2>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Intitulé de la Dépense *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Achat de produits d'entretien, sono pour AG..."
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Catégorie *
                  </label>
                  <Select2
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="mt-1 w-full"
                  >
                    <option value="EQUIPEMENT">Équipement &amp; Matériel</option>
                    <option value="LOGISTIQUE">Logistique &amp; Entretien</option>
                    <option value="EVENEMENT">Événement &amp; Réunions</option>
                    <option value="LOYER_BAILLEUR">Loyer Bailleur</option>
                    <option value="AIDE_SOCIALE">Aide Sociale</option>
                    <option value="AUTRE">Autre Dépense</option>
                  </Select2>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Bénéficiaire / Prestataire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Librairie Universitaire, ETS Presta..."
                    value={expenseForm.beneficiary}
                    onChange={(e) => setExpenseForm({ ...expenseForm, beneficiary: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Statut Initial
                  </label>
                  <Select2
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value })}
                    className="mt-1 w-full"
                  >
                    <option value="PAID">Payé directement (Décaissé)</option>
                    <option value="PENDING_APPROVAL">En attente d&apos;approbation</option>
                  </Select2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Moyen de Paiement *
                  </label>
                  <Select2
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="mt-1 w-full"
                  >
                    <option>MTN Mobile Money Bénin (*880#)</option>
                    <option>Moov Money Bénin (*855#)</option>
                    <option>Espèces (Caisse menue)</option>
                    <option>Virement Bancaire</option>
                    <option>Chèque</option>
                  </Select2>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    N° Facture / Pièce Justificative
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: FAC-2026-089"
                    value={expenseForm.receiptRef}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptRef: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  Confirmer la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL D'ENREGISTREMENT DE COTISATION
         ========================================================================= */}
      {isCotisationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-brand-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Encaisser une Cotisation Adhérent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCotisationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRecordCotisation} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {activeAssociation ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Structure Associative
                    </span>
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                      Active (Sidebar)
                    </span>
                  </div>
                  <p className="mt-0.5 font-bold text-xs text-gray-900 dark:text-white truncate">
                    {activeAssociation.name}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Association *
                  </label>
                  <Select2
                    value={cotisationForm.associationId}
                    onChange={(e) => setCotisationForm({ ...cotisationForm, associationId: e.target.value })}
                    className="mt-1 w-full"
                  >
                    {associations.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select2>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom &amp; Prénom de l&apos;Adhérent *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Koffi Mensah, Awa Touré..."
                  value={cotisationForm.citizenName}
                  onChange={(e) => setCotisationForm({ ...cotisationForm, citizenName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Période Concernée (AAAA-MM) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-10"
                    value={cotisationForm.period}
                    onChange={(e) => setCotisationForm({ ...cotisationForm, period: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={cotisationForm.amount}
                    onChange={(e) => setCotisationForm({ ...cotisationForm, amount: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Moyen d&apos;Encaissement *
                </label>
                <Select2
                  value={cotisationForm.paymentMethod}
                  onChange={(e) => setCotisationForm({ ...cotisationForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full"
                >
                  <option>MTN Mobile Money Bénin (*880#)</option>
                  <option>Moov Money Bénin (*855#)</option>
                  <option>Celtiis Cash (*888#)</option>
                  <option>Espèces (Caisse adhésions)</option>
                </Select2>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCotisationModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Valider l&apos;Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL REÇU OFFICIEL DE DON PHILANTHROPIQUE (IMPRESSION)
         ========================================================================= */}
      {selectedDonationForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Reçu Officiel de Don &amp; Mécénat
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDonationForReceipt(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Corps du reçu officiel imprimable */}
            <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50/40 p-5 dark:border-pink-900/40 dark:bg-pink-950/20 text-xs">
              <div className="text-center border-b border-pink-200 dark:border-pink-900/50 pb-3">
                <span className="font-black text-sm uppercase tracking-wider text-pink-700 dark:text-pink-400">
                  RÉCÉPISSÉ OFFICIEL DE VERSEMENT
                </span>
                <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                  N° {selectedDonationForReceipt.reference}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Mécène / Donateur :</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedDonationForReceipt.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Montant versé :</span>
                  <span className="font-black text-base text-pink-600 dark:text-pink-400">
                    {selectedDonationForReceipt.amount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Affectation / Campagne :</span>
                  <span className="font-medium">{selectedDonationForReceipt.campaignName || "Fonds d'Urgence"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Mode de paiement :</span>
                  <span className="font-medium">{selectedDonationForReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Date d&apos;encaissement :</span>
                  <span className="font-medium">{new Date(selectedDonationForReceipt.receivedAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-pink-200 dark:border-pink-900/50 pt-4 text-[10px] text-gray-400">
                <div className="text-left">
                  <p className="font-bold text-gray-600 dark:text-gray-300">Signature Trésorerie</p>
                  <p className="italic">Bureau Exécutif Certifié</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <ShieldCheck className="size-3" />
                    Grand Livre ADR-006 Validé
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDonationForReceipt(null)}
                className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
              >
                <Printer className="size-4" />
                <span>Imprimer le Récépissé</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL QUITTANCE DE CHAMBRE / FRAIS D'INTÉGRATION (IMPRESSION)
         ========================================================================= */}
      {selectedResidentForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Quittance Officielle de Résidence &amp; Intégration
              </h3>
              <button
                type="button"
                onClick={() => setSelectedResidentForReceipt(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs">
              <div className="text-center border-b border-emerald-200 dark:border-emerald-900/50 pb-3">
                <span className="font-black text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  ATTESTATION DE RÈGLEMENT D&apos;INTÉGRATION
                </span>
                <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                  Chambre {selectedResidentForReceipt.roomNumber || "104"} - {selectedResidentForReceipt.buildingName || "Pavillon Ouest"}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Étudiant Titulaire :</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedResidentForReceipt.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Contact Téléphonique :</span>
                  <span className="font-medium">{selectedResidentForReceipt.userPhone || "+229 --"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Forfait Annuel Fixé :</span>
                  <span className="font-bold">{selectedResidentForReceipt.totalAmount.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Montant Déjà Encaissé :</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {selectedResidentForReceipt.paidAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Solde Restant Dû :</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    {selectedResidentForReceipt.remainingAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Statut Règlement :</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {selectedResidentForReceipt.status === "SETTLED" ? "RÈGLEMENT TOTAL EFFECTUÉ" : "EN COURS D'APUREMENT"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-emerald-200 dark:border-emerald-900/50 pt-4 text-[10px] text-gray-400">
                <div className="text-left">
                  <p className="font-bold text-gray-600 dark:text-gray-300">Cachet Résidence Universitaire</p>
                  <p className="italic">Commission Logement &amp; Accueil</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <ShieldCheck className="size-3" />
                    Vérifié &amp; Inscrit au Registre
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedResidentForReceipt(null)}
                className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <Printer className="size-4" />
                <span>Imprimer la Quittance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL ÉCRITURE GRAND LIVRE DIRECTE
         ========================================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Nouvelle Écriture Comptable (Grand Livre)
              </h3>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              {activeAssociation ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Structure Associative
                    </span>
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                      Active (Sidebar)
                    </span>
                  </div>
                  <p className="mt-0.5 font-bold text-xs text-gray-900 dark:text-white truncate">
                    {activeAssociation.name}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Association *
                  </label>
                  <Select2
                    value={txForm.associationId}
                    onChange={(e) => setTxForm({ ...txForm, associationId: e.target.value })}
                    className="mt-1 w-full"
                  >
                    {associations.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select2>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Type d&apos;Écriture *
                  </label>
                  <Select2
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value as any })}
                    className="mt-1 w-full"
                  >
                    <option value="INCOME">Recette (INCOME)</option>
                    <option value="EXPENSE">Dépense (EXPENSE)</option>
                  </Select2>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Montant en FCFA (XOF) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Mode de Règlement *
                </label>
                <Select2
                  value={txForm.paymentMethod}
                  onChange={(e) => setTxForm({ ...txForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full"
                >
                  <option>MTN Mobile Money Bénin (*880#)</option>
                  <option>Moov Money Bénin (*855#)</option>
                  <option>Celtiis Cash (*888#)</option>
                  <option>Espèces (Caisse de l&apos;association)</option>
                  <option>Virement Bancaire (UBA / BOA)</option>
                </Select2>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Description / Libellé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Subvention ponctuelle, frais d'assurance..."
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Valider l&apos;Écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL AJUSTEMENT COMPENSATOIRE (ADR-006)
         ========================================================================= */}
      {isAdjustmentModalOpen && selectedTxForAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Ajustement Compensatoire (ADR-006)
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-semibold">Transaction cible : {selectedTxForAdj.reference}</p>
              <p className="text-[11px] mt-0.5">
                Montant initial : {selectedTxForAdj.amount.toLocaleString("fr-FR")} FCFA ({selectedTxForAdj.type})
              </p>
            </div>

            <form onSubmit={handleCreateAdjustment} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Montant Rectificatif en FCFA (XOF) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjForm.amount}
                  onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Motif Obligatoire de la Régularisation *
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  placeholder="Ex: Rectification suite à trop-perçu sur bordereau Mobile Money..."
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  Enregistrer l&apos;Ajustement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL ENCAISSEMENT TRANCHE INTÉGRATION RÉSIDENCE
         ========================================================================= */}
      {isFeePaymentModalOpen && selectedDueForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Encaisser Versement Frais d&apos;Intégration
              </h3>
              <button
                type="button"
                onClick={() => setIsFeePaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <p className="font-semibold">Résident : {selectedDueForPay.userName || "Étudiant entrant"}</p>
              <p className="text-[11px] mt-0.5">
                Reste à payer : {selectedDueForPay.remainingAmount.toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <form onSubmit={handlePayFee} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Montant du Versement en FCFA (XOF) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={selectedDueForPay.remainingAmount}
                  value={feePayForm.amount}
                  onChange={(e) => setFeePayForm({ ...feePayForm, amount: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Moyen de Règlement *
                </label>
                <Select2
                  value={feePayForm.paymentMethod}
                  onChange={(e) => setFeePayForm({ ...feePayForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full"
                >
                  <option>MTN Mobile Money Bénin (*880#)</option>
                  <option>Moov Money Bénin (*855#)</option>
                  <option>Celtiis Cash (*888#)</option>
                  <option>Espèces (Caisse résidence)</option>
                  <option>Virement bancaire</option>
                </Select2>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsFeePaymentModalOpen(false)}
                  className="min-h-[40px] rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Émettre Reçu &amp; Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-xs font-medium text-gray-500">Chargement de la trésorerie...</p>
          </div>
        </div>
      }
    >
      <FinancePageContent />
    </Suspense>
  );
}
