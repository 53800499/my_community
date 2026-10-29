"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  FileText,
  Search,
  Plus,
  CheckCircle,
  Clock,
  ShieldCheck,
  Download,
  Eye,
  FileSignature,
  Building2,
  Calendar,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { apiService, ApiAssociationContract, ApiAssociation } from "@/lib/api";
import { AssociationContractPdfService } from "@/features/associations/services/association-contract-pdf.service";
import { usePermissions } from "@/features/auth";
import { AccessRestricted } from "@/components/auth/AccessRestricted";

export default function AssociationContractsPage() {
  const { isExecutive } = usePermissions();
  const [contracts, setContracts] = useState<ApiAssociationContract[]>([]);
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING_SIGNATURE" | "EXPIRED">("ALL");

  // Selected contract for view / signature
  const [selectedContract, setSelectedContract] = useState<ApiAssociationContract | null>(null);

  // New contract modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAssocId, setNewAssocId] = useState("");
  const [newType, setNewType] = useState<ApiAssociationContract["type"]>("CHARTE_INTEGRATION");
  const [newPresident, setNewPresident] = useState("");
  const [newAnnualFee, setNewAnnualFee] = useState("25000");
  const [newDurationYears, setNewDurationYears] = useState("3");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  if (!isExecutive) {
    return (
      <AccessRestricted
        title="Conventions & Actes d'Intégration Confidentiels"
        description="Les conventions d'intégration, chartes institutionnelles et engagements financiers des associations sont des actes juridiques réservés aux présidents et membres des bureaux exécutifs. Votre statut adhérent ne dispose pas de l'habilitation requise."
        requiredRole="Président(e) ou Bureau Exécutif"
        backHref="/dashboard/associations"
        backLabel="Retour à l'annuaire associatif"
      />
    );
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cList, aList] = await Promise.all([
        apiService.associationContracts.list(),
        apiService.associations.list(),
      ]);
      setContracts(cList);
      setAssociations(aList);
      if (aList.length > 0 && !newAssocId) {
        setNewAssocId(aList[0].id);
        const pres = aList[0].members?.find((m) => m.roles.includes("PRESIDENT"));
        setNewPresident(pres?.userName || "Président Mandataire");
      }
    } catch (err) {
      console.error("Failed to load association contracts:", err);
      showToast("Erreur lors du chargement des conventions.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [newAssocId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Association select change in creation modal
  const handleAssocSelectChange = (assocId: string) => {
    setNewAssocId(assocId);
    const assoc = associations.find((a) => a.id === assocId);
    if (assoc) {
      const pres = assoc.members?.find((m) => m.roles.includes("PRESIDENT"));
      setNewPresident(pres?.userName || "Président Mandataire");
    }
  };

  // Create Contract Handler
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssocId || !newPresident.trim()) return;

    const assoc = associations.find((a) => a.id === newAssocId);
    if (!assoc) return;

    setIsSubmitting(true);
    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDateObj = new Date(today);
      endDateObj.setFullYear(endDateObj.getFullYear() + (Number(newDurationYears) || 3));
      const endDate = endDateObj.toISOString().split("T")[0];

      const year = today.getFullYear();
      const randNum = String(Math.floor(Math.random() * 900) + 100);
      const contractNumber = `CONV-INT-${year}-${randNum}`;

      await apiService.associationContracts.create({
        associationId: assoc.id,
        associationName: assoc.name,
        associationAcronym: assoc.acronym,
        contractNumber,
        type: newType,
        status: "ACTIVE",
        signatoryPresident: newPresident.trim(),
        signatoryPlatform: "Direction Générale My Community (Bénin)",
        signedAt: new Date().toISOString(),
        startDate,
        endDate,
        annualFeeXOF: Number(newAnnualFee) || 0,
        articlesCount: 12,
        complianceStatus: "COMPLIANT",
        description: newDesc.trim() || `Convention cadre d'intégration institutionnelle de ${assoc.name}.`,
        terms: [
          "Article 1: Respect strict des principes de gouvernance démocratique et de transparence financière.",
          "Article 2: Déclaration obligatoire de l'organigramme exécutif et renouvellement périodique du bureau.",
          "Article 3: Habilitation à administrer des logements citoyens et à percevoir les cotisations en XOF.",
          "Article 4: Engagement de neutralité politique et d'inclusion citoyenne sans discrimination.",
        ],
      });

      showToast(`Convention ${contractNumber} enregistrée et active pour ${assoc.name} !`);
      setIsNewModalOpen(false);
      setNewDesc("");
      await loadData();
    } catch {
      showToast("Erreur lors de l'enregistrement de la convention.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign contract
  const handleSignContract = async (c: ApiAssociationContract) => {
    try {
      await apiService.associationContracts.sign(c.id, c.signatoryPresident);
      showToast(`Convention ${c.contractNumber} validée et certifiée !`);
      if (selectedContract?.id === c.id) {
        setSelectedContract((prev) => (prev ? { ...prev, status: "ACTIVE", signedAt: new Date().toISOString() } : null));
      }
      await loadData();
    } catch {
      showToast("Erreur lors de la signature.", "error");
    }
  };

  // Download PDF
  const handleDownloadPdf = async (c: ApiAssociationContract) => {
    try {
      await AssociationContractPdfService.generateAndDownload(c);
      showToast("Téléchargement du document contractuel démarré !");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Erreur lors de la génération du PDF.", "error");
    }
  };

  // Filtered
  const filtered = contracts.filter((c) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.status === "ACTIVE") ||
      (statusFilter === "PENDING_SIGNATURE" && c.status === "PENDING_SIGNATURE") ||
      (statusFilter === "EXPIRED" && c.status === "EXPIRED");

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.associationName.toLowerCase().includes(searchLower) ||
      (c.associationAcronym && c.associationAcronym.toLowerCase().includes(searchLower)) ||
      c.contractNumber.toLowerCase().includes(searchLower) ||
      c.signatoryPresident.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const activeCount = contracts.filter((c) => c.status === "ACTIVE").length;
  const pendingCount = contracts.filter((c) => c.status === "PENDING_SIGNATURE").length;

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

      {/* Header & Sub-Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                Conventions d&apos;Intégration &amp; Charte Partenaire
              </h1>
              <Badge variant="light" color="primary" size="sm">
                Agrément Officiel
              </Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Contrats d&apos;habilitation préalables à l&apos;intégration des associations et à la gestion de leurs patrimoines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            <span>Nouvelle Convention d&apos;Intégration</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Conventions</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{contracts.length}</p>
          <span className="text-[11px] text-gray-400">Associations conventionnées</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Conventions Actives</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
          <span className="text-[11px] text-emerald-600/80">Habilitées sur la plateforme</span>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">En Attente de Signature</span>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{pendingCount}</p>
          <span className="text-[11px] text-amber-600/80">À régulariser par le bureau</span>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Taux de Conformité</span>
          <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">
            {contracts.length > 0 ? `${Math.round((activeCount / contracts.length) * 100)}%` : "100%"}
          </p>
          <span className="text-[11px] text-indigo-600/80">Chartes et statuts validés</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <Select2
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full"
            >
              <option value="ALL">Tous les statuts ({contracts.length})</option>
              <option value="ACTIVE">Conventions Actives ({activeCount})</option>
              <option value="PENDING_SIGNATURE">En Attente de Signature ({pendingCount})</option>
              <option value="EXPIRED">Conventions Échues</option>
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
            placeholder="Rechercher par association, n° contrat, président..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Contracts Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <FileText className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
            Aucune convention trouvée
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enregistrez la première convention d&apos;intégration pour habiliter une association.
          </p>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <Plus className="size-4" />
            <span>Émettre une Convention</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5">Association Partenaire</th>
                  <th className="px-5 py-3.5">Réf. Contrat &amp; Type</th>
                  <th className="px-5 py-3.5">Signataire (Président)</th>
                  <th className="px-5 py-3.5">Période de Validité</th>
                  <th className="px-5 py-3.5">Statut Contractuel</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                          <Building2 className="size-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {c.associationName}
                          </span>
                          {c.associationAcronym && (
                            <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              {c.associationAcronym}
                            </span>
                          )}
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">{c.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {c.contractNumber}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        {c.type === "CHARTE_INTEGRATION"
                          ? "Charte d'Intégration Institutionnelle"
                          : c.type === "CONVENTION_PARTENARIAT"
                          ? "Convention de Partenariat"
                          : "Délégation de Service"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {c.signatoryPresident}
                      </span>
                      <p className="text-[11px] text-gray-400">
                        {c.signedAt ? `Signé le ${new Date(c.signedAt).toLocaleDateString("fr-FR")}` : "En attente"}
                      </p>
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
                        color={c.status === "ACTIVE" ? "success" : c.status === "PENDING_SIGNATURE" ? "warning" : "light"}
                        size="sm"
                      >
                        {c.status === "ACTIVE"
                          ? "Convention Active"
                          : c.status === "PENDING_SIGNATURE"
                          ? "En Attente Signature"
                          : "Échue"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedContract(c)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Nouvelle Convention */}
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
                    Émettre une Convention d&apos;Intégration
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Habilitation préalable d&apos;une association sur My Community
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

            <form onSubmit={handleCreateContract} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Association Bénéficiaire *
                </label>
                <Select2
                  value={newAssocId}
                  onChange={(e) => handleAssocSelectChange(e.target.value)}
                  className="mt-1 w-full"
                >
                  {associations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.acronym ? `(${a.acronym})` : ""}
                    </option>
                  ))}
                </Select2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Type de Convention *
                  </label>
                  <Select2
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="mt-1 w-full"
                  >
                    <option value="CHARTE_INTEGRATION">Charte d&apos;Intégration</option>
                    <option value="CONVENTION_PARTENARIAT">Partenariat Citoyen</option>
                    <option value="DELEGATION_SERVICE">Délégation de Service</option>
                  </Select2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Durée d&apos;engagement *
                  </label>
                  <Select2
                    value={newDurationYears}
                    onChange={(e) => setNewDurationYears(e.target.value)}
                    className="mt-1 w-full"
                  >
                    <option value="1">1 an (Reconduction tacite)</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans (Standard)</option>
                    <option value="5">5 ans (Cadre institutionnel)</option>
                  </Select2>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Président / Mandataire Légal Signataire *
                </label>
                <input
                  type="text"
                  value={newPresident}
                  onChange={(e) => setNewPresident(e.target.value)}
                  required
                  placeholder="Nom et prénoms du président"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Redevance annuelle de service (FCFA)
                </label>
                <input
                  type="number"
                  value={newAnnualFee}
                  onChange={(e) => setNewAnnualFee(e.target.value)}
                  min="0"
                  step="5000"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Objet &amp; Contexte Particulier
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ex: Habilitation à administrer les logements étudiants de Calavi..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  {isSubmitting ? "Enregistrement..." : "Émettre et Activer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Détail & Signature de la Convention */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Convention d&apos;Intégration — {selectedContract.contractNumber}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedContract.associationName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
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
                    Statut : {selectedContract.status === "ACTIVE" ? "Convention Active & Certifiée" : "En cours de signature"}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Conformité : 100% Validée
                </span>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Partie 1 : Plateforme
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedContract.signatoryPlatform}</p>
                  <p className="text-[11px] text-gray-500">Autorité de régulation citoyenne</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Partie 2 : Association Mandataire
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedContract.signatoryPresident}</p>
                  <p className="text-[11px] text-gray-500">Président(e) / Mandataire légal</p>
                </div>
              </div>

              {/* Articles & Clauses */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Clauses et Engagements Validés :
                </h4>
                <div className="space-y-1.5 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-800/30">
                  {selectedContract.terms.map((term, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="size-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates & Cotisations */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-gray-400" />
                  <span>
                    Validité : Du {selectedContract.startDate} au {selectedContract.endDate}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Redevance annuelle : {selectedContract.annualFeeXOF.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedContract)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="size-4" />
                <span>Télécharger la Convention (PDF)</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedContract.status !== "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => handleSignContract(selectedContract)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                  >
                    <FileSignature className="size-4" />
                    <span>Valider &amp; Signer</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
