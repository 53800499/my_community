'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import { Select2 } from '@/components/ui/Select2';
import {
  ShieldCheck,
  FileText,
  FileSignature,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Lock,
  Unlock,
  ChevronRight,
  Building2,
  FileCheck,
  Paperclip,
  Sparkles,
  BedDouble,
  Home,
} from 'lucide-react';
import { ResidenceScopeHeader } from '@/components/dashboard/ResidenceScopeHeader';
import { useActiveAssociation } from '@/context/AssociationContext';
import {
  apiService,
  ApiResidenceAdmissionRules,
  ApiResidentDelegateContract,
  ApiBuilding,
} from '@/lib/api';
import { ResidentDelegateContractPdfService } from '@/features/residences/services/resident-delegate-contract-pdf.service';
import { ResidenceRulesPdfService } from '@/features/residences/services/residence-rules-pdf.service';
import { usePermissions } from '@/features/auth';
import { AccessRestricted } from '@/components/auth/AccessRestricted';

type ResidenceRole = 'GESTIONNAIRE' | 'CHEF_PAVILLON' | 'RESIDENT';

interface RoleSimulation {
  role: ResidenceRole;
  label: string;
  isAuthorized: boolean;
  description: string;
}

const RESIDENCE_ROLE_SIMULATIONS: RoleSimulation[] = [
  {
    role: 'GESTIONNAIRE',
    label: 'Responsable Logement / Bureau (Accès Complet)',
    isAuthorized: true,
    description: 'Pouvoir complet : révision du règlement intérieur, fixation des cautions et nomination des délégués.',
  },
  {
    role: 'CHEF_PAVILLON',
    label: 'Chef de Pavillon / Délégué Titulaire (Gestion Pavillon)',
    isAuthorized: true,
    description: 'Participation aux états des lieux, médiation et remontée des incidents techniques.',
  },
  {
    role: 'RESIDENT',
    label: 'Résident Simple (Consultation Seule)',
    isAuthorized: false,
    description: 'Consultation du règlement intérieur et des chartes. Modifications réservées aux gestionnaires.',
  },
];

