"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { BanknoteIcon, PlusIcon, SearchIcon, CheckIcon } from "@/components/icons";
import { X, CreditCard, ShieldCheck, Users } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveAssociation } from "@/context/AssociationContext";
import { apiService, ApiAssociation } from "@/lib/api";
import { financeApiService, ApiCotisation } from "@/features/finance";

export default function CotisationsPage() {
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const [cotisations, setCotisations] = useState<ApiCotisation[]>([]);
  const { activeAssociationId, activeAssociation } = useActiveAssociation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New payment form
  const [formData, setFormData] = useState({
    associationId: "",
    citizenName: "",
    phone: "+229 ",
    amountXOF: 1000,
    channel: "MTN_MOMO" as "MTN_MOMO" | "MOOV_MONEY" | "ESPECES",
    reference: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenModal = () => {
    const targetId = (activeAssociationId && activeAssociationId !== "ALL")
      ? activeAssociationId
      : (associations[0]?.id || "");
    setFormData((prev) => ({
      ...prev,
      associationId: targetId,
      reference: `MOMO-BJ-${Math.floor(10000000 + Math.random() * 90000000)}`,
    }));
    setIsModalOpen(true);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const aList = await apiService.associations.list();
      setAssociations(aList);
      const targetAssocId = (activeAssociationId && activeAssociationId !== "ALL") ? activeAssociationId : undefined;
      if (aList.length > 0 && !formData.associationId) {
        setFormData((prev) => ({ ...prev, associationId: targetAssocId || aList[0].id }));
      }

      const records = await financeApiService.getCotisations(
        targetAssocId ? { associationId: targetAssocId } : undefined,
      );

      setCotisations(records);
    } catch (err) {
      console.error("Failed to load cotisations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeAssociationId]);

  const handleCreateCotisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assoc = associations.find((a) => a.id === formData.associationId);
      const created = await financeApiService.recordCotisation({
        associationId: formData.associationId,
        memberId: `mem-${Date.now()}`,
        citizenName: formData.citizenName,
        phone: formData.phone,
        amount: Number(formData.amountXOF) || 1000,
        period: "Octobre 2026",
        paymentMethod: formData.channel,
      });

      setCotisations([created, ...cotisations]);
      setIsModalOpen(false);
      setFormData({
        associationId: associations[0]?.id || "",
        citizenName: "",
        phone: "+229 ",
        amountXOF: 1000,
        channel: "MTN_MOMO",
        reference: "",
      });
      showToast("Cotisation enregistrée et portée au Grand Livre !");
    } catch (err) {
      console.error(err);
    }
  };

  const totalCollected = cotisations.reduce((acc, c) => acc + (c.amountXOF || 0), 0);

  const filtered = cotisations.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (c.citizenName?.toLowerCase().includes(q) ?? false) ||
      (c.associationName?.toLowerCase().includes(q) ?? false) ||
      c.reference.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-emerald-600">
          <CheckIcon className="size-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Cotisations des Membres
            </h1>
            <Badge variant="light" color="primary" size="sm">
              XOF (FCFA)
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="size-3" />
              Imputé au Grand Livre
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Encaissements par Mobile Money (MTN / Moov) et caisse associative locale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Badge communauté active synchronisé */}
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

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
          >
            <PlusIcon className="size-4" />
            <span>Encaisser Cotisation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Cotisations Encaissées
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BanknoteIcon className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {isLoading ? "..." : `${totalCollected.toLocaleString("fr-FR")} FCFA`}
          </h3>
          <p className="mt-1 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
            {cotisations.length} versements validés
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Période Courante
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <CreditCard className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            Octobre 2026
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Campagne mensuelle active
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Moyen Préféré
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <BanknoteIcon className="size-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            MTN MoMo (82%)
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Passerelle instantanée USSD
          </p>
        </div>
      </div>

      {/* Datatable / Adaptive Cards Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Journal des Cotisations
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Historique des cotisations des membres par Mobile Money et espèces
            </p>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="size-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher adhérent ou réf MoMo..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={searchTerm ? "Aucune cotisation trouvée" : "Aucune cotisation enregistrée"}
              description={
                searchTerm
                  ? `Aucun membre ne correspond à "${searchTerm}".`
                  : `Les encaissements Mobile Money et espèces pour ${activeAssociation?.name || "cette structure"} s'afficheront ici.`
              }
              action={
                !searchTerm
                  ? {
                      label: "Encaisser une cotisation",
                      onClick: handleOpenModal,
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
        ) : (
          <>
            {/* Desktop Table View (>=1024px) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider dark:bg-gray-800/50">
                  <tr>
                    <th className="px-5 py-3.5">Référence / Canal</th>
                    <th className="px-5 py-3.5">Adhérent Titulaire</th>
                    <th className="px-5 py-3.5">Association Créditée</th>
                    <th className="px-5 py-3.5">Période</th>
                    <th className="px-5 py-3.5">Montant XOF</th>
                    <th className="px-5 py-3.5 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {c.reference}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          {c.channel === "MTN_MOMO"
                            ? "MTN Mobile Money"
                            : c.channel === "MOOV_MONEY"
                            ? "Moov Money Bénin"
                            : "Caisse Espèces"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {c.citizenName}
                        </span>
                        <p className="text-[11px] text-gray-400">{c.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">
                        {c.associationName}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {c.period}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        +{(c.amountXOF || 1000).toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Badge variant="light" color="success" size="sm">
                          Encaissé
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Adaptive Mobile & Tablet Cards (<1024px) */}
            <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2.5 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {c.reference}
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      +{(c.amountXOF || 1000).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                      {c.citizenName}
                    </h4>
                    <p className="text-[11px] text-gray-500">{c.phone || "Non renseigné"}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-[10px] text-gray-400">
                      {c.associationName} • {c.period}
                    </span>
                    <Badge variant="light" color="success" size="sm">
                      Encaissé
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal: Encaisser une Cotisation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BanknoteIcon className="size-5 text-brand-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Enregistrer un Encaissement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCotisation} className="mt-4 space-y-4 text-xs">
              {activeAssociation ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Structure Bénéficiaire
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
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Association Bénéficiaire *
                  </label>
                  <Select2
                    required
                    value={formData.associationId}
                    onChange={(e) => setFormData({ ...formData, associationId: e.target.value })}
                    className="w-full"
                  >
                    {associations.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select2>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nom du Citoyen Cotisant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kouassi Paulin"
                  value={formData.citizenName}
                  onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formData.amountXOF}
                    onChange={(e) => setFormData({ ...formData, amountXOF: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Canal d&apos;Encaissement *
                </label>
                <Select2
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                  className="w-full"
                >
                  <option value="MTN_MOMO">MTN Mobile Money Bénin (*880#)</option>
                  <option value="MOOV_MONEY">Moov Money Bénin (*855#)</option>
                  <option value="ESPECES">Espèces (Reçu Main Propre)</option>
                </Select2>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}
