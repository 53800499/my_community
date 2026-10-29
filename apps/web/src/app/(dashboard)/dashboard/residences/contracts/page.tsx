"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  FileCheck,
  Search,
  Plus,
  CheckCircle,
  Building,
  Building2,
  Calendar,
  X,
  AlertCircle,
  Download,
  Eye,
  FileSignature,
  Phone,
  CreditCard,
  Trash2,
} from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { useActiveAssociation } from "@/context/AssociationContext";
import {
  ResidenceScopeHeader,
  NoActiveAssociationNotice,
} from "@/components/dashboard/ResidenceScopeHeader";
import { apiService, ApiBuildingConvention, ApiBuilding, ApiQuarter } from "@/lib/api";
import { ResidenceConventionPdfService } from "@/features/residences/services/residence-convention-pdf.service";
import { useConfirm } from "@/context/ConfirmationContext";

export default function ResidenceContractsPage() {
  const { confirm } = useConfirm();
  const {
    activeAssociation,
    activeAssociationId,
    hasActiveAssociation,
  } = useActiveAssociation();

  const [conventions, setConventions] = useState<ApiBuildingConvention[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING_VALIDATION" | "TERMINATED">("ALL");

  // Selected convention for full preview modal
  const [selectedConvention, setSelectedConvention] = useState<ApiBuildingConvention | null>(null);

  // New convention modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("+229 ");
  const [landlordEmail, setLandlordEmail] = useState("");
  const [landlordPayment, setLandlordPayment] = useState("MTN MoMo: ");
  const [conventionType, setConventionType] = useState<ApiBuildingConvention["type"]>("MANDAT_GESTION");
  const [monthlyMasterRent, setMonthlyMasterRent] = useState("250000");
  const [guaranteeDeposit, setGuaranteeDeposit] = useState("500000");
  const [durationYears, setDurationYears] = useState("3");
  const [renewalType, setRenewalType] = useState<ApiBuildingConvention["renewalType"]>("TACITE_REDUCTION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (!activeAssociationId) return;
    setIsLoading(true);
    try {
      const [convList, allBuildings, qList] = await Promise.all([
        apiService.residenceContracts.list({ associationId: activeAssociationId }),
        apiService.residences.getBuildings(),
        apiService.residences.getQuarters(activeAssociationId),
      ]);
      setQuarters(qList);

      const quarterIds = new Set(qList.map((q) => q.id));
      const scopedBuildings = allBuildings.filter((b) => quarterIds.has(b.quarterId));
      setBuildings(scopedBuildings);
      setConventions(convList);

      if (scopedBuildings.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(scopedBuildings[0].id);
        setLandlordName(scopedBuildings[0].landlordName);
        setLandlordPhone(scopedBuildings[0].landlordPhone || "+229 ");
        setLandlordPayment(scopedBuildings[0].landlordIbanOrMomo || "MTN MoMo: ");
      }
    } catch (err) {
      console.error("Failed to load residence conventions:", err);
      showToast("Erreur lors du chargement des conventions bailleurs.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeAssociationId, selectedBuildingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle building select in new convention modal
  const handleBuildingChange = (bId: string) => {
    setSelectedBuildingId(bId);
    const b = buildings.find((x) => x.id === bId);
    if (b) {
      setLandlordName(b.landlordName);
      setLandlordPhone(b.landlordPhone || "+229 ");
      setLandlordPayment(b.landlordIbanOrMomo || "MTN MoMo: ");
    }
  };

  // Create Landlord Convention Handler
  const handleCreateConvention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId || !landlordName.trim()) return;

    const building = buildings.find((b) => b.id === selectedBuildingId);
    if (!building) return;

    const quarter = quarters.find((q) => q.id === building.quarterId);

    setIsSubmitting(true);
    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDateObj = new Date(today);
      endDateObj.setFullYear(endDateObj.getFullYear() + (Number(durationYears) || 3));
      const endDate = endDateObj.toISOString().split("T")[0];

      const year = today.getFullYear();
      const randNum = String(Math.floor(Math.random() * 900) + 100);
      const conventionNumber = `CONV-BAILLEUR-${year}-${randNum}`;

      await apiService.residenceContracts.create({
        buildingId: building.id,
        buildingName: building.name,
        quarterId: building.quarterId,
        quarterName: quarter?.name || "Campus",
        quarterCity: quarter?.city || "Abomey-Calavi",
        associationId: activeAssociationId,
        associationName: activeAssociation?.name || "Association Active",
        landlordName: landlordName.trim(),
        landlordPhone: landlordPhone.trim(),
        landlordEmail: landlordEmail.trim() || undefined,
        landlordIbanOrMomo: landlordPayment.trim() || undefined,
        conventionNumber,
        type: conventionType,
        status: "ACTIVE",
        monthlyMasterRentXOF: Number(monthlyMasterRent) || 250000,
        guaranteeDepositXOF: Number(guaranteeDeposit) || 500000,
        startDate,
        endDate,
        renewalType,
        roomsCovered: building.floorsCount * 4,
        clauses: [
          "Mandat d'exploitation exclusif consenti à l'association gestionnaire pour hébergement citoyen et étudiant.",
          "Loyer cadre garanti versé au propriétaire le 5 de chaque mois.",
          "Entretien courant et maintenance préventive pris en charge par l'association.",
          "Assurance multirisque bâtiment souscrite par le propriétaire.",
        ],
        complianceCheck: true,
      });

      showToast(`Convention ${conventionNumber} enregistrée pour ${building.name} !`);
      setIsNewModalOpen(false);
      await loadData();
    } catch {
      showToast("Erreur lors de l'enregistrement de la convention bailleur.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Terminate convention
  const handleTerminateConvention = async (conv: ApiBuildingConvention) => {
    const ok = await confirm({
      title: "Résilier la convention bailleur",
      message: `Êtes-vous sûr de vouloir résilier la convention ${conv.conventionNumber} pour ${conv.buildingName} ? Les logements rattachés devront être régularisés.`,
      confirmText: "Résilier",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await apiService.residenceContracts.terminate(conv.id);
      showToast(`Convention ${conv.conventionNumber} clôturée avec succès.`);
      await loadData();
    } catch {
      showToast("Erreur lors de la résiliation.", "error");
    }
  };

  // Download PDF
  const handleDownloadPdf = async (conv: ApiBuildingConvention) => {
    try {
      await ResidenceConventionPdfService.generateAndDownload(conv);
      showToast("Téléchargement de l'attestation de conventionnement bailleur démarré !");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Erreur lors de la génération du PDF.", "error");
    }
  };

  // Filtered
  const filtered = conventions.filter((c) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.status === "ACTIVE") ||
      (statusFilter === "PENDING_VALIDATION" && c.status === "PENDING_VALIDATION") ||
      (statusFilter === "TERMINATED" && c.status === "TERMINATED");

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.buildingName.toLowerCase().includes(searchLower) ||
      c.landlordName.toLowerCase().includes(searchLower) ||
      c.conventionNumber.toLowerCase().includes(searchLower) ||
      c.quarterName.toLowerCase().includes(searchLower) ||
      c.quarterCity.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const activeCount = conventions.filter((c) => c.status === "ACTIVE").length;
  const totalMasterRent = conventions
    .filter((c) => c.status === "ACTIVE")
    .reduce((sum, c) => sum + c.monthlyMasterRentXOF, 0);
  const totalRoomsCovered = conventions
    .filter((c) => c.status === "ACTIVE")
    .reduce((sum, c) => sum + c.roomsCovered, 0);

  if (!hasActiveAssociation) {
    return (
      <div className="space-y-6">
        <NoActiveAssociationNotice
          title="Module Résidence : Conventions Bailleurs"
          subtitle="Veuillez sélectionner ou activer une association pour gérer ses conventions de résidences et baux d'exploitation."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xl animate-in slide-in-from-top-4 duration-200 ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-600 text-white"
              : "border-rose-300 bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header unifié avec portée d'association */}
      <ResidenceScopeHeader
        title="Conventions d'Exploitation & Baux Bailleurs"
        subtitle="Accords cadres préalables à l'intégration des résidences et bâtiments dans le patrimoine associatif."
        rightElement={
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            <span>Nouvelle Convention Bailleur</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Baux Enregistrés</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{conventions.length}</p>
          <span className="text-[11px] text-gray-400">Bâtiments sous convention</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Conventions Actives</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
          <span className="text-[11px] text-emerald-600/80">En exploitation régulière</span>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Loyer Cadre Global</span>
          <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">
            {totalMasterRent.toLocaleString("fr-FR")} <span className="text-sm font-medium">FCFA</span>
          </p>
          <span className="text-[11px] text-indigo-600/80">Reversé mensuellement aux bailleurs</span>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-xs dark:border-purple-950 dark:bg-purple-950/20">
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Logements Conventionnés</span>
          <p className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-300">{totalRoomsCovered}</p>
          <span className="text-[11px] text-purple-600/80">Capacité globale couverte</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[210px]">
            <Select2
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full"
            >
              <option value="ALL">Tous les statuts ({conventions.length})</option>
              <option value="ACTIVE">Conventions Actives ({activeCount})</option>
              <option value="PENDING_VALIDATION">En Négociation / Validation</option>
              <option value="TERMINATED">Baux Résiliés</option>
            </Select2>
          </div>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[260px]">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par bâtiment, bailleur, réf..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Conventions Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <FileCheck className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
            Aucune convention bailleur trouvée
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enregistrez la convention passée avec le propriétaire pour intégrer ce bâtiment.
          </p>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <Plus className="size-4" />
            <span>Enregistrer une Convention Bailleur</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5">Résidence / Bâtiment</th>
                  <th className="px-5 py-3.5">Bailleur / Propriétaire</th>
                  <th className="px-5 py-3.5">Réf. &amp; Type de Bail</th>
                  <th className="px-5 py-3.5">Redevance Mensuelle</th>
                  <th className="px-5 py-3.5">Validité</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                          <Building className="size-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {c.buildingName}
                          </span>
                          <p className="text-[11px] text-gray-500">
                            {c.quarterName} ({c.quarterCity}) • {c.roomsCovered} logements
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {c.landlordName}
                      </span>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Phone className="size-3" />
                        <span>{c.landlordPhone}</span>
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {c.conventionNumber}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        {c.type === "MANDAT_GESTION"
                          ? "Mandat de Gestion Locative"
                          : c.type === "BAIL_COMMERCIAL"
                          ? "Bail d'Exploitation Conventionné"
                          : c.type === "MISE_A_DISPOSITION_SOLIDAIRE"
                          ? "Mise à Disposition Solidaire"
                          : "Convention d'Exploitation"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {c.monthlyMasterRentXOF.toLocaleString("fr-FR")} FCFA
                      </span>
                      <p className="text-[10px] text-gray-400">/ mois au bailleur</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        Du {new Date(c.startDate).toLocaleDateString("fr-FR")}
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Au {new Date(c.endDate).toLocaleDateString("fr-FR")}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant="light"
                        color={c.status === "ACTIVE" ? "success" : c.status === "PENDING_VALIDATION" ? "warning" : "light"}
                        size="sm"
                      >
                        {c.status === "ACTIVE"
                          ? "Bail Actif"
                          : c.status === "PENDING_VALIDATION"
                          ? "En Négociation"
                          : "Résilié"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedConvention(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <Eye className="size-3.5" />
                          <span>Détails</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50/60 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300"
                          title="Télécharger l'attestation PDF"
                        >
                          <Download className="size-3.5" />
                          <span>PDF</span>
                        </button>
                        {c.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleTerminateConvention(c)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 p-1.5 text-xs text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                            title="Résilier la convention"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Nouvelle Convention Bailleur */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <FileSignature className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Enregistrer une Convention Bailleur
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bail d&apos;exploitation d&apos;un bâtiment avant ouverture aux résidents
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConvention} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Bâtiment / Résidence à Conventionner *
                </label>
                <Select2
                  value={selectedBuildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="mt-1 w-full"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </Select2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nom du Propriétaire / Bailleur *
                  </label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    required
                    placeholder="M. Florentin Dossou"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Téléphone Bailleur *
                  </label>
                  <input
                    type="text"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    required
                    placeholder="+229 97 00 00 00"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Type de Convention *
                  </label>
                  <Select2
                    value={conventionType}
                    onChange={(e) => setConventionType(e.target.value as any)}
                    className="mt-1 w-full"
                  >
                    <option value="MANDAT_GESTION">Mandat de Gestion</option>
                    <option value="BAIL_COMMERCIAL">Bail d&apos;Exploitation</option>
                    <option value="MISE_A_DISPOSITION_SOLIDAIRE">Mise à Disposition</option>
                    <option value="CONVENTION_EXPLOITATION">Convention Générale</option>
                  </Select2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Durée d&apos;exploitation *
                  </label>
                  <Select2
                    value={durationYears}
                    onChange={(e) => setDurationYears(e.target.value)}
                    className="mt-1 w-full"
                  >
                    <option value="1">1 an</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans (Reconduction tacite)</option>
                    <option value="5">5 ans</option>
                  </Select2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Redevance mensuelle au bailleur (FCFA)
                  </label>
                  <input
                    type="number"
                    value={monthlyMasterRent}
                    onChange={(e) => setMonthlyMasterRent(e.target.value)}
                    min="0"
                    step="10000"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Dépôt de Garantie (FCFA)
                  </label>
                  <input
                    type="number"
                    value={guaranteeDeposit}
                    onChange={(e) => setGuaranteeDeposit(e.target.value)}
                    min="0"
                    step="10000"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Coordonnées de règlement (MoMo ou IBAN)
                </label>
                <input
                  type="text"
                  value={landlordPayment}
                  onChange={(e) => setLandlordPayment(e.target.value)}
                  placeholder="MTN MoMo: 97000000 ou Compte BOA..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : "Conventionner le Bâtiment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Détail & Attestation de Convention Bailleur */}
      {selectedConvention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Convention Bailleur — {selectedConvention.conventionNumber}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bâtiment : {selectedConvention.buildingName} • {selectedConvention.quarterCity}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConvention(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* Statut banner */}
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Bail d&apos;Exploitation en Vigueur &amp; Titre Conforme
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Capacité : {selectedConvention.roomsCovered} logements
                </span>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Bailleur / Propriétaire
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedConvention.landlordName}</p>
                  <p className="text-[11px] text-gray-500">{selectedConvention.landlordPhone}</p>
                  {selectedConvention.landlordIbanOrMomo && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{selectedConvention.landlordIbanOrMomo}</p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Association Gestionnaire
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedConvention.associationName}</p>
                  <p className="text-[11px] text-gray-500">
                    {selectedConvention.quarterName} ({selectedConvention.quarterCity})
                  </p>
                </div>
              </div>

              {/* Clauses */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Clauses d&apos;Exploitation Validées :
                </h4>
                <div className="space-y-1.5 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-800/30">
                  {selectedConvention.clauses.map((clause, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="size-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{clause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions financières */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40">
                  <span className="text-[10px] text-gray-400 block">Loyer cadre mensuel :</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {selectedConvention.monthlyMasterRentXOF.toLocaleString("fr-FR")} FCFA / mois
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40">
                  <span className="text-[10px] text-gray-400 block">Dépôt de garantie séquestré :</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {selectedConvention.guaranteeDepositXOF.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedConvention)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="size-4" />
                <span>Télécharger la Convention (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedConvention(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
