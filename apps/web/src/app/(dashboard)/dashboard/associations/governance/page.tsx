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
  ExternalLink,
  History,
  Calendar,
  Hash,
  Coins,
  Award,
} from 'lucide-react';
import { useActiveAssociation } from '@/context/AssociationContext';
import {
  apiService,
  ApiAssociation,
  ApiAssociationIntegrationRules,
  ApiAssociationExecutiveContract,
  ApiMandateAuditAction,
  ApiMandatePeriodSummary,
  ApiAssociationMandate,
  ApiMandateOfficer,
} from '@/lib/api';
import { ExecutiveContractPdfService } from '@/features/associations/services/executive-contract-pdf.service';
import { IntegrationRulesPdfService } from '@/features/associations/services/integration-rules-pdf.service';
import { MandateReportPdfService } from '@/features/associations/services/mandate-report-pdf.service';
import { associationApiService, AssociationMember } from '@/features/associations';
import { usePermissions } from '@/features/auth';
import { AccessRestricted } from '@/components/auth/AccessRestricted';

type GovernanceRole = 'PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'BOARD_MEMBER' | 'MEMBER';

interface UserRoleSimulation {
  role: GovernanceRole;
  label: string;
  isAuthorized: boolean;
  description: string;
}

const ROLE_SIMULATIONS: UserRoleSimulation[] = [
  {
    role: 'PRESIDENT',
    label: 'Président(e) du Bureau (Accès Complet)',
    isAuthorized: true,
    description: 'Pouvoir exécutif complet, signature des mandats et révision des règles d’intégration.',
  },
  {
    role: 'SECRETARY',
    label: 'Secrétaire Général(e) (Gestion des Actes)',
    isAuthorized: true,
    description: 'Rédaction des procès-verbaux, tenue des registres et pièces d’adhésion.',
  },
  {
    role: 'TREASURER',
    label: 'Trésorier(e) Général(e) (Finances & Mandats)',
    isAuthorized: true,
    description: 'Gestion des cotisations, délégations financières et baux solidaires.',
  },
  {
    role: 'MEMBER',
    label: 'Membre Simple Adhérent (Lecture Seule)',
    isAuthorized: false,
    description: 'Consultation restreinte des chartes publiques. Modifications désactivées.',
  },
];

const HANDOVER_CHECKLIST_ITEMS: string[] = [
  'Sceau officiel et cachets statutaires remis',
  'Registres légaux et procès-verbaux d’AG transmis',
  'Comptes bancaires & Mobile Money transférés',
  'Inventaire des actifs et biens associatifs vérifié',
  'Clés des bureaux et locaux associatifs restituées',
  'Codes et accès plateforme My Community transmis',
];