export function ResidenceGovernanceClient() {
  const { isExecutive, isSyndic } = usePermissions();
  const { activeAssociationId, activeAssociation } = useActiveAssociation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'RULES' | 'DELEGATES'>('RULES');

  // Simulation de rôle actif
  const [currentRoleSimulation, setCurrentRoleSimulation] = useState<RoleSimulation>(RESIDENCE_ROLE_SIMULATIONS[0]);

  // Bâtiments de l'association
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);

  // Règles d'admission en résidence
  const [rules, setRules] = useState<ApiResidenceAdmissionRules | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Formulaire d'édition des règles d'admission
  const [newCriterion, setNewCriterion] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');

  // Contrats de mandats des délégués de pavillon
  const [contracts, setContracts] = useState<ApiResidentDelegateContract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals state
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [contractForUpload, setContractForUpload] = useState<ApiResidentDelegateContract | null>(null);
  const [detailsContract, setDetailsContract] = useState<ApiResidentDelegateContract | null>(null);

  // New contract form (Utilisation de chaînes statiques pour termStartDate et termEndDate afin d'éviter l'erreur Next.js 16)
  const [newContractForm, setNewContractForm] = useState({
    delegateName: '',
    delegatePhone: '',
    delegateEmail: '',
    buildingId: '',
    roomNumber: '',
    delegateRole: 'CHEF_PAVILLON' as ApiResidentDelegateContract['delegateRole'],
    positionTitle: '',
    type: 'MANDAT_DELEGUE_PAVILLON' as ApiResidentDelegateContract['type'],
    termStartDate: '2026-01-01',
    termEndDate: '2028-01-01',
    monthlyRentReductionXOF: 10000,
    delegation1: '',
    delegation2: '',
    obligation1: '',
    obligation2: '',
    signatorySupervisorName: '',
  });

  // Upload PDF state
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rulesFileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isAuthorized = currentRoleSimulation.isAuthorized;

  // 1. Charger les bâtiments et les règles de résidence
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!activeAssociationId) return;
      setIsLoadingRules(true);
      try {
        const [rulesData, buildingsData] = await Promise.all([
          apiService.residenceAdmissionRules.get(activeAssociationId),
          apiService.residences.getBuildings(),
        ]);
        if (isMounted) {
          setRules(rulesData);
          setBuildings(buildingsData);
        }
      } catch (err) {
        console.warn('Erreur chargement des règles de résidence:', err);
      } finally {
        if (isMounted) setIsLoadingRules(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeAssociationId]);

  // 2. Charger les contrats des délégués de pavillon
  useEffect(() => {
    let isMounted = true;
    async function loadContracts() {
      if (!activeAssociationId) return;
      setIsLoadingContracts(true);
      try {
        const list = await apiService.residentDelegateContracts.getByAssociation(activeAssociationId);
        if (isMounted) setContracts(list);
      } catch (err) {
        console.warn('Erreur chargement mandats délégués:', err);
      } finally {
        if (isMounted) setIsLoadingContracts(false);
      }
    }
    loadContracts();
    return () => {
      isMounted = false;
    };
  }, [activeAssociationId]);

  // Gestion des règles d'admission : Ajout / Suppression de critères
  const handleAddCriterion = () => {
    if (!newCriterion.trim() || !rules || !isAuthorized) return;
    setRules({
      ...rules,
      eligibilityCriteria: [...rules.eligibilityCriteria, newCriterion.trim()],
    });
    setNewCriterion('');
  };

  const handleRemoveCriterion = (idx: number) => {
    if (!rules || !isAuthorized) return;
    setRules({
      ...rules,
      eligibilityCriteria: rules.eligibilityCriteria.filter((_, i) => i !== idx),
    });
  };

  // Pièces justificatives
  const handleAddDoc = () => {
    if (!newDoc.trim() || !rules || !isAuthorized) return;
    setRules({
      ...rules,
      requiredDocuments: [...rules.requiredDocuments, newDoc.trim()],
    });
    setNewDoc('');
  };

  const handleRemoveDoc = (idx: number) => {
    if (!rules || !isAuthorized) return;
    setRules({
      ...rules,
      requiredDocuments: rules.requiredDocuments.filter((_, i) => i !== idx),
    });
  };

  // Articles du règlement intérieur
  const handleAddHouseRule = () => {
    if (!newRuleTitle.trim() || !newRuleContent.trim() || !rules || !isAuthorized) return;
    setRules({
      ...rules,
      houseRulesArticles: [
        ...rules.houseRulesArticles,
        {
          id: `hra-${Date.now()}`,
          title: newRuleTitle.trim(),
          content: newRuleContent.trim(),
        },
      ],
    });
    setNewRuleTitle('');
    setNewRuleContent('');
  };

  const handleRemoveHouseRule = (id: string) => {
    if (!rules || !isAuthorized) return;
    setRules({
      ...rules,
      houseRulesArticles: rules.houseRulesArticles.filter((a) => a.id !== id),
    });
  };

  // Sauvegarde des règles de résidence
  const handleSaveRules = async () => {
    if (!rules || !activeAssociationId || !isAuthorized) return;
    setIsSavingRules(true);
    try {
      const updated = await apiService.residenceAdmissionRules.update(activeAssociationId, {
        ...rules,
        updatedByUserName: currentRoleSimulation.label.split('(')[0].trim(),
        updatedByUserRole: currentRoleSimulation.role,
      });
      setRules(updated);
      showToast('Règlement intérieur et conditions d’admission mis à jour !');
    } catch {
      showToast('Erreur lors de la sauvegarde du règlement.', 'error');
    } finally {
      setIsSavingRules(false);
    }
  };

  // Téléversement PDF pour le Règlement intérieur des résidences
  const handleRulesPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rules || !isAuthorized) return;

    if (file.type !== 'application/pdf') {
      showToast('Veuillez sélectionner un fichier PDF valide.', 'error');
      return;
    }

    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        const updated = await apiService.residenceAdmissionRules.uploadPdf(
          rules.associationId,
          file.name,
          result,
          sizeStr
        );
        setRules(updated);
        showToast(`Règlement intérieur « ${file.name} » rattaché avec succès aux résidences !`);
      } catch {
        showToast('Erreur lors du rattachement du fichier PDF.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Télécharger la fiche PDF des règles de résidence
  const handleDownloadRulesPdf = async () => {
    if (!rules) return;
    try {
      await ResidenceRulesPdfService.generateAndDownload(rules);
      showToast('Fiche officielle du règlement des résidences téléchargée en PDF !');
    } catch {
      showToast('Erreur lors de la génération du document PDF.', 'error');
    }
  };

  // Création d'un nouveau mandat de délégué de pavillon
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssociationId || !activeAssociation || !isAuthorized) return;
    if (!newContractForm.delegateName || !newContractForm.positionTitle) {
      showToast('Veuillez renseigner le nom du délégué et son titre officiel.', 'error');
      return;
    }

    try {
      const contractCount = contracts.length + 1;
      const bld = buildings.find((b) => b.id === newContractForm.buildingId);
      const bldPrefix = bld?.name ? bld.name.split(' ')[0].toUpperCase() : 'PAV';
      const contractNumber = `MANDAT-DEL-${bldPrefix}-2026-${String(contractCount).padStart(3, '0')}`;

      const delegations = [
        newContractForm.delegation1.trim() || 'Signature conjointe des états des lieux et médiation de premier niveau dans le pavillon',
      ];
      if (newContractForm.delegation2.trim()) {
        delegations.push(newContractForm.delegation2.trim());
      }

      const ethicalObligations = [
        newContractForm.obligation1.trim() || 'Neutralité absolue, respect de la vie privée des résidents et devoir d’alerte technique',
      ];
      if (newContractForm.obligation2.trim()) {
        ethicalObligations.push(newContractForm.obligation2.trim());
      }

      const created = await apiService.residentDelegateContracts.create({
        associationId: activeAssociationId,
        associationName: activeAssociation.name,
        buildingId: newContractForm.buildingId || undefined,
        buildingName: bld?.name || 'Toutes Résidences',
        contractNumber,
        delegateUserId: `u-del-${Date.now()}`,
        delegateName: newContractForm.delegateName.trim(),
        delegatePhone: newContractForm.delegatePhone.trim() || undefined,
        delegateEmail: newContractForm.delegateEmail.trim() || undefined,
        roomNumber: newContractForm.roomNumber.trim() || undefined,
        delegateRole: newContractForm.delegateRole,
        positionTitle: newContractForm.positionTitle.trim(),
        type: newContractForm.type,
        status: 'PENDING_SIGNATURE',
        termStartDate: newContractForm.termStartDate,
        termEndDate: newContractForm.termEndDate,
        delegations,
        ethicalObligations,
        monthlyRentReductionXOF: Number(newContractForm.monthlyRentReductionXOF) || 0,
        isSigned: false,
        signatorySupervisorName: newContractForm.signatorySupervisorName.trim() || 'Direction des Résidences',
        pdfFileName: uploadedFileName || undefined,
        pdfFileData: uploadedFileData || undefined,
        pdfFileSize: uploadedFileSize || undefined,
        pdfUploadedAt: uploadedFileData ? new Date().toISOString() : undefined,
      });

      setContracts([created, ...contracts]);
      setIsCreateContractModalOpen(false);
      setUploadedFileName('');
      setUploadedFileData('');
      setUploadedFileSize('');
      setNewContractForm({
        delegateName: '',
        delegatePhone: '',
        delegateEmail: '',
        buildingId: '',
        roomNumber: '',
        delegateRole: 'CHEF_PAVILLON',
        positionTitle: '',
        type: 'MANDAT_DELEGUE_PAVILLON',
        termStartDate: '2026-01-01',
        termEndDate: '2028-01-01',
        monthlyRentReductionXOF: 10000,
        delegation1: '',
        delegation2: '',
        obligation1: '',
        obligation2: '',
        signatorySupervisorName: '',
      });
      showToast(`Mandat officiel « ${contractNumber} » pour ${created.delegateName} créé avec succès !`);
    } catch {
      showToast('Erreur lors de la création du mandat.', 'error');
    }
  };

  // Signature électronique d'un mandat
  const handleSignContract = async (contract: ApiResidentDelegateContract) => {
    if (!isAuthorized) {
      showToast('Action non autorisée. Seuls les gestionnaires habilités peuvent valider.', 'error');
      return;
    }
    try {
      const updated = await apiService.residentDelegateContracts.sign(contract.id, contract.delegateName);
      setContracts(contracts.map((c) => (c.id === contract.id ? updated : c)));
      showToast(`Mandat « ${contract.contractNumber} » validé et signé !`);
    } catch {
      showToast('Erreur lors de la signature du mandat.', 'error');
    }
  };

  // Téléchargement du contrat PDF d'un délégué
  const handleDownloadContractPdf = async (contract: ApiResidentDelegateContract) => {
    try {
      if (contract.pdfFileData) {
        const link = document.createElement('a');
        link.href = contract.pdfFileData;
        link.download = contract.pdfFileName || `Mandat_Delegue_${contract.contractNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Document PDF officiel « ${contract.pdfFileName || contract.contractNumber} » téléchargé !`);
      } else {
        await ResidentDelegateContractPdfService.generateAndDownload(contract);
        showToast(`Contrat de mandat officiel « ${contract.contractNumber} » généré en PDF !`);
      }
    } catch {
      showToast('Erreur lors du téléchargement du contrat PDF.', 'error');
    }
  };

  // Téléversement PDF pour un mandat existant
  const handleFileSelectedForContract = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractForUpload || !isAuthorized) return;

    if (file.type !== 'application/pdf') {
      showToast('Veuillez sélectionner un fichier PDF valide.', 'error');
      return;
    }

    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const updated = await apiService.residentDelegateContracts.uploadPdf(
          contractForUpload.id,
          file.name,
          base64,
          sizeStr
        );
        setContracts(contracts.map((c) => (c.id === updated.id ? updated : c)));
        setIsUploadPdfModalOpen(false);
        setContractForUpload(null);
        showToast(`Document PDF « ${file.name} » rattaché avec succès au mandat !`);
      } catch {
        showToast('Erreur lors du téléversement du PDF.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtrage des contrats
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (buildingFilter !== 'ALL' && c.buildingId !== buildingFilter) return false;
      if (roleFilter !== 'ALL' && c.delegateRole !== roleFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchName = c.delegateName.toLowerCase().includes(q);
        const matchTitle = c.positionTitle.toLowerCase().includes(q);
        const matchNumber = c.contractNumber.toLowerCase().includes(q);
        const matchBld = c.buildingName?.toLowerCase().includes(q) || false;
        return matchName || matchTitle || matchNumber || matchBld;
      }
      return true;
    });
  }, [contracts, buildingFilter, roleFilter, statusFilter, searchFilter]);

  if (!isExecutive && !isSyndic) {
    return (
      <AccessRestricted
        title="Règles & Délégués Résidents Confidentiels"
        description="Le règlement intérieur des pavillons, la fixation des cautions et les contrats de mandats des délégués sont réservés aux gestionnaires de résidences, aux syndics et au bureau exécutif."
        requiredRole="Syndic ou Responsable Résidentiel"
        backHref="/dashboard/residences"
        backLabel="Retour aux résidences & campus"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-bounce-short ${
            toast.type === 'error'
              ? 'border-red-300 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/95 dark:text-red-200'
              : toast.type === 'info'
              ? 'border-blue-300 bg-blue-50/95 text-blue-900 dark:border-blue-800 dark:bg-blue-950/95 dark:text-blue-200'
              : 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/95 dark:text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Residence Scope Header */}
      <ResidenceScopeHeader
        title="Règles d'Admission & Délégués des Résidents"
        subtitle="Définissez les conditions d'accès, le règlement de vie en pavillon et les mandats officiels des chefs de pavillons et délégués résidents."
        rightElement={
          <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[220px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Lock className="size-3 text-indigo-600 dark:text-indigo-400" />
              Rôle Actif (Gestion Résidences)
            </label>
            <Select2
              aria-label="Simulateur de rôle actif résidence"
              value={currentRoleSimulation.role}
              onChange={(e) => {
                const found = RESIDENCE_ROLE_SIMULATIONS.find((r) => r.role === e.target.value);
                if (found) {
                  setCurrentRoleSimulation(found);
                  showToast(`Mode commuté : ${found.label}`, 'info');
                }
              }}
              className="w-full"
            >
              {RESIDENCE_ROLE_SIMULATIONS.map((sim) => (
                <option key={sim.role} value={sim.role}>
                  {sim.label}
                </option>
              ))}
            </Select2>
          </div>
        }
      />

      {/* Security Permission Alert Banner */}
      <div
        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-xs transition ${
          isAuthorized
            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
            : 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
        }`}
      >
        {isAuthorized ? (
          <Unlock className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        ) : (
          <Lock className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        )}
        <div className="flex-1">
          <span className="font-bold">
            {isAuthorized
              ? `Habilitation Gestionnaire Confirmée : ${currentRoleSimulation.label}`
              : 'Accès Consultation Seule (Droits Restreints) :'}
          </span>{' '}
          <span>{currentRoleSimulation.description}</span>
          {!isAuthorized && (
            <p className="mt-1 font-semibold text-amber-800 dark:text-amber-300">
              Astuce : Utilisez le sélecteur « Rôle Actif » ci-dessus pour passer en Gestionnaire ou Chef de Pavillon afin d’activer la modification des règles et l’ajout de PDF.
            </p>
          )}
        </div>
      </div>

      {/* Tabs Selector: Rules vs Delegates */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
        <button
          type="button"
          onClick={() => setActiveTab('RULES')}
          className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[44px] ${
            activeTab === 'RULES'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="size-4 sm:size-4.5 shrink-0" />
          <span className="hidden sm:inline">Règlement Intérieur & Conditions d'Admission</span>
          <span className="inline sm:hidden">Règles d'Admission</span>
          {rules && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
              {rules.status === 'OPEN' ? 'Attributions Ouvertes' : 'Liste d’attente'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DELEGATES')}
          className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[44px] ${
            activeTab === 'DELEGATES'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Users className="size-4 sm:size-4.5 shrink-0" />
          <span className="hidden sm:inline">Mandats des Délégués de Pavillon & Comités</span>
          <span className="inline sm:hidden">Délégués & Comités</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
            {contracts.length}
          </span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: RÈGLEMENT INTÉRIEUR & CONDITIONS D'ADMISSION                   */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'RULES' && (
        <div className="space-y-6">
          {isLoadingRules ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <span className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : !rules ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <AlertCircle className="mx-auto size-10 text-gray-400" />
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Aucun règlement intérieur configuré pour cette association.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
              {/* Colonne Gauche : Paramètres d'admission & Document PDF */}
              <div className="space-y-5 sm:space-y-6 lg:col-span-5 xl:col-span-4">
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Home className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Critères d'Admission & Caution</span>
                  </h2>

                  <div className="mt-4 space-y-4">
                    {/* Statut Campagne */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Statut des Attributions de Chambres
                      </label>
                      <Select2
                        aria-label="Statut des attributions de chambres"
                        disabled={!isAuthorized}
                        value={rules.status}
                        onChange={(e) =>
                          setRules({ ...rules, status: e.target.value as ApiResidenceAdmissionRules['status'] })
                        }
                        className="mt-1 w-full"
                      >
                        <option value="OPEN">Attributions Ouvertes (Dossiers acceptés)</option>
                        <option value="WAITLIST">Liste d'Attente Prioritaire</option>
                        <option value="CLOSED">Fermée (Pavillons complets)</option>
                      </Select2>
                    </div>

                    {/* Mode d'attribution */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Mode de Sélection des Dossiers
                      </label>
                      <Select2
                        aria-label="Mode de sélection des dossiers de résidence"
                        disabled={!isAuthorized}
                        value={rules.approvalMode}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            approvalMode: e.target.value as ApiResidenceAdmissionRules['approvalMode'],
                          })
                        }
                        className="mt-1 w-full"
                      >
                        <option value="COMMISSION_REVIEW">Commission d'Attribution & Examen Mixte</option>
                        <option value="SOCIAL_CRITERIA">Critères Sociaux & Priorité Boursiers</option>
                        <option value="FIRST_COME_FIRST_SERVED">Premier arrivé, premier servi complet</option>
                      </Select2>
                    </div>

                    {/* Dépôt de garantie */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Dépôt de Garantie (Caution en mois de loyer)
                      </label>
                      <input
                        type="number"
                        disabled={!isAuthorized}
                        value={rules.depositMonths}
                        onChange={(e) => setRules({ ...rules, depositMonths: Number(e.target.value) || 0 })}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 shadow-2xs disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                    </div>

                    {/* Frais de dossier */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Frais de Dossier Locataire (XOF)
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          disabled={!isAuthorized}
                          value={rules.applicationFeeXOF}
                          onChange={(e) => setRules({ ...rules, applicationFeeXOF: Number(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 shadow-2xs disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">FCFA</span>
                      </div>
                    </div>

                    {/* Durée minimale */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Durée Minimale du Bail (Mois)
                      </label>
                      <input
                        type="number"
                        disabled={!isAuthorized}
                        value={rules.minStayMonths}
                        onChange={(e) => setRules({ ...rules, minStayMonths: Number(e.target.value) || 0 })}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 shadow-2xs disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloc PDF Officiel Règlement des Résidences */}
                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-4 sm:p-6 shadow-xs dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-gray-900">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Paperclip className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Règlement des Résidences (PDF Officiel)</span>
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Document officiel remis à chaque résident lors de la remise des clés.
                  </p>

                  <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white/80 p-4 text-center dark:border-indigo-800 dark:bg-gray-800/80">
                    {rules.internalRegulationsPdfName ? (
                      <div className="space-y-3">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                          <FileText className="size-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {rules.internalRegulationsPdfName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {rules.internalRegulationsPdfSize || 'Règlement Intérieur Résidences'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleDownloadRulesPdf}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-teal-700 min-h-[40px] transition"
                          >
                            <Download className="size-3.5" />
                            <span>Télécharger Fiche PDF</span>
                          </button>
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => rulesFileInputRef.current?.click()}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 min-h-[40px] transition"
                            >
                              <Upload className="size-3.5" />
                              <span>Remplacer PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                          <Upload className="size-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Aucun PDF joint</p>
                          <p className="text-[11px] text-gray-500">Téléversez le règlement intérieur en PDF</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleDownloadRulesPdf}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300 min-h-[40px] transition"
                          >
                            <Download className="size-3.5" />
                            <span>Générer Fiche PDF</span>
                          </button>
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => rulesFileInputRef.current?.click()}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-teal-700 min-h-[40px] transition"
                            >
                              <Upload className="size-3.5" />
                              <span>Téléverser PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <input
                      ref={rulesFileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleRulesPdfChange}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-6 border-t border-indigo-100 pt-4 dark:border-indigo-900/40">
                    <button
                      type="button"
                      disabled={!isAuthorized || isSavingRules}
                      onClick={handleSaveRules}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50 min-h-[46px] active:scale-[0.99]"
                    >
                      {isSavingRules ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Enregistrement en cours...</span>
                        </>
                      ) : (
                        <>
                          <Check className="size-4" />
                          <span>Enregistrer le Règlement Intérieur</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Colonne Droite : Critères, Pièces requises & Articles */}
              <div className="space-y-5 sm:space-y-6 lg:col-span-7 xl:col-span-8">
                {/* 1. Critères d'éligibilité des résidents */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Critères d'Admission des Résidents</span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        Conditions obligatoires pour obtenir une chambre en résidence solidaire
                      </p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rules.eligibilityCriteria.length} critère{rules.eligibilityCriteria.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {rules.eligibilityCriteria.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-3 sm:p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <span className="font-medium text-gray-800 dark:text-gray-200 break-words">{criterion}</span>
                        </div>
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx)}
                            aria-label={`Supprimer le critère : ${criterion}`}
                            className="p-2 -mr-1 -my-1 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAuthorized && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Ajouter un critère d'admission (ex: Priorité étudiants boursiers)..."
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCriterion()}
                        className="w-full sm:flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCriterion}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 min-h-[42px] shrink-0 transition"
                      >
                        <Plus className="size-4" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Pièces Justificatives Obligatoires */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileCheck className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Pièces Justificatives du Dossier de Logement</span>
                      </h2>
                      <p className="text-xs text-gray-500">Documents exigés pour signer le bail et recevoir les clés</p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rules.requiredDocuments.length} pièce{rules.requiredDocuments.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {rules.requiredDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-3 sm:p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium text-gray-800 dark:text-gray-200 break-words">{doc}</span>
                        </div>
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(idx)}
                            aria-label={`Supprimer la pièce : ${doc}`}
                            className="p-2 -mr-1 -my-1 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAuthorized && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Ajouter une pièce requise (ex: Acte de caution solidaire légalisé)..."
                        value={newDoc}
                        onChange={(e) => setNewDoc(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDoc()}
                        className="w-full sm:flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddDoc}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 min-h-[42px] shrink-0 transition"
                      >
                        <Plus className="size-4" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Règlement Intérieur & Vivre-Ensemble */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="size-4.5 text-teal-600 shrink-0" />
                        <span>Articles du Règlement Intérieur & Vivre-Ensemble</span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        Règles applicables dans les chambres, couloirs, cuisines et cours communes
                      </p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rules.houseRulesArticles.length} article{rules.houseRulesArticles.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {rules.houseRulesArticles.map((article) => (
                      <div
                        key={article.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3.5 sm:p-4 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{article.title}</h3>
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHouseRule(article.id)}
                              aria-label={`Supprimer l'article : ${article.title}`}
                              className="p-2 -mr-1 -my-1 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1.5 text-gray-600 dark:text-gray-300 leading-relaxed">{article.content}</p>
                      </div>
                    ))}
                  </div>

                  {isAuthorized && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-gray-300 p-3.5 sm:p-4 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nouvel Article du Règlement</p>
                      <input
                        type="text"
                        placeholder="Titre de l'article (ex: Article 5 : Économie d'énergie et climatisation)..."
                        value={newRuleTitle}
                        onChange={(e) => setNewRuleTitle(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                      <textarea
                        rows={3}
                        placeholder="Contenu de la consigne..."
                        value={newRuleContent}
                        onChange={(e) => setNewRuleContent(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-medium text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white leading-relaxed min-h-[70px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddHouseRule}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-teal-700 min-h-[42px] transition"
                      >
                        <Plus className="size-4" />
                        <span>Ajouter l'Article</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: MANDATS DES DÉLÉGUÉS DE PAVILLON & COMITÉS                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'DELEGATES' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-500">Délégués Désignés</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{contracts.length}</p>
              <p className="mt-1 text-[11px] text-gray-500">Responsables de pavillon</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Mandats Actifs</p>
              <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {contracts.filter((c) => c.status === 'ACTIVE').length}
              </p>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">En fonction sur site</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">En Attente Signature</p>
              <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-400">
                {contracts.filter((c) => c.status === 'PENDING_SIGNATURE').length}
              </p>
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">À valider</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 shadow-2xs dark:border-teal-900/40 dark:bg-teal-950/20">
              <p className="text-xs font-medium text-teal-800 dark:text-teal-300">Pavillons Couverts</p>
              <p className="mt-1 text-2xl font-black text-teal-700 dark:text-teal-400">100%</p>
              <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400">Médiation de proximité</p>
            </div>
          </div>

          {/* Action Header & Filters */}
          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row flex-1 sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto sm:min-w-[220px] flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher délégué, pavillon, chambre..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-xs font-medium text-gray-900 shadow-2xs focus:border-teal-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Bâtiment Filter */}
              <div className="w-full sm:w-auto sm:min-w-[170px]">
                <Select2
                  aria-label="Filtrer par pavillon ou bâtiment"
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="ALL">Tous les Pavillons</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select2>
              </div>

              {/* Rôle Filter */}
              <div className="w-full sm:w-auto sm:min-w-[170px]">
                <Select2
                  aria-label="Filtrer par rôle de délégué"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="ALL">Tous les Rôles</option>
                  <option value="CHEF_PAVILLON">Chefs de Pavillon</option>
                  <option value="DELEGUE_RESIDENTS">Délégués Résidents</option>
                  <option value="RESPONSABLE_HYGIENE">Responsables Salubrité</option>
                  <option value="RESPONSABLE_SECURITE">Responsables Sécurité</option>
                  <option value="MEDIATEUR">Médiateurs de Conflits</option>
                </Select2>
              </div>
            </div>

            {/* Bouton Créer Mandat */}
            {isAuthorized ? (
              <button
                type="button"
                onClick={() => setIsCreateContractModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700"
              >
                <Plus className="size-4" />
                <span>Définir un Mandat de Délégué</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Lock className="size-3.5" />
                <span>Réservé aux gestionnaires de résidences</span>
              </div>
            )}
          </div>

          {/* Table des Mandats des Délégués */}
          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {isLoadingContracts ? (
              <div className="flex h-64 items-center justify-center">
                <span className="size-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto size-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Aucun mandat de délégué trouvé</p>
                <p className="mt-1 text-xs text-gray-500">
                  Définissez un mandat officiel pour désigner les chefs de pavillon et représentants des résidents.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                      <th className="px-5 py-3.5">Délégué & Titre</th>
                      <th className="px-4 py-3.5">Pavillon & Logement</th>
                      <th className="px-4 py-3.5">Rôle & Type d'Acte</th>
                      <th className="px-4 py-3.5">Validité & Avantage</th>
                      <th className="px-4 py-3.5">Document PDF</th>
                      <th className="px-4 py-3.5">Statut</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs dark:divide-gray-800">
                    {filteredContracts.map((c) => (
                      <tr key={c.id} className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                        {/* Délégué */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 font-bold text-white shadow-2xs">
                              {c.delegateName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{c.delegateName}</p>
                              <p className="text-[11px] text-gray-500">{c.positionTitle}</p>
                              <p className="text-[10px] font-mono text-gray-400">{c.contractNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Pavillon */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">{c.buildingName || 'Pavillon Principal'}</p>
                          <p className="text-[11px] text-gray-500">{c.roomNumber || 'Logement non assigné'}</p>
                        </td>

                        {/* Rôle */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              c.delegateRole === 'CHEF_PAVILLON'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
                                : c.delegateRole === 'RESPONSABLE_HYGIENE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                            }`}
                          >
                            {c.delegateRole}
                          </span>
                        </td>

                        {/* Période */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {c.termStartDate} &rarr; {c.termEndDate}
                          </p>
                          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                            {c.monthlyRentReductionXOF > 0
                              ? `-${c.monthlyRentReductionXOF.toLocaleString('fr-FR')} FCFA/mois de loyer`
                              : 'Bénévolat solidaire'}
                          </p>
                        </td>

                        {/* Document PDF */}
                        <td className="px-4 py-4">
                          {c.pdfFileName ? (
                            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                              <Paperclip className="size-3.5 shrink-0" />
                              <div className="truncate max-w-[130px]">
                                <p className="text-[11px] font-bold truncate">{c.pdfFileName}</p>
                                <p className="text-[10px] text-gray-400">{c.pdfFileSize || 'PDF joint'}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                              <FileText className="size-3 text-teal-500" />
                              Générable jsPDF
                            </span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-4">
                          {c.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <CheckCircle2 className="size-3" />
                              Actif & Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <Clock className="size-3" />
                              En Attente
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadContractPdf(c)}
                              title="Télécharger le mandat en PDF"
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-teal-700 shadow-2xs hover:bg-teal-50 dark:border-gray-700 dark:bg-gray-800 dark:text-teal-300"
                            >
                              <Download className="size-3" />
                              PDF
                            </button>

                            {isAuthorized && (
                              <button
                                type="button"
                                onClick={() => {
                                  setContractForUpload(c);
                                  setIsUploadPdfModalOpen(true);
                                }}
                                title="Attacher un document PDF officiel scanné"
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                <Upload className="size-3" />
                                Joindre
                              </button>
                            )}

                            {isAuthorized && c.status === 'PENDING_SIGNATURE' && (
                              <button
                                type="button"
                                onClick={() => handleSignContract(c)}
                                title="Valider et signer électroniquement"
                                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-teal-700"
                              >
                                <FileCheck className="size-3" />
                                Signer
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDetailsContract(c)}
                              title="Consulter les détails du mandat"
                              className="rounded-lg p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <Eye className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1 : DÉFINIR UN MANDAT DE DÉLÉGUÉ DE RÉSIDENCE                    */}
      {/* --------------------------------------------------------------------- */}
      {isCreateContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                  <FileSignature className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Définir un Mandat de Délégué de Pavillon / Résidence
                  </h3>
                  <p className="text-xs text-gray-500">
                    Association : {activeAssociation?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateContractModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Nom Complet du Délégué / Résident *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Benoît Ahouanmenou"
                    value={newContractForm.delegateName}
                    onChange={(e) => setNewContractForm({ ...newContractForm, delegateName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Intitulé Officiel du Mandat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chef de Pavillon Hassan II"
                    value={newContractForm.positionTitle}
                    onChange={(e) => setNewContractForm({ ...newContractForm, positionTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Pavillon de Rattachement</label>
                  <Select2
                    aria-label="Pavillon de rattachement du délégué"
                    value={newContractForm.buildingId}
                    onChange={(e) => setNewContractForm({ ...newContractForm, buildingId: e.target.value })}
                    className="mt-1 w-full"
                  >
                    <option value="">Sélectionner un pavillon...</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select2>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Numéro de Chambre</label>
                  <input
                    type="text"
                    placeholder="Ex: Chambre 101"
                    value={newContractForm.roomNumber}
                    onChange={(e) => setNewContractForm({ ...newContractForm, roomNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Rôle de Délégué</label>
                  <Select2
                    aria-label="Rôle du délégué de résidence"
                    value={newContractForm.delegateRole}
                    onChange={(e) =>
                      setNewContractForm({
                        ...newContractForm,
                        delegateRole: e.target.value as ApiResidentDelegateContract['delegateRole'],
                      })
                    }
                    className="mt-1 w-full"
                  >
                    <option value="CHEF_PAVILLON">Chef de Pavillon (Responsable de Site)</option>
                    <option value="DELEGUE_RESIDENTS">Délégué(e) Général(e) des Résidents</option>
                    <option value="RESPONSABLE_HYGIENE">Responsable Salubrité &amp; Communs</option>
                    <option value="RESPONSABLE_SECURITE">Responsable Sécurité &amp; Veille</option>
                    <option value="MEDIATEUR">Médiateur des Conflits de Chambrée</option>
                  </Select2>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Réduction Loyer Mensuelle (XOF)</label>
                  <input
                    type="number"
                    value={newContractForm.monthlyRentReductionXOF}
                    onChange={(e) => setNewContractForm({ ...newContractForm, monthlyRentReductionXOF: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Délégation & Obligation */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Délégation Spécifique accordée au Délégué
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Signature conjointe des états des lieux et tenue du registre des pannes"
                    value={newContractForm.delegation1}
                    onChange={(e) => setNewContractForm({ ...newContractForm, delegation1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Obligation Déontologique du Délégué
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Neutralité absolue, respect de la vie privée et devoir d'alerte immédiat"
                    value={newContractForm.obligation1}
                    onChange={(e) => setNewContractForm({ ...newContractForm, obligation1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Option PDF direct */}
              <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-4 dark:border-teal-800 dark:bg-teal-950/20">
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <Upload className="size-4 text-teal-600" />
                  Option : Joindre un document PDF officiel scanné (PV de désignation, arrêté...)
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.type !== 'application/pdf') {
                        showToast('Veuillez sélectionner un fichier PDF valide.', 'error');
                        return;
                      }
                      const sizeStr =
                        file.size > 1024 * 1024
                          ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
                          : `${Math.round(file.size / 1024)} Ko`;
                      setUploadedFileName(file.name);
                      setUploadedFileSize(sizeStr);

                      const reader = new FileReader();
                      reader.onload = () => setUploadedFileData(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-teal-700"
                  />
                  {uploadedFileName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 truncate max-w-xs">
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      <span>{uploadedFileName} ({uploadedFileSize})</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateContractModalOpen(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
                >
                  Valider et Émettre le Mandat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2 : JOINDRE UN DOCUMENT PDF À UN MANDAT EXISTANT                 */}
      {/* --------------------------------------------------------------------- */}
      {isUploadPdfModalOpen && contractForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Upload className="size-5 text-teal-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rattacher un Document PDF</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadPdfModalOpen(false);
                  setContractForUpload(null);
                }}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Rattachez un fichier PDF scanné pour le délégué{' '}
                <strong className="text-gray-900 dark:text-white">{contractForUpload.delegateName}</strong> (
                {contractForUpload.contractNumber}) :
              </p>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-teal-500 dark:border-gray-700">
                <Upload className="mx-auto size-8 text-gray-400" />
                <p className="mt-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                  Sélectionnez le document PDF
                </p>
                <p className="text-[10px] text-gray-500">Format .pdf uniquement (PV d'élection de pavillon...)</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelectedForContract}
                  className="mt-3 block w-full text-xs text-gray-500 file:mr-2 file:rounded-xl file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadPdfModalOpen(false);
                    setContractForUpload(null);
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 3 : CONSULTATION DÉTAILLÉE D'UN MANDAT DE DÉLÉGUÉ                */}
      {/* --------------------------------------------------------------------- */}
      {detailsContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-600">
                  {detailsContract.contractNumber}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{detailsContract.positionTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsContract(null)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{detailsContract.delegateName}</p>
                <p className="text-gray-500">
                  Pavillon : {detailsContract.buildingName || 'Toutes Résidences'} • Chambre : {detailsContract.roomNumber || 'Non renseigné'}
                </p>
                <p className="text-gray-500 mt-1">
                  Validité : Du {detailsContract.termStartDate} au {detailsContract.termEndDate}
                </p>
                <p className="text-gray-500">
                  Réduction de loyer accordée :{' '}
                  {detailsContract.monthlyRentReductionXOF > 0
                    ? `${detailsContract.monthlyRentReductionXOF.toLocaleString('fr-FR')} FCFA / mois`
                    : 'Bénévolat solidaire'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Prérogatives et Délégations de Pavillon :</h4>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 text-gray-600 dark:text-gray-300">
                  {detailsContract.delegations.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Engagements Déontologiques :</h4>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 text-gray-600 dark:text-gray-300">
                  {detailsContract.ethicalObligations.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    detailsContract.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {detailsContract.status === 'ACTIVE' ? 'Mandat Actif & Validé' : 'En Attente de Signature'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadContractPdf(detailsContract)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
                  >
                    <Download className="size-3.5" />
                    Télécharger Mandat PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsContract(null)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
