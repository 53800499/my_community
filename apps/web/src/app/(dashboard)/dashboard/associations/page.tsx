'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import {
  Building2,
  Users,
  Megaphone,
  Contact,
  MapPin,
  Plus,
  Check,
  Search,
  Globe,
  X,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAssociations, Association } from '@/features/associations';
import { communityApiService, ApiCommunity } from '@/features/communities';
import { Select2 } from '@/components/ui/Select2';
import { apiService } from '@/lib/api';

export default function AssociationsPage() {
  const {
    associations,
    isLoading,
    registerAssociation,
    linkCommunity,
  } = useAssociations();

  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [showGovernanceGuide, setShowGovernanceGuide] = useState(false);

  // New Assoc Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [city, setCity] = useState('Abomey-Calavi');
  const [dues, setDues] = useState('1000');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Link Community Modal
  const [linkingAssoc, setLinkingAssoc] = useState<Association | null>(null);
  const [selectedCommunityChoice, setSelectedCommunityChoice] = useState('Habitants de Zogbadjè (Abomey-Calavi)');
  const [customCommunityName, setCustomCommunityName] = useState('');
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([
    'Habitants de Zogbadjè (Abomey-Calavi)',
    'Communauté des Développeurs du Bénin',
    'Étudiants & Apprenants de l’UAC',
    'Collectif Citoyen de Fidjrossè (Cotonou)',
    'Résidents de Ganhi & Akpakpa',
    'Jeunesse Active de Parakou',
    'Commune d’Abomey-Calavi',
  ]);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Charger les communautés existantes pour le rattachement
  React.useEffect(() => {
    async function loadCommunities() {
      try {
        const comms = await communityApiService.list();
        if (comms && comms.length > 0) {
          const names = comms.map((c: ApiCommunity) => c.name);
          setAvailableCommunities((prev) => Array.from(new Set([...prev, ...names])));
        }
      } catch {
        // Fallback par défaut conservé
      }
    }
    loadCommunities();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = associations.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.acronym && a.acronym.toLowerCase().includes(q)) ||
      (a.territory && a.territory.toLowerCase().includes(q))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!name.trim()) {
      setCreateError("Le nom de l'association est obligatoire.");
      return;
    }

    const trimmedName = name.trim().toLowerCase();
    const duplicate = associations.some(
      (a) => a.name.trim().toLowerCase() === trimmedName
    );
    if (duplicate) {
      setCreateError(`Une association portant le nom « ${name.trim()} » existe déjà.`);
      return;
    }

    try {
      const created = await registerAssociation({
        name: name.trim(),
        acronym: acronym.trim() || undefined,
        registrationNumber: regNumber.trim() || undefined,
        description: description.trim() || `Association citoyenne active à ${city} (Bénin)`,
        city,
        territory: `${city} (Bénin)`,
        monthlyDuesXOF: Number(dues) || 1000,
      });

      setIsModalOpen(false);
      setName('');
      setAcronym('');
      setRegNumber('');
      setDescription('');

      // Enregistrer automatiquement la convention cadre d'intégration
      try {
        const today = new Date();
        const year = today.getFullYear();
        const randNum = String(Math.floor(Math.random() * 900) + 100);
        const endDateObj = new Date(today);
        endDateObj.setFullYear(endDateObj.getFullYear() + 3);

        await apiService.associationContracts.create({
          associationId: created.id,
          associationName: created.name,
          associationAcronym: created.acronym,
          contractNumber: `CONV-INT-${year}-${randNum}`,
          type: "CHARTE_INTEGRATION",
          status: "ACTIVE",
          signatoryPresident: "Créateur / Administrateur de l’Espace Numérique",
          signatoryPlatform: "Direction Générale My Community (Bénin)",
          signedAt: today.toISOString(),
          startDate: today.toISOString().split("T")[0],
          endDate: endDateObj.toISOString().split("T")[0],
          annualFeeXOF: 25000,
          articlesCount: 12,
          complianceStatus: "COMPLIANT",
          description: `Convention cadre d'intégration institutionnelle de ${created.name}.`,
          terms: [
            "Article 1: Respect strict des principes de gouvernance démocratique et de transparence financière.",
            "Article 2: Déclaration obligatoire de l'organigramme exécutif et renouvellement périodique du bureau.",
            "Article 3: Habilitation à administrer des logements citoyens et à percevoir les cotisations en XOF.",
            "Article 4: Engagement de neutralité politique et d'inclusion citoyenne sans discrimination.",
          ],
        });
      } catch (convErr) {
        console.warn("Auto-creation of association contract skipped:", convErr);
      }

      showToast(`Association « ${created.name} » déclarée avec succès ! Vous recevez les droits d'administration de l'espace. Vous pouvez maintenant configurer votre bureau et nommer vos responsables.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la déclaration de l’association.';
      setCreateError(msg);
      showToast(msg);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    const targetCommunity = selectedCommunityChoice === 'AUTRE'
      ? customCommunityName.trim()
      : selectedCommunityChoice.trim();

    if (!linkingAssoc || !targetCommunity) {
      setLinkError("Veuillez sélectionner ou saisir le nom de la communauté à rattacher.");
      return;
    }
    try {
      await linkCommunity(linkingAssoc.id, targetCommunity);
      showToast(`Association rattachée à « ${targetCommunity} » avec succès !`);
      setLinkingAssoc(null);
      setCustomCommunityName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du rattachement.';
      setLinkError(msg);
      showToast(msg);
    }
  };

  // KPIs
  const totalMembers = associations.reduce((sum, a) => sum + (a.membersCount || 0), 0);
  const totalTreasury = associations.reduce((sum, a) => sum + (a.treasuryBalanceXOF || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-top-3">
          <Check className="size-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Annuaire &amp; Gouvernance des Associations Citoyennes
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Législation Bénin
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Gestion intégrale des groupements civiques, organigrammes de direction, résidences sous gestion et multi-rattachement territorial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGovernanceGuide(!showGovernanceGuide)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <HelpCircle className="size-4 text-brand-600" />
            <span>Communauté vs Association</span>
            {showGovernanceGuide ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            <span>Déclarer une Association</span>
          </button>
        </div>
      </div>

      {/* Guide Pédagogique Dépliable : Distinction Communauté vs Association */}
      {showGovernanceGuide && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white p-5 shadow-xs dark:border-indigo-900/60 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-gray-900 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shrink-0 mt-0.5">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                  Règles Fondamentales d'Architecture : Distinction Communauté &amp; Association
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Pour éviter les conflits d’autorité et les doublons, My Community sépare strictement l&apos;espace social de rassemblement et l&apos;organisation légale structurée.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="rounded-xl bg-white/80 p-3.5 border border-indigo-100 dark:bg-gray-800/80 dark:border-gray-700">
                  <span className="font-bold text-brand-700 dark:text-brand-300 block mb-1">
                    1. La Communauté (Espace Social)
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    Rassemblement citoyen autour d’un quartier (ex: <em>Zogbadjè</em>), d’un intérêt ou d’une identité (ex: <em>Développeurs du Bénin</em>). Elle peut exister sans bureau officiel, sans cotisations obligatoires et sans statuts déclarés. Rôles : <strong>Créateur, Administrateur, Modérateur, Membre</strong>.
                  </p>
                </div>

                <div className="rounded-xl bg-white/80 p-3.5 border border-purple-100 dark:bg-gray-800/80 dark:border-gray-700">
                  <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                    2. L'Association (Organisation Structurée)
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    Organisation formelle avec registre d’adhérents, bureau exécutif (Président, SG, Trésorier...), cotisations régulières et comptes vérifiés. Elle peut être rattachée à plusieurs communautés (N-N), mais <strong>appartenir à une communauté ne confère pas l’adhésion automatique aux associations liées</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-[11px]">
                <strong>Règle de Gouvernance :</strong> Le créateur d’une association sur My Community reçoit les droits d&apos;<strong>Administrateur Technique de l’Espace</strong> (gestion des accès et paramètres), mais n&apos;est pas automatiquement investi <strong>Président statutaire</strong>. La présidence et les postes officiels font l’objet de mandats électifs déclarés dans l&apos;organigramme parmi les membres inscrits.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Régionaux */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Associations Déclarées</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{associations.length}</p>
          <p className="mt-1 text-[10px] text-gray-400">Récépissés préfectoraux</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Adhérents Citoyens</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalMembers.toLocaleString('fr-FR')}</p>
          <p className="mt-1 text-[10px] text-gray-400">Membres et cotisants</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400">Trésoreries Cumulées</p>
          <p className="mt-1 text-2xl font-black text-brand-600 dark:text-brand-400">{totalTreasury.toLocaleString('fr-FR')} F</p>
          <p className="mt-1 text-[10px] text-gray-400">En Francs CFA (XOF)</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Communes Impliquées</p>
          <p className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">Calavi, Cotonou</p>
          <p className="mt-1 text-[10px] text-gray-400">Atlantique &amp; Littoral</p>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une association par nom, sigle ou ville..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Liste des Associations */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500">Chargement des associations...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
          <Users className="mx-auto size-8 text-gray-400" />
          <p className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-300">Aucune association trouvée</p>
          <p className="text-xs text-gray-500">Déclarez un nouveau regroupement civique.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((assoc) => (
            <div
              key={assoc.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-sm font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {assoc.acronym || assoc.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {assoc.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {assoc.registrationNumber ? `Récépissé N° ${assoc.registrationNumber}` : 'En cours d’enregistrement'} • {assoc.territory || 'Bénin'}
                      </p>
                    </div>
                  </div>
                  {/* Statut de Vérification Statutaire */}
                  {assoc.isVerified || (assoc.registrationNumber && assoc.registrationNumber.trim().length >= 3) ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
                        <span>Déclarée &amp; Vérifiée</span>
                      </span>
                      <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Cotisations &amp; baux débloqués</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                        <AlertCircle className="size-3 text-amber-600 shrink-0" />
                        <span>Non Vérifiée</span>
                      </span>
                      <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 font-medium">Récépissé requis pour finances</span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {assoc.description}
                </p>

                {/* Rattachements Territoriaux */}
                <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Globe className="size-3.5 text-brand-600" />
                      <span>Espaces Communautaires Rattachés</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setLinkingAssoc(assoc)}
                      className="text-[11px] font-bold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      + Rattacher
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(assoc.linkedCommunityIds?.length ?? 0) > 0 ? (
                      assoc.linkedCommunityIds.map((cid, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-2xs border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <MapPin className="size-3 text-brand-600 shrink-0" />
                          <span>{cid}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Aucun espace rattaché pour l'instant.</span>
                    )}
                  </div>
                </div>

                {/* Chiffres Clés */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-gray-100 p-2.5 dark:border-gray-800">
                    <span className="text-[11px] text-gray-400">Adhérents</span>
                    <p className="font-bold text-gray-900 dark:text-white">{assoc.membersCount} membres</p>
                    <p className="text-[10px] text-gray-400">Cotisation : {assoc.monthlyDuesXOF} F/mois</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-2.5 dark:border-gray-800">
                    <span className="text-[11px] text-gray-400">Trésorerie</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {assoc.treasuryBalanceXOF.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-emerald-500">
                      <Check className="size-3 shrink-0" />
                      <span>Comptes certifiés</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Link
                  href="/dashboard/associations/bureau"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <Users className="size-3.5" />
                  <span>Organigramme &amp; Postes</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/associations/posts"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <Megaphone className="size-3.5" />
                    <span>Communiqués</span>
                  </Link>
                  <Link
                    href="/dashboard/associations/members"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <Contact className="size-3.5" />
                    <span>Membres</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Déclarer Association */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Déclarer une Association Civique</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enregistrement légal et création du bureau exécutif.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Nom complet de l&apos;Association *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Association des Étudiants et Cadres d'Abomey-Calavi"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Sigle / Acronyme</label>
                  <input
                    type="text"
                    value={acronym}
                    onChange={(e) => setAcronym(e.target.value)}
                    placeholder="Ex: AECAC"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Numéro Récépissé Officiel</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="Ex: BEN-ABC-2026-099"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Ville / Commune du Siège</label>
                  <Select2
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full"
                  >
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Cotonou">Cotonou</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Ouidah">Ouidah</option>
                  </Select2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Cotisation Mensuelle (FCFA)</label>
                  <input
                    type="number"
                    value={dues}
                    onChange={(e) => setDues(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Description &amp; But</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs civiques, gestion de logements, entraide sociale..."
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                >
                  <Plus className="size-4" />
                  <span>Enregistrer l'Association</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rattacher Communauté */}
      {linkingAssoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Rattacher une Communauté Territoriale</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Déclarez la présence de « {linkingAssoc.name} » dans un espace géographique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLinkingAssoc(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleLink} className="mt-4 space-y-4">
              {linkError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Choisir l&apos;Espace Communautaire Territorial *
                </label>
                <Select2
                  value={selectedCommunityChoice}
                  onChange={(e) => setSelectedCommunityChoice(e.target.value)}
                  className="mt-1 w-full"
                >
                  {availableCommunities.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                  <option value="AUTRE">+ Saisir une autre communauté...</option>
                </Select2>
              </div>

              {selectedCommunityChoice === 'AUTRE' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nom de la Communauté
                  </label>
                  <input
                    type="text"
                    required
                    value={customCommunityName}
                    onChange={(e) => setCustomCommunityName(e.target.value)}
                    placeholder="Ex: Communauté des Jeunes Entrepreneurs de Calavi"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div className="rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 flex items-start gap-2">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Règle d’architecture N-N :</strong> Le rattachement permet d’afficher l&apos;association auprès des résidents de cet espace. Les membres de la communauté ne deviennent pas automatiquement adhérents de l&apos;association.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkingAssoc(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <Check className="size-4" />
                  <span>Confirmer le Rattachement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