export default function AssociationGovernancePage() {
  const { isExecutive } = usePermissions();
  const { associations, activeAssociationId, activeAssociation, setActiveAssociationId } = useActiveAssociation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'MANDATURES_AND_HANDOVER' | 'RULES' | 'EXECUTIVE_CONTRACTS' | 'MANDATE_AUDIT_TRAIL'
  >('MANDATURES_AND_HANDOVER');

  // Mandatures & Passation de Service Dynamiques
  const [mandates, setMandates] = useState<ApiAssociationMandate[]>([]);
  const [isLoadingMandates, setIsLoadingMandates] = useState(false);
  const [isCreateMandateModalOpen, setIsCreateMandateModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [editingMandate, setEditingMandate] = useState<ApiAssociationMandate | null>(null);

  // Formulaire Création / Édition de Mandature (100% Dynamique sans aucune valeur en dur)
  const currentYear = new Date().getFullYear();
  const [mandateTitleForm, setMandateTitleForm] = useState('');
  const [mandateAcademicYearForm, setMandateAcademicYearForm] = useState(`${currentYear}-${currentYear + 1}`);
  const [mandateStartDateForm, setMandateStartDateForm] = useState(`${currentYear}-01-01`);
  const [mandateEndDateForm, setMandateEndDateForm] = useState(`${currentYear + 1}-12-31`);
  const [mandatePresidentForm, setMandatePresidentForm] = useState('');
  const [mandateSecretaryForm, setMandateSecretaryForm] = useState('');
  const [mandateTreasurerForm, setMandateTreasurerForm] = useState('');

  // Formulaire Passation de Service (Transmission des pouvoirs & Quitus)
  const [handoverOutgoingMandateId, setHandoverOutgoingMandateId] = useState('');
  const [handoverIncomingMandateId, setHandoverIncomingMandateId] = useState('');
  const [handoverIncomingPresident, setHandoverIncomingPresident] = useState('');
  const [handoverIncomingSecretary, setHandoverIncomingSecretary] = useState('');
  const [handoverIncomingTreasurer, setHandoverIncomingTreasurer] = useState('');
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().slice(0, 10));
  const [handoverTreasuryAmount, setHandoverTreasuryAmount] = useState<number>(0);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [selectedHandoverChecks, setSelectedHandoverChecks] = useState<string[]>([
    'Sceau officiel et cachets statutaires remis',
    'Registres légaux et procès-verbaux d’AG transmis',
    'Comptes bancaires & Mobile Money transférés',
    'Clés des bureaux et locaux associatifs restituées',
    'Codes et accès plateforme My Community transmis',
  ]);

  // Traçabilité & Registre des Actes du Mandat (100% Dynamique)
  const [mandateActions, setMandateActions] = useState<ApiMandateAuditAction[]>([]);
  const [isLoadingMandateActions, setIsLoadingMandateActions] = useState(false);
  const [mandatePeriods, setMandatePeriods] = useState<string[]>([]);
  const [selectedMandatePeriod, setSelectedMandatePeriod] = useState<string>('');
  const [mandateCategoryFilter, setMandateCategoryFilter] = useState<string>('ALL');
  const [mandateSearchFilter, setMandateSearchFilter] = useState<string>('');
  const [mandateSummary, setMandateSummary] = useState<ApiMandatePeriodSummary | null>(null);
  const [isGeneratingMandatePdf, setIsGeneratingMandatePdf] = useState(false);
  const [selectedAuditActionDetails, setSelectedAuditActionDetails] = useState<ApiMandateAuditAction | null>(null);

  if (!isExecutive) {
    return (
      <AccessRestricted
        title="Règles de Gouvernance & Mandats Exécutifs Confidentiels"
        description="Les règles internes de gouvernance, délégations de signature, mandats électifs des dirigeants et indemnités de fonction constituent des secrets associatifs réservés au bureau exécutif et aux autorités de tutelle."
        requiredRole="Président(e), Secrétaire Général(e) ou Bureau Exécutif"
        backHref="/dashboard/associations"
        backLabel="Retour à l'annuaire des associations"
      />
    );
  }

  // Simulation de rôle actif (contrôle d'accès)
  const [currentRoleSimulation, setCurrentRoleSimulation] = useState<UserRoleSimulation>(ROLE_SIMULATIONS[0]);

  // Règles d'intégration
  const [rules, setRules] = useState<ApiAssociationIntegrationRules | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Formulaire d'édition des règles d'intégration
  const [newCriterion, setNewCriterion] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const [newCharterTitle, setNewCharterTitle] = useState('');
  const [newCharterContent, setNewCharterContent] = useState('');

  // Contrats des hauts dirigeants
  const [contracts, setContracts] = useState<ApiAssociationExecutiveContract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals state
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [contractForUpload, setContractForUpload] = useState<ApiAssociationExecutiveContract | null>(null);
  const [detailsContract, setDetailsContract] = useState<ApiAssociationExecutiveContract | null>(null);

  // New contract form
  const [newContractForm, setNewContractForm] = useState({
    officerName: '',
    officerPhone: '',
    officerEmail: '',
    officerRole: 'BOARD_MEMBER' as ApiAssociationExecutiveContract['officerRole'],
    positionTitle: '',
    type: 'MANDAT_ELECTIF' as ApiAssociationExecutiveContract['type'],
    termStartDate: '2026-01-01',
    termEndDate: '2028-01-01',
    monthlyIndemnityXOF: 0,
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

  // 0. Charger les mandatures officielles de l'association
  const loadMandates = async () => {
    if (!activeAssociationId) return;
    setIsLoadingMandates(true);
    try {
      const list = await apiService.mandates.list(activeAssociationId);
      setMandates(list);
      if (list.length > 0) {
        const dynamicPeriods = list.map((m) => `${m.title} (${m.academicYear})`);
        setMandatePeriods((prev) => Array.from(new Set([...dynamicPeriods, ...prev])));
        if (!selectedMandatePeriod) {
          const active = list.find((m) => m.status === 'ACTIVE') || list[0];
          setSelectedMandatePeriod(`${active.title} (${active.academicYear})`);
        }
      }
    } catch (err) {
      console.warn('Erreur chargement des mandatures:', err);
    } finally {
      setIsLoadingMandates(false);
    }
  };

  const [assocMembers, setAssocMembers] = useState<AssociationMember[]>([]);

  useEffect(() => {
    loadMandates();
    if (activeAssociationId) {
      associationApiService.listMembers(activeAssociationId)
        .then((mList: AssociationMember[]) => setAssocMembers(mList))
        .catch(() => setAssocMembers([]));
    } else {
      setAssocMembers([]);
    }
  }, [activeAssociationId]);

  const handleOpenCreateMandate = () => {
    setEditingMandate(null);
    setMandateTitleForm('');
    setMandateAcademicYearForm(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    setMandateStartDateForm(`${new Date().getFullYear()}-01-01`);
    setMandateEndDateForm(`${new Date().getFullYear() + 1}-12-31`);
    setMandatePresidentForm(activeAssociation?.members?.find((m) => m.roles.includes('PRESIDENT'))?.userName || '');
    setMandateSecretaryForm('');
    setMandateTreasurerForm('');
    setIsCreateMandateModalOpen(true);
  };

  const handleOpenEditMandate = (mandate: ApiAssociationMandate) => {
    setEditingMandate(mandate);
    setMandateTitleForm(mandate.title);
    setMandateAcademicYearForm(mandate.academicYear);
    setMandateStartDateForm(mandate.startDate.slice(0, 10));
    setMandateEndDateForm(mandate.endDate ? mandate.endDate.slice(0, 10) : '');
    setMandatePresidentForm(mandate.presidentName);
    setMandateSecretaryForm(mandate.secretaryName || '');
    setMandateTreasurerForm(mandate.treasurerName || '');
    setIsCreateMandateModalOpen(true);
  };

  const handleSaveMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssociationId || !mandateTitleForm.trim()) return;
    try {
      if (editingMandate) {
        await apiService.mandates.update(activeAssociationId, editingMandate.id, {
          title: mandateTitleForm.trim(),
          academicYear: mandateAcademicYearForm.trim(),
          startDate: mandateStartDateForm,
          endDate: mandateEndDateForm || undefined,
          presidentName: mandatePresidentForm.trim() || undefined,
          secretaryName: mandateSecretaryForm.trim() || undefined,
          treasurerName: mandateTreasurerForm.trim() || undefined,
        });
        showToast(`Mandature « ${mandateTitleForm} » mise à jour avec succès !`);
      } else {
        await apiService.mandates.create(activeAssociationId, {
          title: mandateTitleForm.trim(),
          academicYear: mandateAcademicYearForm.trim(),
          startDate: mandateStartDateForm,
          endDate: mandateEndDateForm || undefined,
          presidentName: mandatePresidentForm.trim() || 'Président(e)',
          secretaryName: mandateSecretaryForm.trim() || undefined,
          treasurerName: mandateTreasurerForm.trim() || undefined,
        });
        showToast(`Mandature « ${mandateTitleForm} » créée avec succès !`);
      }
      setIsCreateMandateModalOpen(false);
      await loadMandates();
    } catch {
      showToast('Erreur lors de l’enregistrement de la mandature.', 'error');
    }
  };

  const handleActivateMandate = async (mandateId: string) => {
    if (!activeAssociationId) return;
    try {
      await apiService.mandates.activate(activeAssociationId, mandateId);
      showToast('Mandature activée comme bureau exécutif en exercice !');
      await loadMandates();
    } catch {
      showToast('Erreur lors de l’activation de la mandature.', 'error');
    }
  };

  const handleOpenHandoverModal = () => {
    const activeMandate = mandates.find((m) => m.status === 'ACTIVE') || mandates[0];
    setHandoverOutgoingMandateId(activeMandate?.id || '');
    setHandoverIncomingMandateId('');
    setHandoverIncomingPresident('');
    setHandoverIncomingSecretary('');
    setHandoverIncomingTreasurer('');
    setHandoverTreasuryAmount(activeAssociation?.treasuryBalanceXOF || 0);
    setHandoverNotes('');
    setIsHandoverModalOpen(true);
  };

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssociationId || !handoverOutgoingMandateId || !handoverIncomingPresident.trim()) {
      showToast('Veuillez renseigner les champs obligatoires de passation.', 'error');
      return;
    }
    try {
      const res = await apiService.mandates.handover(activeAssociationId, {
        outgoingMandateId: handoverOutgoingMandateId,
        incomingMandateId: handoverIncomingMandateId || undefined,
        incomingPresidentName: handoverIncomingPresident.trim(),
        incomingSecretaryName: handoverIncomingSecretary.trim() || undefined,
        incomingTreasurerName: handoverIncomingTreasurer.trim() || undefined,
        handoverDate,
        treasuryTransferredAmount: Number(handoverTreasuryAmount) || 0,
        handoverNotes: handoverNotes.trim(),
        checklist: selectedHandoverChecks,
      });

      // Enregistrer également dans le grand journal d'audit immuable
      await apiService.mandateAuditTrail.recordAction({
        associationId: activeAssociationId,
        mandatePeriod: res.mandate?.academicYear
          ? `Mandat ${res.mandate.academicYear}`
          : `Passation ${handoverDate.slice(0, 4)}`,
        actorId: 'pres-handover',
        actorName: handoverIncomingPresident.trim(),
        actorRole: 'Président(e) Entrant(e)',
        category: 'GOVERNANCE',
        actionType: 'SERVICE_HANDOVER',
        actionTitle: `Passation officielle de service & Quitus moral et financier (${res.pvDocumentRef})`,
        resourceType: 'HANDOVER_PV',
        resourceId: res.pvDocumentRef,
        amountXOF: Number(handoverTreasuryAmount) || 0,
        details: `Transmission officielle des pouvoirs, sceaux, registres et solde de trésorerie de ${Number(handoverTreasuryAmount).toLocaleString('fr-FR')} FCFA. Notes: ${handoverNotes || 'Passation conforme.'}`,
      });

      setIsHandoverModalOpen(false);
      showToast(`Passation de service validée ! PV officiel généré : ${res.pvDocumentRef}`);
      await loadMandates();
    } catch {
      showToast('Erreur lors de la passation de service.', 'error');
    }
  };

  // 1. Charger les règles d'intégration
  useEffect(() => {
    let isMounted = true;
    async function loadRules() {
      if (!activeAssociationId) return;
      setIsLoadingRules(true);
      try {
        const data = await apiService.associationIntegrationRules.get(activeAssociationId);
        if (isMounted) setRules(data);
      } catch (err) {
        console.warn('Erreur chargement des règles d’intégration:', err);
      } finally {
        if (isMounted) setIsLoadingRules(false);
      }
    }
    loadRules();
    return () => {
      isMounted = false;
    };
  }, [activeAssociationId]);

  // 2. Charger les contrats des hauts dirigeants
  useEffect(() => {
    let isMounted = true;
    async function loadContracts() {
      if (!activeAssociationId) return;
      setIsLoadingContracts(true);
      try {
        const list = await apiService.associationExecutiveContracts.getByAssociation(activeAssociationId);
        if (isMounted) setContracts(list);
      } catch (err) {
        console.warn('Erreur chargement contrats dirigeants:', err);
      } finally {
        if (isMounted) setIsLoadingContracts(false);
      }
    }
    loadContracts();
    return () => {
      isMounted = false;
    };
  }, [activeAssociationId]);

  // 3. Charger le journal d'audit et la synthèse du mandat
  useEffect(() => {
    let isMounted = true;
    async function loadMandateAuditTrail() {
      if (!activeAssociationId) return;
      setIsLoadingMandateActions(true);
      try {
        const [periods, actions, summary] = await Promise.all([
          apiService.mandateAuditTrail.listMandatePeriods(activeAssociationId),
          apiService.mandateAuditTrail.listActions({
            associationId: activeAssociationId,
            mandatePeriod: selectedMandatePeriod || undefined,
            category: mandateCategoryFilter !== 'ALL' ? mandateCategoryFilter : undefined,
            searchTerm: mandateSearchFilter || undefined,
          }),
          apiService.mandateAuditTrail.getMandateSummary(activeAssociationId, selectedMandatePeriod || undefined),
        ]);
        if (isMounted) {
          setMandatePeriods(periods);
          if (!selectedMandatePeriod && periods.length > 0) {
            setSelectedMandatePeriod(periods[0]);
          }
          setMandateActions(actions);
          setMandateSummary(summary);
        }
      } catch (err) {
        console.warn('Erreur chargement du journal d’audit du mandat:', err);
      } finally {
        if (isMounted) setIsLoadingMandateActions(false);
      }
    }
    loadMandateAuditTrail();
    return () => {
      isMounted = false;
    };
  }, [activeAssociationId, selectedMandatePeriod, mandateCategoryFilter, mandateSearchFilter]);

  // Télécharger le Procès-Verbal Officiel de Traçabilité du Mandat en PDF
  const handleDownloadMandateAuditPdf = async () => {
    if (!activeAssociation || !mandateSummary) return;
    setIsGeneratingMandatePdf(true);
    try {
      await MandateReportPdfService.generateAndDownload({
        associationName: activeAssociation.name,
        associationAcronym: activeAssociation.acronym,
        summary: mandateSummary,
        actions: mandateActions,
      });
      showToast('Procès-Verbal Officiel de Traçabilité du Mandat téléchargé avec succès !');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération du document PDF de traçabilité.', 'error');
    } finally {
      setIsGeneratingMandatePdf(false);
    }
  };

  // Gestion des règles d'intégration : Ajout / Suppression de critères
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

  // Gestion des pièces requises
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

  // Gestion de la charte
  const handleAddCharterArticle = () => {
    if (!newCharterTitle.trim() || !newCharterContent.trim() || !rules || !isAuthorized) return;
    setRules({
      ...rules,
      charterArticles: [
        ...rules.charterArticles,
        {
          id: `art-${Date.now()}`,
          title: newCharterTitle.trim(),
          content: newCharterContent.trim(),
        },
      ],
    });
    setNewCharterTitle('');
    setNewCharterContent('');
  };

  const handleRemoveCharterArticle = (id: string) => {
    if (!rules || !isAuthorized) return;
    setRules({
      ...rules,
      charterArticles: rules.charterArticles.filter((a) => a.id !== id),
    });
  };

  // Sauvegarde des règles d'intégration
  const handleSaveRules = async () => {
    if (!rules || !activeAssociationId || !isAuthorized) return;
    setIsSavingRules(true);
    try {
      const updated = await apiService.associationIntegrationRules.update(activeAssociationId, {
        ...rules,
        updatedByUserName: currentRoleSimulation.label.split('(')[0].trim(),
        updatedByUserRole: currentRoleSimulation.role,
      });
      setRules(updated);
      showToast('Règles d’intégration et charte mises à jour avec succès !');
    } catch {
      showToast('Erreur lors de la sauvegarde des règles.', 'error');
    } finally {
      setIsSavingRules(false);
    }
  };

  // Téléversement PDF pour le Règlement intérieur
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
        const updated = await apiService.associationIntegrationRules.uploadPdf(
          rules.associationId,
          file.name,
          result,
          sizeStr
        );
        setRules(updated);
        showToast(`Règlement intérieur « ${file.name} » rattaché avec succès !`);
      } catch {
        showToast('Erreur lors du rattachement du fichier PDF.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Télécharger la fiche PDF des règles d'intégration
  const handleDownloadRulesPdf = async () => {
    if (!rules) return;
    try {
      await IntegrationRulesPdfService.generateAndDownload(rules);
      showToast('Fiche officielle des règles d’intégration téléchargée en PDF !');
    } catch {
      showToast('Erreur lors de la génération du document PDF.', 'error');
    }
  };

  // Création d'un nouveau contrat de haut dirigeant
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssociationId || !activeAssociation || !isAuthorized) return;
    if (!newContractForm.officerName || !newContractForm.positionTitle) {
      showToast('Veuillez renseigner le nom du dirigeant et son intitulé de poste.', 'error');
      return;
    }

    try {
      const contractCount = contracts.length + 1;
      const contractNumber = `MANDAT-${(activeAssociation.acronym || 'ASSOC').toUpperCase()}-2026-${String(contractCount).padStart(3, '0')}`;

      const delegations = [
        newContractForm.delegation1.trim() || 'Représentation officielle et administration générale du pôle de responsabilité',
      ];
      if (newContractForm.delegation2.trim()) {
        delegations.push(newContractForm.delegation2.trim());
      }

      const ethicalObligations = [
        newContractForm.obligation1.trim() || 'Obligation absolue de probité, de transparence financière et de neutralité républicaine',
      ];
      if (newContractForm.obligation2.trim()) {
        ethicalObligations.push(newContractForm.obligation2.trim());
      }

      const created = await apiService.associationExecutiveContracts.create({
        associationId: activeAssociationId,
        associationName: activeAssociation.name,
        associationAcronym: activeAssociation.acronym,
        contractNumber,
        officerUserId: `u-officer-${Date.now()}`,
        officerName: newContractForm.officerName.trim(),
        officerPhone: newContractForm.officerPhone.trim() || undefined,
        officerEmail: newContractForm.officerEmail.trim() || undefined,
        officerRole: newContractForm.officerRole,
        positionTitle: newContractForm.positionTitle.trim(),
        type: newContractForm.type,
        status: 'PENDING_SIGNATURE',
        termStartDate: newContractForm.termStartDate,
        termEndDate: newContractForm.termEndDate,
        delegations,
        ethicalObligations,
        monthlyIndemnityXOF: Number(newContractForm.monthlyIndemnityXOF) || 0,
        isSigned: false,
        signatorySupervisorName: newContractForm.signatorySupervisorName.trim() || 'Présidence / Assemblée Générale',
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
        officerName: '',
        officerPhone: '',
        officerEmail: '',
        officerRole: 'BOARD_MEMBER',
        positionTitle: '',
        type: 'MANDAT_ELECTIF',
        termStartDate: '2026-01-01',
        termEndDate: '2028-01-01',
        monthlyIndemnityXOF: 0,
        delegation1: '',
        delegation2: '',
        obligation1: '',
        obligation2: '',
        signatorySupervisorName: '',
      });
      showToast(`Mandat officiel « ${contractNumber} » pour ${created.officerName} créé avec succès !`);
    } catch {
      showToast('Erreur lors de la création du mandat.', 'error');
    }
  };

  // Signature électronique d'un mandat
  const handleSignContract = async (contract: ApiAssociationExecutiveContract) => {
    if (!isAuthorized) {
      showToast('Action non autorisée. Seuls les dirigeants habilités peuvent signer.', 'error');
      return;
    }
    try {
      const updated = await apiService.associationExecutiveContracts.sign(contract.id, contract.officerName);
      setContracts(contracts.map((c) => (c.id === contract.id ? updated : c)));
      showToast(`Mandat « ${contract.contractNumber} » signé avec succès ! Statut désormais ACTIF.`);
    } catch {
      showToast('Erreur lors de la signature du mandat.', 'error');
    }
  };

  // Téléchargement du contrat PDF d'un dirigeant
  const handleDownloadContractPdf = async (contract: ApiAssociationExecutiveContract) => {
    try {
      if (contract.pdfFileData) {
        // Si un fichier PDF réel a été attaché, on le télécharge directement
        const link = document.createElement('a');
        link.href = contract.pdfFileData;
        link.download = contract.pdfFileName || `Mandat_${contract.contractNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Document PDF officiel « ${contract.pdfFileName || contract.contractNumber} » téléchargé !`);
      } else {
        // Sinon génération vectorielle jsPDF
        await ExecutiveContractPdfService.generateAndDownload(contract);
        showToast(`Contrat de mandat officiel « ${contract.contractNumber} » généré en PDF !`);
      }
    } catch {
      showToast('Erreur lors du téléchargement du contrat PDF.', 'error');
    }
  };

  // Gestion du téléversement de PDF pour un contrat existant
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
        const updated = await apiService.associationExecutiveContracts.uploadPdf(
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
      if (roleFilter !== 'ALL' && c.officerRole !== roleFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchName = c.officerName.toLowerCase().includes(q);
        const matchTitle = c.positionTitle.toLowerCase().includes(q);
        const matchNumber = c.contractNumber.toLowerCase().includes(q);
        return matchName || matchTitle || matchNumber;
      }
      return true;
    });
  }, [contracts, roleFilter, statusFilter, searchFilter]);

  // KPIs Contrats
  const activeContractsCount = contracts.filter((c) => c.status === 'ACTIVE').length;
  const pendingContractsCount = contracts.filter((c) => c.status === 'PENDING_SIGNATURE').length;

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

      {/* Main Governance Header with Scope & Role Simulation */}
      <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:from-gray-900 dark:via-gray-900/90 dark:to-indigo-950/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                <ShieldCheck className="size-3.5" />
                GOUVERNANCE & RÈGLEMENTS OFFICIELS
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle2 className="size-3" />
                Conforme Directives République du Bénin
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              Règles d’Intégration & Mandats des Hauts Dirigeants
            </h1>
            <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Paramétrez les critères et pièces d’adhésion pour les nouveaux membres, et édictez les contrats de mandat
              officiels, délégations de pouvoirs et chartes déontologiques des dirigeants avec support PDF officiel.
            </p>
          </div>

          {/* Association Switcher & Simulation */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
            {/* Association Select */}
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[240px]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Association Active
              </label>
              <Select2
                aria-label="Sélection de l'association active"
                value={activeAssociationId}
                onChange={(e) => setActiveAssociationId(e.target.value)}
                className="w-full"
              >
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.acronym || 'Bénin'})
                  </option>
                ))}
              </Select2>
            </div>

            {/* Role Simulation Selector (Pour tester les permissions) */}
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[220px]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Lock className="size-3 text-indigo-600 dark:text-indigo-400" />
                Rôle Actif (Droits d'accès)
              </label>
              <Select2
                aria-label="Simulateur de rôle actif"
                value={currentRoleSimulation.role}
                onChange={(e) => {
                  const found = ROLE_SIMULATIONS.find((r) => r.role === e.target.value);
                  if (found) {
                    setCurrentRoleSimulation(found);
                    showToast(`Mode commuté : ${found.label}`, 'info');
                  }
                }}
                className="w-full"
              >
                {ROLE_SIMULATIONS.map((sim) => (
                  <option key={sim.role} value={sim.role}>
                    {sim.label}
                  </option>
                ))}
              </Select2>
            </div>
          </div>
        </div>

        {/* Security Permission Alert Banner */}
        <div
          className={`mt-5 flex items-start gap-3 rounded-2xl border p-3.5 text-xs transition ${
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
                ? `Habilitation Exécutive Confirmée : ${currentRoleSimulation.label}`
                : 'Accès Consultation Seule (Droits Restreints) :'}
            </span>{' '}
            <span>{currentRoleSimulation.description}</span>
            {!isAuthorized && (
              <p className="mt-1 font-semibold text-amber-800 dark:text-amber-300">
                Astuce : Vous pouvez utiliser le sélecteur « Rôle Actif » ci-dessus pour passer en Président(e) ou
                Secrétaire et débloquer les boutons de gestion et d’ajout de PDF.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector: Mandatures, Rules, Executive Contracts, Audit Trail */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
        <button
          type="button"
          onClick={() => setActiveTab('MANDATURES_AND_HANDOVER')}
          className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[44px] ${
            activeTab === 'MANDATURES_AND_HANDOVER'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Building2 className="size-4 sm:size-4.5 shrink-0" />
          <span className="hidden sm:inline">Mandatures &amp; Passation de Service</span>
          <span className="inline sm:hidden">Mandatures &amp; Passation</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
            {mandates.length}
          </span>
        </button>

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
          <span className="hidden sm:inline">Règles d’Intégration & Conditions d’Adhésion</span>
          <span className="inline sm:hidden">Règles d’Adhésion</span>
          {rules && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
              {rules.status === 'OPEN' ? 'Ouvertes' : 'Filtrées'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXECUTIVE_CONTRACTS')}
          className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[44px] ${
            activeTab === 'EXECUTIVE_CONTRACTS'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileSignature className="size-4 sm:size-4.5 shrink-0" />
          <span className="hidden sm:inline">Mandats & Contrats des Hauts Membres (Bureau)</span>
          <span className="inline sm:hidden">Mandats & Bureau</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
            {contracts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MANDATE_AUDIT_TRAIL')}
          className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[44px] ${
            activeTab === 'MANDATE_AUDIT_TRAIL'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <History className="size-4 sm:size-4.5 shrink-0" />
          <span className="hidden sm:inline">Traçabilité & Actes Scellés du Mandat</span>
          <span className="inline sm:hidden">Traçabilité Mandat</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
            {mandateActions.length} actes
          </span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 0: MANDATURES & PASSATION DE SERVICE (100% DYNAMIQUE)               */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'MANDATURES_AND_HANDOVER' && (
        <div className="space-y-6">
          {/* Active Mandate Hero Card */}
          {(() => {
            const activeMandate = mandates.find((m) => m.status === 'ACTIVE') || mandates[0];
            return (
              <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl dark:border-indigo-900/60">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="size-3.5" />
                        MANDAT EN COURS D'EXERCICE
                      </span>
                      {activeMandate?.academicYear && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 border border-white/10">
                          Année / Période : {activeMandate.academicYear}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {activeMandate?.title || 'Mandat en Exercice'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-indigo-100">
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                        <span className="text-[10px] text-indigo-300 block">Présidence du Bureau</span>
                        <span className="font-bold text-sm text-white">{activeMandate?.presidentName || 'Non désigné(e)'}</span>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                        <span className="text-[10px] text-indigo-300 block">Secrétariat Général</span>
                        <span className="font-bold text-sm text-white">{activeMandate?.secretaryName || 'Non désigné(e)'}</span>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                        <span className="text-[10px] text-indigo-300 block">Trésorerie Générale</span>
                        <span className="font-bold text-sm text-white">{activeMandate?.treasurerName || 'Non désigné(e)'}</span>
                      </div>
                    </div>

                    {activeMandate?.treasuryTransferredAmount !== undefined && activeMandate.treasuryTransferredAmount > 0 && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-200">
                        <Coins className="size-4 text-emerald-400" />
                        <span>
                          Fonds transmis lors de la dernière passation :{' '}
                          <strong className="text-white">{activeMandate.treasuryTransferredAmount.toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions de Gouvernance du Mandat */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                    {isAuthorized && (
                      <button
                        type="button"
                        onClick={handleOpenHandoverModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-600 hover:to-teal-700 transition"
                      >
                        <FileSignature className="size-4" />
                        <span>Passation de Service &amp; Transmission</span>
                      </button>
                    )}

                    {isAuthorized && (
                      <button
                        type="button"
                        onClick={handleOpenCreateMandate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
                      >
                        <Plus className="size-4" />
                        <span>Définir une Nouvelle Mandature</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadMandateAuditPdf}
                      disabled={isGeneratingMandatePdf}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-700/60 border border-indigo-400/30 px-5 py-3 text-xs font-bold text-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      <Download className="size-4" />
                      <span>{isGeneratingMandatePdf ? 'Génération...' : 'Télécharger Rapport de Mandat'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* KPIs Mandatures */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Mandatures</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{mandates.length}</p>
              <p className="mt-1 text-[10px] text-gray-400">Cycles électifs enregistrés</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Mandat en Exercice</p>
              <p className="mt-1 text-2xl font-black text-emerald-900 dark:text-white">
                {mandates.filter((m) => m.status === 'ACTIVE').length || 1}
              </p>
              <p className="mt-1 text-[10px] text-emerald-600/80">Bureau actif légitimé</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Mandatures Passées</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                {mandates.filter((m) => m.status === 'COMPLETED' || m.status === 'ARCHIVED').length}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">Clôturées avec quitus</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Trésorerie Associative</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {(activeAssociation?.treasuryBalanceXOF || 0).toLocaleString('fr-FR')} F
              </p>
              <p className="mt-1 text-[10px] text-gray-400">Solde de caisse certifié</p>
            </div>
          </div>

          {/* Liste et Historique des Mandatures */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Registre des Mandatures &amp; Bureaux Exécutifs
                </h3>
                <p className="text-xs text-gray-500">
                  Historique immuable de transmission des pouvoirs et des responsabilités statutaires
                </p>
              </div>

              {isAuthorized && (
                <button
                  type="button"
                  onClick={handleOpenCreateMandate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  <Plus className="size-3.5" />
                  <span>Nouvelle Mandature</span>
                </button>
              )}
            </div>

            {isLoadingMandates ? (
              <div className="p-12 text-center text-xs text-gray-500">Chargement des mandatures...</div>
            ) : mandates.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                Aucune mandature enregistrée pour cette association. Cliquez sur « Définir une Nouvelle Mandature » pour initialiser le bureau.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-850 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5">Mandature &amp; Période</th>
                      <th className="px-5 py-3.5">Bureau Exécutif</th>
                      <th className="px-5 py-3.5">Dates d'Exercice</th>
                      <th className="px-5 py-3.5">Statut Mandat</th>
                      <th className="px-5 py-3.5">Passation &amp; Quitus</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {mandates.map((m) => {
                      const isActive = m.status === 'ACTIVE';
                      return (
                        <tr key={m.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{m.title}</p>
                            <span className="inline-block mt-0.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {m.academicYear}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Président(e) : <strong className="text-brand-600 dark:text-brand-400">{m.presidentName}</strong>
                            </p>
                            <p className="text-[11px] text-gray-500">
                              SG : {m.secretaryName || '—'} · TG : {m.treasurerName || '—'}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                            <div>Du {new Date(m.startDate).toLocaleDateString('fr-FR')}</div>
                            <div className="text-[10px] text-gray-400">
                              au {m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : 'En cours'}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="size-3" />
                                <span>Actif en exercice</span>
                              </span>
                            ) : m.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                <span>Clôturé / Quitus</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <span>Archivé</span>
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {m.pvDocumentRef ? (
                              <div>
                                <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                                  {m.pvDocumentRef}
                                </span>
                                {m.treasuryTransferredAmount !== undefined && (
                                  <span className="text-[11px] text-emerald-600 font-semibold">
                                    {m.treasuryTransferredAmount.toLocaleString('fr-FR')} FCFA transmis
                                  </span>
                                )}
                              </div>
                            ) : isActive ? (
                              <span className="text-[11px] text-gray-400 italic">En exercice actif</span>
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {!isActive && isAuthorized && (
                                <button
                                  type="button"
                                  onClick={() => handleActivateMandate(m.id)}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                >
                                  Activer
                                </button>
                              )}

                              {isAuthorized && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMandate(m)}
                                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                >
                                  Modifier
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMandatePeriod(`${m.title} (${m.academicYear})`);
                                  setActiveTab('MANDATE_AUDIT_TRAIL');
                                }}
                                title="Voir les actes scellés de ce mandat"
                                className="rounded-lg bg-indigo-50 p-1 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                              >
                                <History className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: RÈGLES D'INTÉGRATION ET CHARTE DE L'ADHÉRENT                    */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'RULES' && (
        <div className="space-y-6">
          {isLoadingRules ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <span className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-xs font-semibold">Chargement des règles d'intégration...</p>
              </div>
            </div>
          ) : !rules ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <AlertCircle className="mx-auto size-10 text-gray-400" />
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Aucune règle configurée pour cette association.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
              {/* Colonne Gauche : Paramètres Généraux & Document PDF */}
              <div className="space-y-5 sm:space-y-6 lg:col-span-5 xl:col-span-4">
                {/* Statut & Paramètres financiers */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Conditions Générales</span>
                  </h2>

                  <div className="mt-4 space-y-4">
                    {/* Statut Adhésion */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Statut de la Campagne d'Intégration
                      </label>
                      <Select2
                        aria-label="Statut de la campagne d'intégration"
                        disabled={!isAuthorized}
                        value={rules.status}
                        onChange={(e) =>
                          setRules({ ...rules, status: e.target.value as ApiAssociationIntegrationRules['status'] })
                        }
                        className="mt-1 w-full"
                      >
                        <option value="OPEN">Ouverte à tous les candidats éligibles</option>
                        <option value="INVITATION_ONLY">Sur Parrainage / Cooptation uniquement</option>
                        <option value="CLOSED">Fermée / Clôturée</option>
                      </Select2>
                    </div>

                    {/* Mode d'approbation */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Mode de Validation des Candidatures
                      </label>
                      <Select2
                        aria-label="Mode de validation des candidatures"
                        disabled={!isAuthorized}
                        value={rules.approvalMode}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            approvalMode: e.target.value as ApiAssociationIntegrationRules['approvalMode'],
                          })
                        }
                        className="mt-1 w-full"
                      >
                        <option value="BUREAU_REVIEW">Examen & Délibération par le Bureau Exécutif</option>
                        <option value="AUTOMATIC">Validation Automatique après complétude des pièces</option>
                        <option value="VOTE_GA">Vote solennel en Assemblée Générale</option>
                      </Select2>
                    </div>

                    {/* Droit d'adhésion initial */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Droit d'Adhésion / Frais de Dossier (XOF)
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          disabled={!isAuthorized}
                          value={rules.membershipFeeXOF}
                          onChange={(e) => setRules({ ...rules, membershipFeeXOF: Number(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 shadow-2xs disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">FCFA</span>
                      </div>
                    </div>

                    {/* Cotisation annuelle */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Cotisation Annuelle Statutaire (XOF)
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          disabled={!isAuthorized}
                          value={rules.annualDuesXOF}
                          onChange={(e) => setRules({ ...rules, annualDuesXOF: Number(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 shadow-2xs disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">FCFA</span>
                      </div>
                    </div>

                    {/* Parrainage requis */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-3.5 sm:p-4 dark:border-gray-800 dark:bg-gray-800/50 min-h-[52px]">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Parrainage Obligatoire</p>
                        <p className="text-[11px] text-gray-500">Exige la caution de membres actifs</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled={!isAuthorized}
                        checked={rules.requiresSponsorship}
                        onChange={(e) => setRules({ ...rules, requiresSponsorship: e.target.checked })}
                        className="size-4.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloc Document PDF Officiel (Règlement Intérieur) */}
                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-4 sm:p-6 shadow-xs dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-gray-900">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Paperclip className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Règlement Intérieur (PDF Officiel)</span>
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Associez le document PDF officiel voté en Assemblée Générale ou téléchargez la fiche certifiée.
                  </p>

                  <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white/80 p-4 text-center dark:border-indigo-800 dark:bg-gray-800/80">
                    {rules.internalRegulationsPdfName ? (
                      <div className="space-y-3">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          <FileText className="size-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {rules.internalRegulationsPdfName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {rules.internalRegulationsPdfSize || 'Document PDF certifié'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleDownloadRulesPdf}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 min-h-[40px] transition"
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
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 min-h-[40px] transition"
                          >
                            <Download className="size-3.5" />
                            <span>Générer Fiche PDF</span>
                          </button>
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => rulesFileInputRef.current?.click()}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 min-h-[40px] transition"
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

                  {/* Actions de sauvegarde */}
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
                          <span>Enregistrer les Modifications</span>
                        </>
                      )}
                    </button>
                    {!isAuthorized && (
                      <p className="mt-2 text-center text-[11px] text-gray-500">
                        Bouton désactivé en mode consultation simple adhérent.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne Droite : Critères, Pièces requises & Charte */}
              <div className="space-y-5 sm:space-y-6 lg:col-span-7 xl:col-span-8">
                {/* 1. Critères d'éligibilité */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Critères d'Éligibilité des Candidats</span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        Conditions préalables requises pour postuler à l'association
                      </p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rules.eligibilityCriteria.length} critère{rules.eligibilityCriteria.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Liste des critères */}
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

                  {/* Formulaire d'ajout de critère */}
                  {isAuthorized && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Ajouter un nouveau critère d'éligibilité (ex: Être inscrit à l'UAC)..."
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
                        <span>Pièces Justificatives Obligatoires</span>
                      </h2>
                      <p className="text-xs text-gray-500">Documents exigés pour constituer le dossier d'adhésion</p>
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
                        placeholder="Ajouter une pièce obligatoire (ex: Attestation de scolarité, CIP...)..."
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

                {/* 3. Charte Déontologique des Adhérents */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="size-4.5 text-amber-500 shrink-0" />
                        <span>Charte Déontologique & Engagements de l'Adhérent</span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        Articles que chaque membre s'engage sur l'honneur à respecter
                      </p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rules.charterArticles.length} article{rules.charterArticles.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {rules.charterArticles.map((article) => (
                      <div
                        key={article.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3.5 sm:p-4 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{article.title}</h3>
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCharterArticle(article.id)}
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
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nouvel Article de Charte</p>
                      <input
                        type="text"
                        placeholder="Titre de l'article (ex: Article 4 : Assiduité aux réunions)..."
                        value={newCharterTitle}
                        onChange={(e) => setNewCharterTitle(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
                      />
                      <textarea
                        rows={3}
                        placeholder="Contenu de l'engagement..."
                        value={newCharterContent}
                        onChange={(e) => setNewCharterContent(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-medium text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white leading-relaxed min-h-[70px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCharterArticle}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 min-h-[42px] transition"
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
      {/* TAB 2: MANDATS & CONTRATS DES HAUTS MEMBRES (BUREAU)                  */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'EXECUTIVE_CONTRACTS' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-500">Mandats Définis</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{contracts.length}</p>
              <p className="mt-1 text-[11px] text-gray-500">Dirigeants enregistrés</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Mandats Actifs</p>
              <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">{activeContractsCount}</p>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Pouvoirs en exercice</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">En Attente Signature</p>
              <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-400">{pendingContractsCount}</p>
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">À formaliser</p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-2xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Conformité Bénin</p>
              <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-400">100%</p>
              <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">Délégations tracées</p>
            </div>
          </div>

          {/* Action Header & Filters */}
          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row flex-1 sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto sm:min-w-[220px] flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dirigeant, poste, n° mandat..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-xs font-medium text-gray-900 shadow-2xs focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Rôle Filter */}
              <div className="w-full sm:w-auto sm:min-w-[150px]">
                <Select2
                  aria-label="Filtrer par rôle de gouvernance"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="ALL">Tous les Rôles</option>
                  <option value="PRESIDENT">Présidents</option>
                  <option value="VICE_PRESIDENT">Vice-Présidents</option>
                  <option value="SECRETARY">Secrétaires</option>
                  <option value="TREASURER">Trésoriers</option>
                  <option value="BOARD_MEMBER">Membres du Bureau</option>
                </Select2>
              </div>

              {/* Statut Filter */}
              <div className="w-full sm:w-auto sm:min-w-[160px]">
                <Select2
                  aria-label="Filtrer par statut de mandat"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="ALL">Tous les Statuts</option>
                  <option value="ACTIVE">Actifs</option>
                  <option value="PENDING_SIGNATURE">En attente de signature</option>
                  <option value="TERMINATED">Clôturés</option>
                </Select2>
              </div>
            </div>

            {/* Bouton Créer Mandat */}
            {isAuthorized ? (
              <button
                type="button"
                onClick={() => setIsCreateContractModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
              >
                <Plus className="size-4" />
                <span>Définir un Nouveau Mandat Dirigeant</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Lock className="size-3.5" />
                <span>Création réservée aux membres du Bureau</span>
              </div>
            )}
          </div>

          {/* Tableau des Mandats et Contrats Dirigeants */}
          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {isLoadingContracts ? (
              <div className="flex h-64 items-center justify-center">
                <span className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-12 text-center">
                <FileSignature className="mx-auto size-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Aucun mandat trouvé</p>
                <p className="mt-1 text-xs text-gray-500">
                  {searchFilter || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Aucun contrat ne correspond à vos filtres.'
                    : 'Commencez par définir un premier mandat de dirigeant pour cette association.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                      <th className="px-5 py-3.5">Dirigeant & Titre</th>
                      <th className="px-4 py-3.5">Rôle & Type d'Acte</th>
                      <th className="px-4 py-3.5">Validité du Mandat</th>
                      <th className="px-4 py-3.5">Document PDF</th>
                      <th className="px-4 py-3.5">Statut</th>
                      <th className="px-5 py-3.5 text-right">Actions Officielles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs dark:divide-gray-800">
                    {filteredContracts.map((c) => (
                      <tr key={c.id} className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                        {/* Dirigeant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-600 font-bold text-white shadow-2xs">
                              {c.officerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{c.officerName}</p>
                              <p className="text-[11px] text-gray-500">{c.positionTitle}</p>
                              <p className="text-[10px] font-mono text-gray-400">{c.contractNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Rôle & Type */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                c.officerRole === 'PRESIDENT'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                  : c.officerRole === 'TREASURER'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                  : c.officerRole === 'SECRETARY'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                              }`}
                            >
                              {c.officerRole}
                            </span>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                              {c.type === 'MANDAT_ELECTIF'
                                ? 'Mandat Électif Statutaire'
                                : c.type === 'DELEGATION_POUVOIRS'
                                ? 'Délégation de Pouvoirs'
                                : 'Charte Déontologique'}
                            </p>
                          </div>
                        </td>

                        {/* Période */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {c.termStartDate} &rarr; {c.termEndDate}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {c.monthlyIndemnityXOF > 0
                              ? `${c.monthlyIndemnityXOF.toLocaleString('fr-FR')} FCFA/mois`
                              : 'Bénévolat citoyen'}
                          </p>
                        </td>

                        {/* Document PDF */}
                        <td className="px-4 py-4">
                          {c.pdfFileName ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                              <Paperclip className="size-3.5 shrink-0" />
                              <div className="truncate max-w-[140px]">
                                <p className="text-[11px] font-bold truncate">{c.pdfFileName}</p>
                                <p className="text-[10px] text-gray-400">{c.pdfFileSize || 'PDF joint'}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                              <FileText className="size-3 text-indigo-500" />
                              Générable jsPDF
                            </span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-4">
                          {c.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <CheckCircle2 className="size-3" />
                              Actif & Signé
                            </span>
                          ) : c.status === 'PENDING_SIGNATURE' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <Clock className="size-3" />
                              En Attente Signature
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              Clôturé
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Télécharger Contrat PDF */}
                            <button
                              type="button"
                              onClick={() => handleDownloadContractPdf(c)}
                              title="Télécharger le contrat PDF officiel"
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-750"
                            >
                              <Download className="size-3" />
                              PDF
                            </button>

                            {/* Attacher un document PDF scanné / officiel */}
                            {isAuthorized && (
                              <button
                                type="button"
                                onClick={() => {
                                  setContractForUpload(c);
                                  setIsUploadPdfModalOpen(true);
                                }}
                                title="Attacher un document PDF officiel (ex: PV d'élection)"
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                <Upload className="size-3" />
                                Joindre
                              </button>
                            )}

                            {/* Signer si en attente */}
                            {isAuthorized && c.status === 'PENDING_SIGNATURE' && (
                              <button
                                type="button"
                                onClick={() => handleSignContract(c)}
                                title="Signer électroniquement ce mandat"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700"
                              >
                                <FileCheck className="size-3" />
                                Signer
                              </button>
                            )}

                            {/* Voir Détails */}
                            <button
                              type="button"
                              onClick={() => setDetailsContract(c)}
                              title="Consulter les délégations et obligations"
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
      {/* TAB 3: TRAÇABILITÉ & REGISTRE DES ACTES DU MANDAT (ADR-006 & ADR-011) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'MANDATE_AUDIT_TRAIL' && (
        <div className="space-y-6">
          {/* Header & Mandate Period Switcher Card */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <History className="size-3.5" />
                    REGISTRE CENTRAL DE TRAÇABILITÉ DU MANDAT
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Horodatage & Scellement Immuable
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-white">
                  Actes de Gestion Rattachés à la Période du Mandat
                </h2>
                <p className="max-w-2xl text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Toute opération (décaissement, encaissement de cotisation, don, désignation statutaire, convention de résidence)
                  est irrévocablement scellée et liée à la mandature en cours du dirigeant exécutif ordonnateur.
                </p>
              </div>

              {/* Mandate Filter & PDF Export Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex flex-col gap-1 min-w-[220px]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="size-3 text-indigo-500" />
                    Période de Mandature
                  </label>
                  <Select2
                    aria-label="Sélection de la période de mandature"
                    value={selectedMandatePeriod}
                    onChange={(e) => setSelectedMandatePeriod(e.target.value)}
                    className="w-full text-xs font-bold"
                  >
                    {mandatePeriods.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </Select2>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadMandateAuditPdf}
                  disabled={isGeneratingMandatePdf || mandateActions.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition"
                >
                  {isGeneratingMandatePdf ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Génération PDF...
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Télécharger PV de Traçabilité (PDF)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 KPI Summary Cards for Active Mandate Scope */}
            {mandateSummary && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Mandat & Période */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Période d'Exercice</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {mandateSummary.status === 'ACTIVE' ? 'En Cours' : 'Clôturé'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-black text-gray-900 dark:text-white truncate">
                    {mandateSummary.mandatePeriod}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Du {mandateSummary.termStartDate} au {mandateSummary.termEndDate}
                  </p>
                </div>

                {/* 2. Actes Scellés */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Actes Scellés & Vérifiés</span>
                    <Hash className="size-4 text-blue-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-blue-600 dark:text-blue-400">
                    {mandateActions.length} <span className="text-xs font-semibold text-gray-500">actes</span>
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    100% Horodatés & Scellés MC-SEAL
                  </p>
                </div>

                {/* 3. Recettes Encaissées */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Recettes Mandat</span>
                    <Coins className="size-4 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {(mandateSummary.totalIncomeXOF || 0).toLocaleString('fr-FR')} <span className="text-xs font-semibold">FCFA</span>
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Cotisations & Dons rattachés
                  </p>
                </div>

                {/* 4. Dépenses Décaissées */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Dépenses Ordonnées</span>
                    <Coins className="size-4 text-amber-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-amber-600 dark:text-amber-400">
                    {(mandateSummary.totalExpenseXOF || 0).toLocaleString('fr-FR')} <span className="text-xs font-semibold">FCFA</span>
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Sous visa exécutif du bureau
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filtering and Actions Table Card */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
            {/* Category Filter Pills and Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tous les Actes' },
                  { id: 'FINANCE', label: 'Finances & Caisses' },
                  { id: 'GOVERNANCE', label: 'Gouvernance & Bureau' },
                  { id: 'RESIDENCES', label: 'Résidences & Baux' },
                  { id: 'MEMBERSHIP', label: 'Adhésions & Membres' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMandateCategoryFilter(cat.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      mandateCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher acte, acteur, sceau..."
                  value={mandateSearchFilter}
                  onChange={(e) => setMandateSearchFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Actions Table */}
            {isLoadingMandateActions ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <span className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <p className="text-xs font-semibold">Vérification de l'intégrité du registre d'audit...</p>
                </div>
              </div>
            ) : mandateActions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
                <History className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aucun acte scellé correspondant aux filtres sélectionnés.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Les futures actions de caisse, dépenses ou désignations de membres s'enregistreront automatiquement ici.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50/80 font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-850 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3.5">Date & Horodatage</th>
                      <th className="px-4 py-3.5">Acte de Gestion & Ressource</th>
                      <th className="px-4 py-3.5">Domaine</th>
                      <th className="px-4 py-3.5">Mandataire Responsable</th>
                      <th className="px-4 py-3.5">Montant / Impact</th>
                      <th className="px-4 py-3.5">Sceau d'Intégrité</th>
                      <th className="px-4 py-3.5 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {mandateActions.map((act) => {
                      const dateObj = new Date(act.timestamp);
                      const dateStr = dateObj.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                      const timeStr = dateObj.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      return (
                        <tr
                          key={act.id}
                          className="hover:bg-indigo-50/30 transition-colors dark:hover:bg-gray-800/40"
                        >
                          {/* Horodatage */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-bold text-gray-900 dark:text-white">{dateStr}</p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                              <Clock className="size-3" />
                              {timeStr}
                            </p>
                          </td>

                          {/* Acte & Ressource */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900 dark:text-white">{act.actionTitle}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {act.resourceType} • {act.resourceId}
                            </p>
                          </td>

                          {/* Catégorie */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                act.category === 'FINANCE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  : act.category === 'GOVERNANCE'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                                  : act.category === 'RESIDENCES'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                              }`}
                            >
                              {act.category}
                            </span>
                          </td>

                          {/* Mandataire */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900 dark:text-white">{act.actorName}</p>
                            <p className="text-[10px] text-gray-500">{act.actorRole}</p>
                            {act.mandateContractNumber && (
                              <span className="inline-block mt-0.5 text-[9px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                {act.mandateContractNumber}
                              </span>
                            )}
                          </td>

                          {/* Montant */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-medium">
                            {act.amountXOF !== undefined && act.amountXOF > 0 ? (
                              <span className="font-bold text-gray-900 dark:text-white">
                                {act.amountXOF.toLocaleString('fr-FR')} FCFA
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Acte d'Ordre</span>
                            )}
                          </td>

                          {/* Sceau d'Intégrité */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="truncate max-w-[130px]">{act.integrityHash}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedAuditActionDetails(act)}
                              title="Consulter le certificat complet de l'acte"
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition"
                            >
                              <Eye className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1 : DÉFINIR UN NOUVEAU MANDAT DE DIRIGEANT                       */}
      {/* --------------------------------------------------------------------- */}
      {isCreateContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <FileSignature className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Définir un Nouveau Mandat / Contrat de Dirigeant
                  </h3>
                  <p className="text-xs text-gray-500">
                    Association : {activeAssociation?.name} ({activeAssociation?.acronym})
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
                    Nom Complet du Haut Membre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sèdami Akindès"
                    value={newContractForm.officerName}
                    onChange={(e) => setNewContractForm({ ...newContractForm, officerName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Intitulé Officiel du Poste *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Président du Bureau Exécutif"
                    value={newContractForm.positionTitle}
                    onChange={(e) => setNewContractForm({ ...newContractForm, positionTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Rôle de Gouvernance</label>
                  <Select2
                    aria-label="Rôle de gouvernance du haut membre"
                    value={newContractForm.officerRole}
                    onChange={(e) =>
                      setNewContractForm({
                        ...newContractForm,
                        officerRole: e.target.value as ApiAssociationExecutiveContract['officerRole'],
                      })
                    }
                    className="mt-1 w-full"
                  >
                    <option value="PRESIDENT">Président(e)</option>
                    <option value="VICE_PRESIDENT">Vice-Président(e)</option>
                    <option value="SECRETARY">Secrétaire Général(e)</option>
                    <option value="TREASURER">Trésorier(e) Général(e)</option>
                    <option value="BOARD_MEMBER">Membre du Bureau Exécutif</option>
                    <option value="AUDITOR">Commissaire aux Comptes</option>
                  </Select2>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Type de Contrat / Acte</label>
                  <Select2
                    aria-label="Type de contrat ou acte"
                    value={newContractForm.type}
                    onChange={(e) =>
                      setNewContractForm({
                        ...newContractForm,
                        type: e.target.value as ApiAssociationExecutiveContract['type'],
                      })
                    }
                    className="mt-1 w-full"
                  >
                    <option value="MANDAT_ELECTIF">Mandat Électif Statutaire (AG)</option>
                    <option value="DELEGATION_POUVOIRS">Délégation de Pouvoirs & Signature</option>
                    <option value="CHARTE_DEONTOLOGIQUE">Charte Déontologique du Dirigeant</option>
                    <option value="CONVENTION_BENEVOLAT_DIRIGEANT">Convention de Bénévolat Dirigeant</option>
                  </Select2>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Téléphone du Dirigeant</label>
                  <input
                    type="text"
                    placeholder="+229 97 00 00 00"
                    value={newContractForm.officerPhone}
                    onChange={(e) => setNewContractForm({ ...newContractForm, officerPhone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Email Officiel</label>
                  <input
                    type="email"
                    placeholder="contact@association.bj"
                    value={newContractForm.officerEmail}
                    onChange={(e) => setNewContractForm({ ...newContractForm, officerEmail: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Date Début du Mandat</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.termStartDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, termStartDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Date Fin du Mandat</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.termEndDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, termEndDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Délégation de Pouvoirs & Obligations */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Délégation Principale de Pouvoirs
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Co-signature des comptes bancaires et ordonnancement des dépenses jusqu'à 500 000 FCFA"
                    value={newContractForm.delegation1}
                    onChange={(e) => setNewContractForm({ ...newContractForm, delegation1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Obligation Déontologique Spécifique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Reddition trimestrielle des comptes et obligation de réserve"
                    value={newContractForm.obligation1}
                    onChange={(e) => setNewContractForm({ ...newContractForm, obligation1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Option d'ajout sous forme de PDF direct */}
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800 dark:bg-indigo-950/20">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Upload className="size-4 text-indigo-600" />
                  Option : Joindre un document PDF officiel scanné (PV d'élection, arrêté...)
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
                    className="text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-indigo-700"
                  />
                  {uploadedFileName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 truncate max-w-xs">
                      <Check className="size-3" />
                      <span>{uploadedFileName} ({uploadedFileSize})</span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  Si aucun PDF n'est téléversé, un contrat officiel vectoriel sera automatiquement généré par le système.
                </p>
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
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Enregistrer et Émettre le Mandat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2 : JOINDRE UN DOCUMENT PDF OFFICIEL À UN MANDAT EXISTANT        */}
      {/* --------------------------------------------------------------------- */}
      {isUploadPdfModalOpen && contractForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Upload className="size-5 text-indigo-600" />
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
                Rattachez un fichier PDF scanné pour le mandat de{' '}
                <strong className="text-gray-900 dark:text-white">{contractForUpload.officerName}</strong> (
                {contractForUpload.contractNumber}) :
              </p>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 dark:border-gray-700">
                <Upload className="mx-auto size-8 text-gray-400" />
                <p className="mt-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                  Sélectionnez le document PDF
                </p>
                <p className="text-[10px] text-gray-500">Format .pdf uniquement (PV d'élection, arrêté de nomination...)</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelectedForContract}
                  className="mt-3 block w-full text-xs text-gray-500 file:mr-2 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
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
      {/* MODAL 3 : CONSULTATION DÉTAILLÉE D'UN MANDAT                           */}
      {/* --------------------------------------------------------------------- */}
      {detailsContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600">
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
                <p className="font-bold text-gray-900 dark:text-white text-sm">{detailsContract.officerName}</p>
                <p className="text-gray-500">
                  Rôle : {detailsContract.officerRole} • Association : {detailsContract.associationName}
                </p>
                <p className="text-gray-500 mt-1">
                  Validité : Du {detailsContract.termStartDate} au {detailsContract.termEndDate}
                </p>
                <p className="text-gray-500">
                  Indemnité mensuelle :{' '}
                  {detailsContract.monthlyIndemnityXOF > 0
                    ? `${detailsContract.monthlyIndemnityXOF.toLocaleString('fr-FR')} FCFA`
                    : 'Bénévolat citoyen certifié'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Délégations de Pouvoirs & Signature :</h4>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 text-gray-600 dark:text-gray-300">
                  {detailsContract.delegations.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Obligations Déontologiques :</h4>
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <Download className="size-3.5" />
                    Télécharger Contrat PDF
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

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 4 : CERTIFICAT D'AUTHENTICITÉ ET TRAÇABILITÉ DE L'ACTE           */}
      {/* --------------------------------------------------------------------- */}
      {selectedAuditActionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Certificat d'Authenticité de l'Acte
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Registre d'audit officiel • Scellement immuable
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditActionDetails(null)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nature de l'Acte</span>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedAuditActionDetails.actionTitle}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {selectedAuditActionDetails.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  <div>
                    <span className="text-[10px] text-gray-400">Période de Mandature</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedAuditActionDetails.mandatePeriod}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Contrat Exécutif</span>
                    <p className="font-semibold font-mono text-indigo-600 dark:text-indigo-400">
                      {selectedAuditActionDetails.mandateContractNumber || 'MANDAT-ACTIF'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  <div>
                    <span className="text-[10px] text-gray-400">Mandataire Responsable</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedAuditActionDetails.actorName}</p>
                    <p className="text-[10px] text-gray-500">{selectedAuditActionDetails.actorRole}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Horodatage Précis</span>
                    <p className="font-semibold font-mono text-gray-800 dark:text-gray-200">
                      {new Date(selectedAuditActionDetails.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                {selectedAuditActionDetails.amountXOF !== undefined && selectedAuditActionDetails.amountXOF > 0 && (
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-[10px] text-gray-400">Montant Financier Engagé</span>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {selectedAuditActionDetails.amountXOF.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Détails et Circonstances de l'Opération :</span>
                <p className="mt-1 rounded-xl bg-gray-50 p-3 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300">
                  {selectedAuditActionDetails.details}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Sceau Numérique d'Intégrité Immuable :</span>
                <p className="mt-1 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 font-mono text-[10px] font-bold text-emerald-900 break-all dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {selectedAuditActionDetails.integrityHash}
                </p>
              </div>

              <div className="flex items-center justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedAuditActionDetails(null)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Fermer le Certificat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 4 : DÉFINIR / MODIFIER UNE MANDATURE (100% DYNAMIQUE)             */}
      {/* --------------------------------------------------------------------- */}
      {isCreateMandateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {editingMandate ? 'Modifier la Mandature' : 'Définir une Nouvelle Mandature'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Cycle électif, période académique et composition du bureau
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateMandateModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMandate} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Titre / Libellé de la Mandature *
                </label>
                <input
                  type="text"
                  required
                  value={mandateTitleForm}
                  onChange={(e) => setMandateTitleForm(e.target.value)}
                  placeholder="Ex: Mandat Renaissance &amp; Excellence, Mandat Inaugural..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Période / Année Académique *
                  </label>
                  <input
                    type="text"
                    required
                    value={mandateAcademicYearForm}
                    onChange={(e) => setMandateAcademicYearForm(e.target.value)}
                    placeholder="Ex: 2026-2027, 2026-2028..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Date de Prise de Fonction *
                  </label>
                  <input
                    type="date"
                    required
                    value={mandateStartDateForm}
                    onChange={(e) => setMandateStartDateForm(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Date d'Échéance / Fin Prévisionnelle
                </label>
                <input
                  type="date"
                  value={mandateEndDateForm}
                  onChange={(e) => setMandateEndDateForm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                  Direction du Bureau Exécutif
                </span>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Président(e) du Bureau *
                    </label>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                      Réservé aux membres adhérents
                    </span>
                  </div>
                  {assocMembers.length > 0 ? (
                    <Select2
                      value={mandatePresidentForm}
                      onChange={(e) => setMandatePresidentForm(e.target.value)}
                      required
                      className="mt-1 w-full"
                    >
                      <option value="">-- Choisir un membre de l'association --</option>
                      {assocMembers.map((m) => (
                        <option key={m.id || m.userId} value={m.userName}>
                          {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                        </option>
                      ))}
                    </Select2>
                  ) : (
                    <input
                      type="text"
                      required
                      value={mandatePresidentForm}
                      onChange={(e) => setMandatePresidentForm(e.target.value)}
                      placeholder="Nom complet du/de la Président(e) adhérent(e)"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Secrétaire Général(e)
                    </label>
                    {assocMembers.length > 0 ? (
                      <Select2
                        value={mandateSecretaryForm}
                        onChange={(e) => setMandateSecretaryForm(e.target.value)}
                        className="mt-1 w-full"
                      >
                        <option value="">-- Non désigné(e) ou membre --</option>
                        {assocMembers.map((m) => (
                          <option key={m.id || m.userId} value={m.userName}>
                            {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                          </option>
                        ))}
                      </Select2>
                    ) : (
                      <input
                        type="text"
                        value={mandateSecretaryForm}
                        onChange={(e) => setMandateSecretaryForm(e.target.value)}
                        placeholder="Nom complet du/de la SG"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Trésorier(e) Général(e)
                    </label>
                    {assocMembers.length > 0 ? (
                      <Select2
                        value={mandateTreasurerForm}
                        onChange={(e) => setMandateTreasurerForm(e.target.value)}
                        className="mt-1 w-full"
                      >
                        <option value="">-- Non désigné(e) ou membre --</option>
                        {assocMembers.map((m) => (
                          <option key={m.id || m.userId} value={m.userName}>
                            {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                          </option>
                        ))}
                      </Select2>
                    ) : (
                      <input
                        type="text"
                        value={mandateTreasurerForm}
                        onChange={(e) => setMandateTreasurerForm(e.target.value)}
                        placeholder="Nom complet du/de la TG"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateMandateModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!mandateTitleForm.trim() || !mandatePresidentForm.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editingMandate ? 'Mettre à Jour la Mandature' : 'Enregistrer la Mandature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 5 : PASSATION DE SERVICE & TRANSMISSION DES POUVOIRS             */}
      {/* --------------------------------------------------------------------- */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <FileSignature className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Passation de Service &amp; Transmission des Pouvoirs
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Cession officielle de charges, quitus moral &amp; transmission du solde de caisse
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteHandover} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Mandat Sortant à Clôturer *
                </label>
                <Select2
                  value={handoverOutgoingMandateId}
                  onChange={(e) => setHandoverOutgoingMandateId(e.target.value)}
                  className="mt-1 w-full"
                >
                  {mandates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.academicYear}) — Présidence : {m.presidentName}
                    </option>
                  ))}
                </Select2>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  Bureau Entrant (Nouveau Directoire)
                </span>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Nom du/de la Président(e) Entrant(e) *
                    </label>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                      Réservé aux membres adhérents
                    </span>
                  </div>
                  {assocMembers.length > 0 ? (
                    <Select2
                      value={handoverIncomingPresident}
                      onChange={(e) => setHandoverIncomingPresident(e.target.value)}
                      required
                      className="mt-1 w-full"
                    >
                      <option value="">-- Choisir un membre de l'association --</option>
                      {assocMembers.map((m) => (
                        <option key={m.id || m.userId} value={m.userName}>
                          {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                        </option>
                      ))}
                    </Select2>
                  ) : (
                    <input
                      type="text"
                      required
                      value={handoverIncomingPresident}
                      onChange={(e) => setHandoverIncomingPresident(e.target.value)}
                      placeholder="Nom complet du/de la Président(e) élu(e)"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Secrétaire Général(e) Entrant(e)
                    </label>
                    {assocMembers.length > 0 ? (
                      <Select2
                        value={handoverIncomingSecretary}
                        onChange={(e) => setHandoverIncomingSecretary(e.target.value)}
                        className="mt-1 w-full"
                      >
                        <option value="">-- Non désigné(e) ou membre --</option>
                        {assocMembers.map((m) => (
                          <option key={m.id || m.userId} value={m.userName}>
                            {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                          </option>
                        ))}
                      </Select2>
                    ) : (
                      <input
                        type="text"
                        value={handoverIncomingSecretary}
                        onChange={(e) => setHandoverIncomingSecretary(e.target.value)}
                        placeholder="Nom du/de la nouveau SG"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Trésorier(e) Général(e) Entrant(e)
                    </label>
                    {assocMembers.length > 0 ? (
                      <Select2
                        value={handoverIncomingTreasurer}
                        onChange={(e) => setHandoverIncomingTreasurer(e.target.value)}
                        className="mt-1 w-full"
                      >
                        <option value="">-- Non désigné(e) ou membre --</option>
                        {assocMembers.map((m) => (
                          <option key={m.id || m.userId} value={m.userName}>
                            {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                          </option>
                        ))}
                      </Select2>
                    ) : (
                      <input
                        type="text"
                        value={handoverIncomingTreasurer}
                        onChange={(e) => setHandoverIncomingTreasurer(e.target.value)}
                        placeholder="Nom du/de la nouveau TG"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Date de la Cérémonie de Passation *
                  </label>
                  <input
                    type="date"
                    required
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Solde de Caisse Transmis (XOF) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={handoverTreasuryAmount}
                    onChange={(e) => setHandoverTreasuryAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Procès-Verbal de Passation &amp; Quitus (Observations)
                </label>
                <textarea
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Bilan synthétique, remise des clés, inventaire certifié, quitus financier et recommandations..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Checklist de Passation de Charges */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Checklist de Transmission des Actifs &amp; Attributs :
                </label>
                <div className="space-y-1.5 rounded-2xl border border-gray-200 p-3 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850">
                  {HANDOVER_CHECKLIST_ITEMS.map((item, idx) => {
                    const isChecked = selectedHandoverChecks.includes(item);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedHandoverChecks([...selectedHandoverChecks, item]);
                            } else {
                              setSelectedHandoverChecks(selectedHandoverChecks.filter((c) => c !== item));
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!handoverOutgoingMandateId || !handoverIncomingPresident.trim()}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
                >
                  Valider la Passation &amp; Sceller le PV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
