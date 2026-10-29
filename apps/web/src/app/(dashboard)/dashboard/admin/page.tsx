"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  X,
  Compass,
  Building2,
  Globe2,
  Users,
  Search,
  Filter,
  AlertTriangle,
  RotateCw,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useAuth, usePermissions } from "@/features/auth";
import { useToast } from "@/features/errors";
import {
  apiService,
  ApiCommunity,
  ApiCommunityProposal,
} from "@/lib/api";
import { associationApiService } from "@/features/associations/services/association-api.service";
import { Association } from "@/features/associations/domain/association.types";

function AdminCockpitContent() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const { showSuccess, showError, showInfo } = useToast();

  const isAuthorized = Boolean(isAdmin || isSuperAdmin);

  // States
  const [proposals, setProposals] = useState<ApiCommunityProposal[]>([]);
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<"PROPOSALS" | "ASSOCIATIONS" | "AUDIT_SUMMARY">("PROPOSALS");
  const [searchTerm, setSearchTerm] = useState("");

  // Rejection modal state
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load Real Data
  const loadData = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const [props, comms, assocs] = await Promise.all([
        apiService.communities.getAdminProposals().catch(() => []),
        apiService.communities.list().catch(() => []),
        associationApiService.listAssociations().catch(() => []),
      ]);
      setProposals(props);
      setCommunities(comms);
      setAssociations(assocs);
    } catch (err) {
      showError(err, "Erreur lors du chargement des données d'administration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  // Review Actions
  const handleApprove = async (proposalId: string) => {
    setIsSubmittingReview(true);
    try {
      await apiService.communities.reviewProposal(proposalId, {
        decision: "APPROVED",
      });
      showSuccess("Proposition citoyenne approuvée avec succès ! L'espace communautaire est désormais actif.");
      await loadData();
    } catch (err) {
      showError(err, "Échec de l'approbation de la proposition");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProposalId || !rejectionReason.trim()) return;
    setIsSubmittingReview(true);
    try {
      await apiService.communities.reviewProposal(rejectingProposalId, {
        decision: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      showInfo("Proposition rejetée et motif officiel transmis au citoyen.");
      setRejectingProposalId(null);
      setRejectionReason("");
      await loadData();
    } catch (err) {
      showError(err, "Échec du rejet de la proposition");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.justification.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [proposals, searchTerm]);

  // Non-Authorized View: 403 Forbidden Shield Screen
  if (!isAuthorized) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-xl dark:bg-rose-950/60 dark:text-rose-400">
            <ShieldAlert className="size-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
            <Lock className="size-4" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-950 dark:text-white sm:text-3xl">
          Accès Restreint : Administration Générale
        </h1>
        <p className="mt-3 max-w-lg text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Cet espace de gouvernance souveraine et d&apos;instruction est strictement réservé aux{" "}
          <strong>Super-Administrateurs de la Plateforme</strong> (Mairies, Communes et Direction Générale).
          Votre compte citoyen actuel ne dispose pas des privilèges nécessaires (ADR-005 &amp; RBAC).
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition"
          >
            <span>Retourner au Tableau de Bord</span>
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <span>Consulter le Fil Citoyen</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sovereign Welcome & Admin Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-600 via-brand-700 to-indigo-900 p-6 text-white shadow-xl dark:border-amber-600/40">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tour de Contrôle &bull; Administration Générale de la Plateforme</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Console d&apos;Instruction &amp; Régulation
            </h1>
            <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
              Arbitrage souverain des initiatives citoyennes, contrôle des associations déclarées et surveillance du grand livre territorial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-brand-50 disabled:opacity-50"
            >
              <RotateCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="pointer-events-none absolute right-32 -bottom-24 size-48 rounded-full bg-indigo-500/20 blur-xl" />
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              En Attente d&apos;Instruction
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {proposals.length}
            </span>
            <span className="text-xs font-bold text-amber-600">
              {proposals.length > 0 ? "arbitrage requis" : "dossiers à jour"}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Espaces Validés
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Compass className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {communities.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">communautés actives</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Associations Déclarées
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Building2 className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {associations.length}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">organisations régies</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Couverture Nationale
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Globe2 className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              77 Communes
            </span>
            <span className="text-xs text-gray-500 font-medium">12 Départements</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("PROPOSALS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "PROPOSALS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Clock className="size-4" />
          <span>Instruction des Propositions ({proposals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ASSOCIATIONS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "ASSOCIATIONS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Building2 className="size-4" />
          <span>Associations Déclarées ({associations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT_SUMMARY")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "AUDIT_SUMMARY"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <FileText className="size-4" />
          <span>Directives &amp; Invariants RBAC</span>
        </button>
      </div>

      {/* Tab 1: Instruction des Propositions */}
      {activeTab === "PROPOSALS" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, territoire ou motivation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredProposals.length} proposition(s) en instance
            </span>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Toutes les propositions citoyennes sont instruites
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Aucun dossier citoyen en attente de validation ou de rejet à cet instant.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs transition hover:border-amber-400 dark:border-amber-900/40 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          EN ATTENTE D&apos;ARBITRAGE
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {prop.name}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {prop.description}
                      </p>

                      <div className="rounded-xl bg-amber-50/60 p-3 text-xs dark:bg-amber-950/20">
                        <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-0.5">
                          Justification de l&apos;auteur :
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          &laquo; {prop.justification} &raquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                        <span>Auteur ID : {prop.proposedById.slice(0, 8)}...</span>
                        <span>Date : {new Date(prop.createdAt).toLocaleDateString("fr-BJ")}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isSubmittingReview}
                        onClick={() => handleApprove(prop.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        <Check className="size-4" />
                        <span>Approuver &amp; Ouvrir</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingReview}
                        onClick={() => {
                          setRejectingProposalId(prop.id);
                          setRejectionReason("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition disabled:opacity-50"
                      >
                        <X className="size-4" />
                        <span>Rejeter avec Motif</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Associations Déclarées */}
      {activeTab === "ASSOCIATIONS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                  Registre des Personnes Morales Associatives
                </h3>
                <p className="text-xs text-gray-500">
                  Supervision statutaire, rattachements communautaires et mandats légaux.
                </p>
              </div>
              <Link
                href="/dashboard/associations"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                <span>Gérer dans l&apos;annuaire</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {associations.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {a.name}
                      </span>
                      {a.acronym && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 font-bold text-[10px] text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {a.acronym}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[11px] line-clamp-1 max-w-lg">
                      {a.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="light" color={a.isVerified ? "success" : "warning"} size="sm">
                      {a.isVerified ? "Agréée" : "Déclarée"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Directives & Invariants RBAC */}
      {activeTab === "AUDIT_SUMMARY" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                  Règles Fondamentales de Sécurité &amp; Étanchéité (ADR-005, ADR-011)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Modèle d&apos;autorisation RBAC contextuel par ressource et principe de non-confiance frontend.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/50 space-y-2">
                <span className="font-bold text-gray-900 dark:text-white block">
                  1. Rôles et Frontières des Espaces
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-400">
                  <li>L&apos;Administration Générale est la seule habilitée à approuver ou rejeter des propositions citoyennes.</li>
                  <li>Les présidents d&apos;associations ne disposent d&apos;aucun privilège de modération sur les communautés d&apos;accueil.</li>
                  <li>Le statut d&apos;administrateur de communauté n&apos;octroie aucun droit sur la trésorerie ou les membres des associations partenaires.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/50 space-y-2">
                <span className="font-bold text-gray-900 dark:text-white block">
                  2. Contrôles Double-Niveau (Front &amp; Back)
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-400">
                  <li>Tous les boutons d&apos;administration sont conditionnés par <code className="text-amber-600">usePermissions()</code>.</li>
                  <li>L&apos;API NestJS applique <code className="text-amber-600">PlatformAdminGuard</code> sur les routes sensibles (HTTP 403 RFC 7807).</li>
                  <li>Les actions critiques (dissolution, nomination, validation de mandats) sont journalisées de façon immuable dans l&apos;audit.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet Motivé */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="size-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Rejeter la Proposition Citoyenne
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingProposalId(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Motif formel de rejet (obligatoire) :
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex : Doublon avec l'espace communal existant, ou délimitation territoriale imprécise..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-2xs focus:border-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Ce motif sera transmis textuellement et archivé au dossier citoyen.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingProposalId(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !rejectionReason.trim()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <AdminCockpitContent />
    </Suspense>
  );
}
