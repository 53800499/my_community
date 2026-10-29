'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { UsersIcon, PlusIcon, SearchIcon, CheckIcon } from '@/components/icons';
import Link from 'next/link';
import {
  Check,
  AlertTriangle,
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  Sparkles,
  Send,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  School,
  Building,
  FileSignature,
  Layers,
  Eye,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Users,
  UserCheck,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';
import {
  useAssociations,
  useAssociationMembers,
  AssociationMember,
  StudentAcademicInfo,
  AssociationCategory,
  associationApiService,
} from '@/features/associations';
import { userApiService, ApiUserSummary } from '@/features/users';
import { StudentOpportunityRelanceModal } from '@/components/dashboard/StudentOpportunityRelanceModal';

const BENIN_INSTITUTIONS = [
  'UAC (Université d’Abomey-Calavi)',
  'Université de Parakou (UP)',
  'UNSTIM (Natitingou / Lokossa / Abomey)',
  'UNA (Université Nationale d’Agriculture - Porto-Novo)',
  'Pigier Bénin (Cotonou)',
  'Epitech Bénin (Cotonou)',
  'ESM Bénin (École Supérieure de Management)',
  'HECM (Hautes Études Commerciales et de Management)',
  'ISM Adonaï',
  'UCAO (Université Catholique de l’Afrique de l’Ouest)',
  'Lycée Technique Coulibaly (Cotonou)',
  'Lycée Technique de Porto-Novo',
  'Autre Établissement (Saisie Libre)',
];

const STUDY_LEVELS = [
  { value: 'SECONDAIRE', label: 'Secondaire / Lycée / Collège' },
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3 / Finissants' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2 / Diplômés' },
  { value: 'DOCTORAT', label: 'Doctorat / Ph.D' },
  { value: 'FORMATION_PRO', label: 'Formation Pro & Certifiante' },
];

const OPPORTUNITY_TAGS = [
  { id: 'STAGE_ACADEMIQUE', label: 'Stage Académique / PFE' },
  { id: 'EMPLOI_ETUDIANT', label: 'Job Étudiant / Temps Partiel' },
  { id: 'BOURSE_ETUDE', label: 'Bourse d’Étude & Excellence' },
  { id: 'MENTORAT', label: 'Mentorat Professionnel' },
  { id: 'ALTERNANCE', label: 'Alternance & Apprentissage' },
  { id: 'VOLONTARIAT', label: 'Volontariat & Engagement Civique' },
];

export default function AssociationMembersPage() {
  const {
    associations,
    selectedAssociation,
    selectedAssocId,
    selectAssociation,
    isLoading: isLoadingAssocs,
  } = useAssociations();

  const {
    members,
    stats,
    isLoading: isLoadingMembers,
    isSubmitting,
    addMember,
    updateProfessionalInfo,
    dispatchOpportunityRelance,
  } = useAssociationMembers(selectedAssocId);

  // Typologie d'association active (Par défaut: 'COMMUNITY' - Citoyenne/Résidentielle)
  const category: AssociationCategory = selectedAssociation?.category || 'COMMUNITY';
  const isEducational = category === 'EDUCATIONAL';
  const isProfessional = category === 'PROFESSIONAL';
  const isProfessionalOrEducational = isEducational || isProfessional;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDues, setFilterDues] = useState<'ALL' | 'UP_TO_DATE' | 'LATE'>('ALL');
  const [filterStudyLevel, setFilterStudyLevel] = useState<string>('ALL');
  const [filterInstitution, setFilterInstitution] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [selectedMemberCard, setSelectedMemberCard] = useState<AssociationMember | null>(null);

  // Multi-association Directory State
  const [membersViewMode, setMembersViewMode] = useState<'ACTIVE_ASSOC' | 'MULTI_ASSOC_DIRECTORY'>('ACTIVE_ASSOC');
  const [allAssocMembers, setAllAssocMembers] = useState<Record<string, AssociationMember[]>>({});
  const [expandedAssocs, setExpandedAssocs] = useState<Record<string, boolean>>({});
  const [isLoadingAllAssocs, setIsLoadingAllAssocs] = useState(false);

  const loadAllAssocMembers = useCallback(async () => {
    if (associations.length === 0) return;
    setIsLoadingAllAssocs(true);
    try {
      const records: Record<string, AssociationMember[]> = {};
      await Promise.all(
        associations.map(async (assoc) => {
          try {
            const list = await associationApiService.listMembers(assoc.id);
            records[assoc.id] = list;
          } catch {
            records[assoc.id] = [];
          }
        })
      );
      setAllAssocMembers(records);
      setExpandedAssocs((prev) => {
        const next = { ...prev };
        associations.forEach((a) => {
          if (next[a.id] === undefined) next[a.id] = true;
        });
        return next;
      });
    } finally {
      setIsLoadingAllAssocs(false);
    }
  }, [associations]);

  useEffect(() => {
    loadAllAssocMembers();
  }, [loadAllAssocMembers]);

  const toggleAssocExpand = (assocId: string) => {
    setExpandedAssocs((prev) => ({ ...prev, [assocId]: !prev[assocId] }));
  };

  // Platform citizens pool & registration flow
  const [platformUsers, setPlatformUsers] = useState<ApiUserSummary[]>([]);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('');
  const [addMode, setAddMode] = useState<'EXISTING_CITIZEN' | 'INVITE_NEW'>('EXISTING_CITIZEN');
  const [newCitizenCity, setNewCitizenCity] = useState<string>('Abomey-Calavi');

  // Chargement des citoyens enregistrés sur la plateforme
  useEffect(() => {
    userApiService.list().then(setPlatformUsers).catch(() => { });
  }, []);

  // New member form
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  // Academic / Student personal information in registration modal
  const [isStudentMember, setIsStudentMember] = useState(false);
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [institutionName, setInstitutionName] = useState(
    selectedAssociation?.educationalInstitution ||
    selectedAssociation?.universityCampus ||
    BENIN_INSTITUTIONS[0],
  );
  const [customInstitution, setCustomInstitution] = useState('');
  const [faculty, setFaculty] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [studyLevel, setStudyLevel] = useState<string>('L3');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'STAGE_ACADEMIQUE',
    'EMPLOI_ETUDIANT',
  ]);

  // Professional information form state (Exclusivement pour associations professionnelles ou éducatives)
  const [editingProfessionalMember, setEditingProfessionalMember] = useState<AssociationMember | null>(null);
  const [profJobTitle, setProfJobTitle] = useState('');
  const [profCompany, setProfCompany] = useState('');
  const [profSector, setProfSector] = useState('');
  const [profExperience, setProfExperience] = useState<number>(1);
  const [profDegree, setProfDegree] = useState('');
  const [profSkills, setProfSkills] = useState('');
  const [profLinkedIn, setProfLinkedIn] = useState('');
  const [profPortfolio, setProfPortfolio] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profMentoring, setProfMentoring] = useState(false);
  const [isSavingProf, setIsSavingProf] = useState(false);

  // In Add Member modal:
  const [hasProfInfoInAdd, setHasProfInfoInAdd] = useState(false);
  const [addProfJobTitle, setAddProfJobTitle] = useState('');
  const [addProfCompany, setAddProfCompany] = useState('');
  const [addProfSector, setAddProfSector] = useState('');
  const [addProfDegree, setAddProfDegree] = useState('');

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  };

  const openProfessionalModal = (member: AssociationMember) => {
    setEditingProfessionalMember(member);
    setProfJobTitle(member.professionalInfo?.currentJobTitle || '');
    setProfCompany(member.professionalInfo?.company || member.professionalInfo?.companyOrOrganization || '');
    setProfSector(member.professionalInfo?.industrySector || '');
    setProfExperience(member.professionalInfo?.yearsOfExperience || 1);
    setProfDegree(member.professionalInfo?.highestDegree || '');
    setProfSkills(member.professionalInfo?.skills?.join(', ') || '');
    setProfLinkedIn(member.professionalInfo?.linkedInUrl || member.professionalInfo?.linkedinUrl || '');
    setProfPortfolio(member.professionalInfo?.portfolioUrl || '');
    setProfBio(member.professionalInfo?.bio || member.professionalInfo?.professionalBio || '');
    setProfMentoring(Boolean(member.professionalInfo?.isAvailableForMentoring));
  };

  const handleSaveProfessionalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfessionalMember) return;
    setIsSavingProf(true);
    try {
      const skillsArray = profSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateProfessionalInfo(editingProfessionalMember.id, {
        currentJobTitle: profJobTitle.trim() || undefined,
        company: profCompany.trim() || undefined,
        companyOrOrganization: profCompany.trim() || undefined,
        industrySector: profSector.trim() || undefined,
        yearsOfExperience: Number(profExperience) || 0,
        highestDegree: profDegree.trim() || undefined,
        skills: skillsArray,
        linkedInUrl: profLinkedIn.trim() || undefined,
        linkedinUrl: profLinkedIn.trim() || undefined,
        portfolioUrl: profPortfolio.trim() || undefined,
        bio: profBio.trim() || undefined,
        professionalBio: profBio.trim() || undefined,
        isAvailableForMentoring: profMentoring,
      });

      if (selectedMemberCard?.id === editingProfessionalMember.id) {
        setSelectedMemberCard(updated);
      }
      setEditingProfessionalMember(null);
      showToast(`Profil professionnel de « ${updated.userName} » enregistré avec succès !`);
    } catch {
      showToast('Erreur lors de la mise à jour des informations professionnelles.');
    } finally {
      setIsSavingProf(false);
    }
  };

  const toggleInterest = (tagId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const filteredMembers = members.filter((m) => {
    if (filterDues === 'UP_TO_DATE' && m.duesStatus !== 'UP_TO_DATE') return false;
    if (filterDues === 'LATE' && m.duesStatus !== 'LATE') return false;

    if (isEducational) {
      if (filterStudyLevel !== 'ALL' && m.studentInfo?.studyLevel !== filterStudyLevel) {
        return false;
      }
      if (filterInstitution !== 'ALL') {
        const inst = (
          m.studentInfo?.institutionName ||
          m.studentInfo?.university ||
          ''
        ).toLowerCase();
        if (!inst.includes(filterInstitution.toLowerCase())) return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchBasic =
        m.userName.toLowerCase().includes(q) ||
        (m.membershipCardNumber && m.membershipCardNumber.toLowerCase().includes(q)) ||
        (m.positionTitle && m.positionTitle.toLowerCase().includes(q));

      const matchStudent =
        (m.studentInfo?.studentIdNumber &&
          m.studentInfo.studentIdNumber.toLowerCase().includes(q)) ||
        (m.studentInfo?.institutionName &&
          m.studentInfo.institutionName.toLowerCase().includes(q)) ||
        (m.studentInfo?.university && m.studentInfo.university.toLowerCase().includes(q)) ||
        (m.studentInfo?.faculty && m.studentInfo.faculty.toLowerCase().includes(q)) ||
        (m.studentInfo?.fieldOfStudy && m.studentInfo.fieldOfStudy.toLowerCase().includes(q));

      return matchBasic || Boolean(matchStudent);
    }
    return true;
  });

  // Filtered associations for multi-association directory
  const filteredMultiAssocs = associations.filter((assoc) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchAssoc =
      assoc.name.toLowerCase().includes(term) ||
      (assoc.acronym && assoc.acronym.toLowerCase().includes(term)) ||
      (assoc.city && assoc.city.toLowerCase().includes(term));
    const mList = allAssocMembers[assoc.id] || [];
    const matchMember = mList.some(
      (m) =>
        m.userName.toLowerCase().includes(term) ||
        (m.membershipCardNumber && m.membershipCardNumber.toLowerCase().includes(term)) ||
        (m.userPhone && m.userPhone.toLowerCase().includes(term)) ||
        (m.userEmail && m.userEmail.toLowerCase().includes(term)) ||
        (m.studentInfo?.institutionName && m.studentInfo.institutionName.toLowerCase().includes(term)) ||
        (m.studentInfo?.university && m.studentInfo.university.toLowerCase().includes(term)) ||
        (m.professionalInfo?.currentJobTitle && m.professionalInfo.currentJobTitle.toLowerCase().includes(term)) ||
        (m.professionalInfo?.company && m.professionalInfo.company.toLowerCase().includes(term))
    );
    return matchAssoc || matchMember;
  });

  const handleOpenAddModal = () => {
    // Si l'association est éducative, cocher automatiquement le profil étudiant
    setIsStudentMember(isEducational);
    setSelectedCitizenId('');
    setAddMode('EXISTING_CITIZEN');
    setUserName('');
    setUserPhone('');
    setUserEmail('');
    userApiService.list().then(setPlatformUsers).catch(() => { });
    setIsAddModalOpen(true);
  };

  const handleSelectCitizen = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    const found = platformUsers.find((u) => u.id === citizenId);
    if (found) {
      setUserName(found.name);
      setUserPhone(found.phone);
      setUserEmail(found.email || '');
    } else {
      setUserName('');
      setUserPhone('');
      setUserEmail('');
    }
  };

  const isCitizenAlreadyMember = Boolean(
    selectedCitizenId &&
    members.some(
      (m) =>
        (m.userId && m.userId === selectedCitizenId) ||
        m.id === selectedCitizenId ||
        (userPhone && m.userPhone && m.userPhone.replace(/\s+/g, '') === userPhone.replace(/\s+/g, '')),
    ),
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    if (addMode === 'EXISTING_CITIZEN' && isCitizenAlreadyMember) {
      showToast('Ce citoyen est déjà membre adhérent de l’association.');
      return;
    }

    try {
      let finalUserId = selectedCitizenId;

      // Si mode création d'un citoyen non encore répertorié : on l'enregistre d'abord sur la plateforme !
      if (addMode === 'INVITE_NEW' || !finalUserId) {
        const createdCitizen = await userApiService.registerCitizen({
          name: userName.trim(),
          phone: userPhone.trim(),
          email: userEmail.trim() || undefined,
          city: newCitizenCity.trim() || undefined,
        });
        finalUserId = createdCitizen.id;
        setPlatformUsers((prev) => [createdCitizen, ...prev]);
      }

      const finalInstitution =
        institutionName === 'Autre Établissement (Saisie Libre)'
          ? customInstitution.trim() || undefined
          : institutionName;

      const created = await addMember({
        userId: finalUserId,
        userName: userName.trim(),
        userPhone: userPhone.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        role,
        isStudent: isStudentMember,
        studentInfo: isStudentMember
          ? {
            studentIdNumber:
              studentIdNumber.trim() ||
              `ETU-${Math.floor(10000000 + Math.random() * 90000000)}`,
            institutionName: finalInstitution,
            university: finalInstitution,
            faculty: faculty.trim() || undefined,
            fieldOfStudy: fieldOfStudy.trim() || undefined,
            studyLevel,
            academicYear: '2025-2026',
            opportunityInterests: selectedInterests,
          }
          : undefined,
        professionalInfo:
          isProfessionalOrEducational && hasProfInfoInAdd && addProfJobTitle.trim()
            ? {
              currentJobTitle: addProfJobTitle.trim(),
              company: addProfCompany.trim() || undefined,
              companyOrOrganization: addProfCompany.trim() || undefined,
              industrySector: addProfSector.trim() || undefined,
              highestDegree: addProfDegree.trim() || undefined,
            }
            : undefined,
      });

      setIsAddModalOpen(false);
      setSelectedCitizenId('');
      setUserName('');
      setUserPhone('');
      setUserEmail('');
      setStudentIdNumber('');
      setCustomInstitution('');
      setFaculty('');
      setFieldOfStudy('');
      setHasProfInfoInAdd(false);
      setAddProfJobTitle('');
      setAddProfCompany('');
      setAddProfSector('');
      setAddProfDegree('');
      showToast(
        `Adhérent « ${created.userName} » affilié avec succès (Matricule: ${created.membershipCardNumber}) !`,
      );
    } catch {
      showToast('Erreur lors de l’inscription de l’adhérent.');
    }
  };

  const renderCategoryBadge = (cat: AssociationCategory) => {
    switch (cat) {
      case 'EDUCATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <School className="size-3.5" />
            <span>Association Éducative &amp; Estudiantine</span>
          </span>
        );
      case 'PROFESSIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Briefcase className="size-3.5" />
            <span>Groupement Professionnel &amp; Artisans</span>
          </span>
        );
      case 'CULTURAL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="size-3.5" />
            <span>Association Culturelle &amp; Arts</span>
          </span>
        );
      case 'SPORT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Award className="size-3.5" />
            <span>Association Sportive &amp; Loisirs</span>
          </span>
        );
      case 'HUMANITARIAN':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <UsersIcon className="size-3.5" />
            <span>Association Solidaire &amp; Entraide</span>
          </span>
        );
      case 'COMMUNITY':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Building2 className="size-3.5" />
            <span>Association Citoyenne &amp; Résidentielle</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-top-3">
          <CheckIcon className="size-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Registre des Adhérents &amp; Suivi des Membres
            </h1>
            {isEducational ? (
              <Badge variant="solid" color="primary" size="sm">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <GraduationCap className="size-3.5" />
                  <span>Cadre Éducatif &amp; Apprenants</span>
                </span>
              </Badge>
            ) : (
              <Badge variant="light" color="primary" size="sm">
                Annuaire Statutaire Citoyen
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isEducational
              ? 'Tenue du registre des élèves et étudiants (tous établissements publics et privés), gestion des matricules et relances d’opportunités de stages, bourses et mentorats.'
              : 'Enregistrement officiel des membres adhérents, attribution des matricules statutaires et suivi du recouvrement des cotisations mensuelles en FCFA.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/associations/governance"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            <FileSignature className="size-4" />
            <span>Règles d'Intégration &amp; Mandats</span>
          </Link>
          {/* Bouton de Diffusion d'Opportunités Étudiantes si Association Éducative */}
          {isEducational && (
            <button
              type="button"
              onClick={() => setIsOpportunityModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-700 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-98"
            >
              <Sparkles className="size-4 text-yellow-300" />
              <span>Diffuser une Opportunité / Stage</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 active:scale-98"
          >
            <PlusIcon className="size-4" />
            <span>Inscrire un Adhérent</span>
          </button>
        </div>
      </div>

      {/* Switcher Vue Association Active vs Annuaire Consolidé de Chaque Association */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMembersViewMode('ACTIVE_ASSOC')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${membersViewMode === 'ACTIVE_ASSOC'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
          >
            <UsersIcon className="size-4" />
            <span>Association Active ({selectedAssociation?.name || 'Sélection'})</span>
          </button>

          <button
            type="button"
            onClick={() => setMembersViewMode('MULTI_ASSOC_DIRECTORY')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${membersViewMode === 'MULTI_ASSOC_DIRECTORY'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
          >
            <Layers className="size-4" />
            <span>Annuaire Consolidé : Membres de Chaque Association ({associations.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher adhérent, matricule, école, métier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* 1. VUE CONSOLIDÉE : LISTING DES MEMBRES DE CHAQUE ASSOCIATION */}
      {membersViewMode === 'MULTI_ASSOC_DIRECTORY' && (
        <div className="space-y-6">
          {isLoadingAllAssocs && associations.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              Chargement des associations et des membres...
            </div>
          ) : filteredMultiAssocs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <UsersIcon className="mx-auto size-10 text-gray-400" />
              <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Aucune association ou membre trouvé
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                {searchTerm
                  ? 'Aucun résultat ne correspond à votre recherche multi-associations.'
                  : 'Aucune association enregistrée dans la plateforme.'}
              </p>
            </div>
          ) : (
            filteredMultiAssocs.map((assoc) => {
              const assocMembers = allAssocMembers[assoc.id] || [];
              const isAssocExpanded = expandedAssocs[assoc.id] !== false;
              const isThisActive = assoc.id === selectedAssocId;

              // Filter members for this association if search term is active
              const displayedMembers = assocMembers.filter((m) => {
                if (!searchTerm.trim()) return true;
                const q = searchTerm.toLowerCase();
                return (
                  m.userName.toLowerCase().includes(q) ||
                  (m.membershipCardNumber && m.membershipCardNumber.toLowerCase().includes(q)) ||
                  (m.userPhone && m.userPhone.toLowerCase().includes(q)) ||
                  (m.userEmail && m.userEmail.toLowerCase().includes(q)) ||
                  (m.positionTitle && m.positionTitle.toLowerCase().includes(q)) ||
                  (m.studentInfo?.institutionName && m.studentInfo.institutionName.toLowerCase().includes(q)) ||
                  (m.studentInfo?.university && m.studentInfo.university.toLowerCase().includes(q)) ||
                  (m.studentInfo?.faculty && m.studentInfo.faculty.toLowerCase().includes(q)) ||
                  (m.studentInfo?.fieldOfStudy && m.studentInfo.fieldOfStudy.toLowerCase().includes(q)) ||
                  (m.professionalInfo?.currentJobTitle && m.professionalInfo.currentJobTitle.toLowerCase().includes(q)) ||
                  (m.professionalInfo?.company && m.professionalInfo.company.toLowerCase().includes(q))
                );
              });

              return (
                <div
                  key={assoc.id}
                  className={`rounded-3xl border shadow-xs overflow-hidden transition ${isThisActive
                      ? 'border-brand-300 bg-white dark:border-brand-900/60 dark:bg-gray-900'
                      : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                    }`}
                >
                  {/* Association Header Card */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 dark:from-gray-800/40 dark:via-gray-900 dark:to-gray-800/20">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 shrink-0 shadow-xs border border-brand-100 dark:border-brand-900/40">
                          <Building2 className="size-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">
                              {assoc.name}
                            </h3>
                            {assoc.acronym && (
                              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {assoc.acronym}
                              </span>
                            )}
                            {isThisActive && (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
                                Actuellement Sélectionnée
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3 text-gray-400" />
                              <span>{assoc.territory || assoc.city || 'Bénin'}</span>
                            </span>
                            {assoc.registrationNumber && (
                              <span>• N° {assoc.registrationNumber}</span>
                            )}
                            {assoc.description && (
                              <span className="truncate max-w-md">• {assoc.description}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Badges & Association Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          {renderCategoryBadge(assoc.category || 'COMMUNITY')}
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1 text-gray-700 font-semibold dark:bg-gray-800 dark:text-gray-300">
                            <Users className="size-3.5 text-gray-500" />
                            <span>{assocMembers.length} adhérent{assocMembers.length > 1 ? 's' : ''}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1 text-brand-700 font-semibold dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                            <CreditCard className="size-3.5 text-brand-600" />
                            <span>{assoc.monthlyDuesXOF || 1000} FCFA/mois</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2 sm:pl-3 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => {
                              selectAssociation(assoc.id);
                              setMembersViewMode('ACTIVE_ASSOC');
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                            title="Ouvrir la gestion détaillée de cette association"
                          >
                            <Eye className="size-3.5" />
                            <span>Gérer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              selectAssociation(assoc.id);
                              handleOpenAddModal();
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            title="Inscrire un nouvel adhérent dans cette association"
                          >
                            <PlusIcon className="size-3.5" />
                            <span>Membre</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAssocExpand(assoc.id)}
                            className="rounded-xl p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
                            title={isAssocExpanded ? 'Réduire la liste' : 'Déplier les membres'}
                          >
                            {isAssocExpanded ? (
                              <ChevronDown className="size-4.5" />
                            ) : (
                              <ChevronRight className="size-4.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members Table for this association */}
                  {isAssocExpanded && (
                    <div className="overflow-x-auto">
                      {displayedMembers.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50/30 dark:bg-gray-950/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {searchTerm
                              ? 'Aucun membre de cette association ne correspond à la recherche.'
                              : 'Aucun adhérent enregistré pour le moment dans cette association.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              selectAssociation(assoc.id);
                              handleOpenAddModal();
                            }}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                          >
                            <PlusIcon className="size-3.5" />
                            <span>Inscrire le premier adhérent</span>
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                            <tr>
                              <th className="px-4 py-3">Adhérent &amp; Matricule</th>
                              <th className="px-4 py-3">Rôle / Poste</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3">Cotisations</th>
                              <th className="px-4 py-3">
                                {assoc.category === 'EDUCATIONAL'
                                  ? 'Cursus Étudiant & Établissement'
                                  : assoc.category === 'PROFESSIONAL'
                                    ? 'Métier & Réseau Professionnel'
                                    : 'Informations Complémentaires'}
                              </th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {displayedMembers.map((m) => {
                              const isEduAssoc = assoc.category === 'EDUCATIONAL';
                              const isProfAssoc = assoc.category === 'PROFESSIONAL';
                              const canHaveProf = isEduAssoc || isProfAssoc;

                              return (
                                <tr
                                  key={m.id}
                                  className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                                >
                                  {/* Adhérent & Matricule */}
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-brand-500 to-indigo-600 text-[11px] font-bold text-white shadow-xs">
                                        {m.userName.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                          {m.userName}
                                        </p>
                                        <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                                          {m.membershipCardNumber || 'BJ-ADH-PENDING'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Rôle */}
                                  <td className="px-4 py-3">
                                    <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                      {m.positionTitle ||
                                        (m.roles.includes('PRESIDENT')
                                          ? 'Président(e)'
                                          : m.roles.includes('SECRETARY')
                                            ? 'Secrétaire'
                                            : m.roles.includes('TREASURER')
                                              ? 'Trésorier(ère)'
                                              : 'Membre Adhérent')}
                                    </span>
                                  </td>

                                  {/* Contact */}
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                    <div className="space-y-0.5 text-[11px]">
                                      {m.userPhone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="size-3 text-gray-400" />
                                          <span>{m.userPhone}</span>
                                        </div>
                                      )}
                                      {m.userEmail && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="size-3 text-gray-400" />
                                          <span className="truncate max-w-[150px]">{m.userEmail}</span>
                                        </div>
                                      )}
                                      {!m.userPhone && !m.userEmail && (
                                        <span className="text-gray-400 italic">Non renseigné</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Cotisations */}
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${m.duesStatus === 'UP_TO_DATE'
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                          : m.duesStatus === 'LATE'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}
                                    >
                                      {m.duesStatus === 'UP_TO_DATE'
                                        ? 'À jour'
                                        : m.duesStatus === 'LATE'
                                          ? 'En retard'
                                          : 'En attente'}
                                    </span>
                                  </td>

                                  {/* Profil Spécifique */}
                                  <td className="px-4 py-3">
                                    {isEduAssoc && m.studentInfo ? (
                                      <div className="space-y-0.5 text-[11px]">
                                        <div className="flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300">
                                          <School className="size-3" />
                                          <span>
                                            {m.studentInfo.institutionName ||
                                              m.studentInfo.university ||
                                              'Établissement'}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">
                                          {m.studentInfo.studyLevel}
                                          {m.studentInfo.fieldOfStudy ? ` • ${m.studentInfo.fieldOfStudy}` : ''}
                                        </p>
                                      </div>
                                    ) : canHaveProf && m.professionalInfo?.currentJobTitle ? (
                                      <div className="space-y-0.5 text-[11px]">
                                        <div className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                                          <Briefcase className="size-3" />
                                          <span>
                                            {m.professionalInfo.currentJobTitle}
                                            {m.professionalInfo.company ? ` @ ${m.professionalInfo.company}` : ''}
                                          </span>
                                        </div>
                                        {m.professionalInfo.isAvailableForMentoring && (
                                          <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            Mentor disponible
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-gray-400 italic">
                                        Adhésion standard
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMemberCard(m)}
                                        className="rounded-lg bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                        title="Voir la fiche de l'adhérent"
                                      >
                                        <Eye className="size-3.5" />
                                      </button>
                                      {canHaveProf && (
                                        <button
                                          type="button"
                                          onClick={() => openProfessionalModal(m)}
                                          className="rounded-lg bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                                          title="Gérer les informations professionnelles"
                                        >
                                          <Briefcase className="size-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. VUE DÉTAILLÉE DE L'ASSOCIATION ACTIVE */}
      {membersViewMode === 'ACTIVE_ASSOC' && (
        <>
          {/* Association Selector Card avec Typologie et Établissement le cas échéant */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                  Association active :
                </span>
                <div className="w-full sm:w-auto sm:min-w-[280px]">
                  <Select2
                    value={selectedAssocId}
                    onChange={(e) => selectAssociation(e.target.value)}
                    disabled={isLoadingAssocs}
                    className="w-full"
                  >
                    {associations.map((a) => {
                      const catLabel =
                        a.category === 'EDUCATIONAL'
                          ? 'Éducative'
                          : a.category === 'PROFESSIONAL'
                            ? 'Professionnelle'
                            : a.category === 'SPORT'
                              ? 'Sport'
                              : a.category === 'CULTURAL'
                                ? 'Culture'
                                : 'Citoyenne';
                      return (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.acronym || 'ASSO'}) — {catLabel}
                        </option>
                      );
                    })}
                  </Select2>
                </div>

                {/* Badge de typologie dynamique */}
                <div className="shrink-0">{renderCategoryBadge(category)}</div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {(selectedAssociation?.educationalInstitution ||
                  selectedAssociation?.universityCampus) && (
                    <div className="flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400">
                      <School className="size-4" />
                      <span>
                        {selectedAssociation.educationalInstitution ||
                          selectedAssociation.universityCampus}
                      </span>
                    </div>
                  )}
                <div>
                  Cotisation mensuelle :{' '}
                  <strong className="text-gray-900 dark:text-white">
                    {selectedAssociation?.monthlyDuesXOF || 1000} FCFA
                  </strong>
                </div>
              </div>
            </div>

            {/* Bannière explicative conditionnelle si association éducative */}
            {isEducational && (
              <div className="mt-3.5 flex items-start gap-3 rounded-xl bg-linear-to-r from-indigo-50/80 to-purple-50/80 p-3 text-xs text-indigo-900 dark:from-indigo-950/30 dark:to-purple-950/30 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/40">
                <GraduationCap className="size-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-bold">Espace de Gestion des Apprenants &amp; Étudiants</p>
                  <p className="mt-0.5 text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                    Cette association est identifiée comme un cadre éducatif. Les profils des membres
                    peuvent être rattachés à n’importe quel établissement béninois ou international
                    (universités publiques, grandes écoles privées, lycées techniques ou centres de
                    formation) pour faciliter les relances d’opportunités ciblées.
                  </p>
                </div>
              </div>
            )}

            {/* Bannière explicative conditionnelle si association professionnelle */}
            {isProfessional && (
              <div className="mt-3.5 flex items-start gap-3 rounded-xl bg-linear-to-r from-amber-50/80 to-orange-50/80 p-3 text-xs text-amber-900 dark:from-amber-950/30 dark:to-orange-950/30 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40">
                <Briefcase className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">Groupement Professionnel &amp; Réseau de Compétences</p>
                  <p className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Cette association est identifiée comme un cadre professionnel. Chaque adhérent peut
                    renseigner son poste, son entreprise, son secteur d'activité, ses compétences et
                    se rendre disponible pour le mentorat professionnel des autres membres.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* KPIs Adhésions (4 cartes standard, ou 5 cartes si éducative) */}
          <div
            className={`grid grid-cols-2 gap-4 ${isEducational ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Total Adhérents Enregistrés
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
              <p className="mt-1 text-[10px] text-gray-400">Cartes de membres émises</p>
            </div>

            {isEducational && (
              <div className="rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50 to-purple-50/50 p-4 shadow-xs dark:border-indigo-900 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                    Profils Apprenants
                  </p>
                  <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="mt-1 text-2xl font-black text-indigo-900 dark:text-white">
                  {stats.studentsCount}
                </p>
                <p className="mt-1 text-[10px] text-indigo-600/80 dark:text-indigo-300/80">
                  Cursus &amp; filières renseignés
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Cotisations à Jour
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.upToDate}
              </p>
              <p className="mt-1 text-[10px] text-emerald-500">Membres en règle</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Cotisations en Attente
              </p>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.pending}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">Échéance fin de mois</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-medium text-red-600 dark:text-red-400">En Retard</p>
              <p className="mt-1 text-2xl font-black text-red-600 dark:text-red-400">{stats.late}</p>
              <p className="mt-1 text-[10px] text-red-400">Relance de trésorerie</p>
            </div>
          </div>

          {/* Barre de Recherche et Filtres */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isEducational
                      ? 'Recherche par nom, matricule, école, filière...'
                      : 'Rechercher par nom, matricule ou poste...'
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterDues('ALL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filterDues === 'ALL'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                  Tous ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDues('UP_TO_DATE')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filterDues === 'UP_TO_DATE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                  À jour ({stats.upToDate})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDues('LATE')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filterDues === 'LATE'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                  Retards ({stats.late})
                </button>
              </div>
            </div>

            {/* Filtres de cohortes uniquement si Association Éducative */}
            {isEducational && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-850/40">
                <div className="flex items-center gap-1.5 font-bold text-gray-600 dark:text-gray-300">
                  <SlidersHorizontal className="size-3.5 text-indigo-600" />
                  <span>Cohortes d’Étude :</span>
                </div>

                {/* Filtre par Niveau d'études */}
                <div className="flex flex-wrap items-center gap-1">
                  {['ALL', 'SECONDAIRE', 'L1', 'L2', 'L3', 'M1', 'M2', 'DOCTORAT'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFilterStudyLevel(lvl)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${filterStudyLevel === lvl
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-gray-600 hover:bg-gray-200/60 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                    >
                      {lvl === 'ALL' ? 'Tous Niveaux' : lvl}
                    </button>
                  ))}
                </div>

                <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 sm:block" />

                {/* Filtre par Établissement */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] text-gray-500 shrink-0">Pôle :</span>
                  <div className="w-full sm:w-auto sm:min-w-[160px]">
                    <Select2
                      value={filterInstitution}
                      onChange={(e) => setFilterInstitution(e.target.value)}
                      className="w-full"
                    >
                      <option value="ALL">Tous établissements</option>
                      <option value="UAC">UAC</option>
                      <option value="Parakou">UP (Parakou)</option>
                      <option value="UNSTIM">UNSTIM</option>
                      <option value="UNA">UNA</option>
                      <option value="Pigier">Pigier Bénin</option>
                      <option value="Epitech">Epitech Bénin</option>
                      <option value="Lycée">Lycées &amp; Technique</option>
                    </Select2>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tableau des Membres */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {isLoadingMembers ? (
              <div className="p-12 text-center text-xs text-gray-500">Chargement des membres...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                Aucun adhérent ne correspond aux critères sélectionnés.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-850 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5">Adhérent &amp; Contact</th>
                      <th className="px-5 py-3.5">Matricule Statutaire</th>
                      <th className="px-5 py-3.5">
                        {isEducational ? 'Rôle & Cursus' : 'Rôle / Titre Officiel'}
                      </th>
                      <th className="px-5 py-3.5">Date Adhésion</th>
                      <th className="px-5 py-3.5">Cotisation XOF</th>
                      <th className="px-5 py-3.5 text-right">Carte &amp; Relance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-bold ${m.isStudent
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                                }`}
                            >
                              {m.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{m.userName}</p>
                              <p className="text-[11px] text-gray-400">{m.userPhone || m.userEmail}</p>

                              {/* Badge de cursus étudiant/apprenant si renseigné */}
                              {m.isStudent && m.studentInfo && (
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    <GraduationCap className="size-3" />
                                    <span>
                                      {m.studentInfo.studyLevel ? `${m.studentInfo.studyLevel} — ` : ''}
                                      {m.studentInfo.institutionName ||
                                        m.studentInfo.university ||
                                        'Apprenant'}
                                    </span>
                                  </span>
                                  {m.studentInfo.faculty && (
                                    <span className="text-[10px] text-gray-500 font-medium">
                                      [{m.studentInfo.faculty}]
                                    </span>
                                  )}
                                  {m.studentInfo.fieldOfStudy && (
                                    <span className="text-[10px] text-gray-400 italic">
                                      ({m.studentInfo.fieldOfStudy})
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Badge d'informations professionnelles si association Pro ou Éducative */}
                              {isProfessionalOrEducational && m.professionalInfo?.currentJobTitle && (
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                    <Briefcase className="size-3 text-amber-600 dark:text-amber-400" />
                                    <span>
                                      {m.professionalInfo.currentJobTitle}
                                      {(m.professionalInfo.company || m.professionalInfo.companyOrOrganization)
                                        ? ` @ ${m.professionalInfo.company || m.professionalInfo.companyOrOrganization}`
                                        : ''}
                                    </span>
                                  </span>
                                  {m.professionalInfo.isAvailableForMentoring && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                      <GraduationCap className="size-3 text-emerald-600 dark:text-emerald-400" />
                                      <span>Mentor</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-gray-800 dark:text-gray-200">
                            {m.membershipCardNumber || 'BJ-ADH-000'}
                          </p>
                          {m.isStudent && m.studentInfo?.studentIdNumber && (
                            <p className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                              Matricule : {m.studentInfo.studentIdNumber}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {m.positionTitle ? (
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                              {m.positionTitle}
                            </span>
                          ) : (
                            <Badge
                              variant="light"
                              color={m.roles.includes('PRESIDENT') ? 'primary' : 'light'}
                              size="sm"
                            >
                              {m.roles[0]}
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                          {new Date(m.joinedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="px-5 py-4">
                          {m.duesStatus === 'UP_TO_DATE' ? (
                            <Badge variant="light" color="success" size="sm">
                              <span className="inline-flex items-center gap-1">
                                <Check className="size-3" />
                                <span>À jour</span>
                              </span>
                            </Badge>
                          ) : m.duesStatus === 'LATE' ? (
                            <Badge variant="light" color="error" size="sm">
                              <span className="inline-flex items-center gap-1">
                                <AlertTriangle className="size-3" />
                                <span>En retard</span>
                              </span>
                            </Badge>
                          ) : (
                            <Badge variant="light" color="warning" size="sm">
                              En attente
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMemberCard(m)}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                              Voir Carte
                            </button>

                            {isProfessionalOrEducational && (
                              <button
                                type="button"
                                onClick={() => openProfessionalModal(m)}
                                title="Renseigner ou éditer les informations professionnelles"
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 transition"
                              >
                                <Briefcase className="size-3 text-amber-600 dark:text-amber-400" />
                                <span>Profil Pro</span>
                              </button>
                            )}

                            {isEducational && m.isStudent && (
                              <button
                                type="button"
                                onClick={() => setIsOpportunityModalOpen(true)}
                                title="Diffuser une opportunité ciblée pour ce profil"
                                className="rounded-lg bg-indigo-50 p-1 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                              >
                                <Send className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Inscription Membre (Universel & Adaptatif) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <PlusIcon className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Inscrire un Nouvel Adhérent
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Registre officiel &amp; attribution du matricule statutaire
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              {/* Sélecteur de Mode : Citoyen Déjà Inscrit vs Inviter Nouveau Citoyen */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-1 dark:border-gray-800 dark:bg-gray-950/50">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode('EXISTING_CITIZEN');
                      if (selectedCitizenId) {
                        handleSelectCitizen(selectedCitizenId);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition ${addMode === 'EXISTING_CITIZEN'
                        ? 'bg-white text-brand-600 shadow-xs dark:bg-gray-800 dark:text-brand-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    <UserCheck className="size-3.5" />
                    <span>Citoyen Inscrit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddMode('INVITE_NEW');
                      setSelectedCitizenId('');
                      setUserName('');
                      setUserPhone('');
                      setUserEmail('');
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition ${addMode === 'INVITE_NEW'
                        ? 'bg-white text-brand-600 shadow-xs dark:bg-gray-800 dark:text-brand-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    <UserPlus className="size-3.5" />
                    <span>Nouveau / Invité</span>
                  </button>
                </div>
              </div>

              {/* Mode 1 : Sélection d'un Citoyen déjà inscrit */}
              {addMode === 'EXISTING_CITIZEN' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300 flex items-start gap-2">
                    <Info className="size-4 shrink-0 text-brand-600 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Règle de gouvernance :</strong> Pour être nommé à un poste ou participer aux votes, le citoyen doit d'abord être inscrit sur la plateforme et figurer dans ce registre des membres.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Rechercher un Citoyen sur la Plateforme *
                    </label>
                    <Select2
                      value={selectedCitizenId}
                      onChange={(e) => handleSelectCitizen(e.target.value)}
                      className="mt-1 w-full"
                      placeholder="-- Taper un nom, prénom ou téléphone --"
                      required
                    >
                      <option value="">-- Choisir un citoyen inscrit --</option>
                      {platformUsers.map((u) => {
                        const isMember = members.some(
                          (m) =>
                            (m.userId && m.userId === u.id) ||
                            m.id === u.id ||
                            (u.phone && m.userPhone && m.userPhone.replace(/\s+/g, '') === u.phone.replace(/\s+/g, '')),
                        );
                        return (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.phone}){u.city ? ` • ${u.city}` : ''}{isMember ? ' [Déjà Membre]' : ''}
                          </option>
                        );
                      })}
                    </Select2>
                  </div>

                  {isCitizenAlreadyMember && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                      <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                      <span>Ce citoyen est déjà membre officiel de cette association. Vous pouvez modifier ses responsabilités depuis l'organigramme du bureau ou sa fiche membre.</span>
                    </div>
                  )}

                  {selectedCitizenId && !isCitizenAlreadyMember && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Compte citoyen vérifié</span>
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                          Prêt pour adhésion
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                        <div><span className="text-gray-400">Nom :</span> {userName}</div>
                        <div><span className="text-gray-400">Tél :</span> {userPhone}</div>
                        {userEmail && <div className="col-span-2"><span className="text-gray-400">Email :</span> {userEmail}</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2 : Inscription préalable sur la plateforme */}
              {addMode === 'INVITE_NEW' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-start gap-2">
                    <UserPlus className="size-4 shrink-0 text-indigo-600 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">
                      Le citoyen sera enregistré sur <strong>My Community</strong> avec son identifiant citoyen unique, puis rattaché immédiatement au registre de votre association.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Nom &amp; Prénoms du Citoyen *
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ex: Sèdami Gbaguidi"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Numéro de Téléphone (Bénin) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="Ex: +229 97 00 00 00"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Adresse Email (Optionnelle)
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Ex: sedami@gmail.com"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Ville / Commune de Résidence
                    </label>
                    <input
                      type="text"
                      value={newCitizenCity}
                      onChange={(e) => setNewCitizenCity(e.target.value)}
                      placeholder="Ex: Abomey-Calavi, Cotonou, Parakou..."
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Rôle Statutaire
                </label>
                <Select2
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full"
                >
                  <option value="MEMBER">Membre Adhérent Actif</option>
                  <option value="DELEGATE">Délégué / Représentant de Section</option>
                  <option value="VOLUNTEER">Bénévole / Membre Engagé</option>
                </Select2>
              </div>

              {/* Section Cursus / Apprenant (Optionnelle pour assos citoyennes, mise en avant si éducative) */}
              <div
                className={`rounded-2xl border p-4 space-y-3.5 transition ${isStudentMember
                    ? 'border-indigo-200 bg-linear-to-b from-indigo-50/50 to-purple-50/30 dark:border-indigo-900 dark:bg-indigo-950/20'
                    : 'border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-950/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Profil Académique / Apprenant
                      </span>
                      <p className="text-[10px] text-gray-500">
                        Pour faciliter les opportunités de stage, alternance &amp; bourses
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={isStudentMember}
                      onChange={(e) => setIsStudentMember(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Actif / Étudiant</span>
                  </label>
                </div>

                {isStudentMember && (
                  <div className="space-y-3 pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Matricule Étudiant / Élève
                        </label>
                        <input
                          type="text"
                          value={studentIdNumber}
                          onChange={(e) => setStudentIdNumber(e.target.value)}
                          placeholder="Ex: 21908472"
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Niveau d’Études
                        </label>
                        <Select2
                          value={studyLevel}
                          onChange={(e) => setStudyLevel(e.target.value)}
                          className="mt-1 w-full"
                        >
                          {STUDY_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>
                              {lvl.label}
                            </option>
                          ))}
                        </Select2>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        Établissement, Université ou École
                      </label>
                      <div className="mt-1">
                        <Select2
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          placeholder="Rechercher ou sélectionner un établissement..."
                        >
                          {BENIN_INSTITUTIONS.map((inst) => (
                            <option key={inst} value={inst}>
                              {inst}
                            </option>
                          ))}
                        </Select2>
                      </div>
                    </div>

                    {institutionName === 'Autre Établissement (Saisie Libre)' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Précisez le nom de l’établissement / école
                        </label>
                        <input
                          type="text"
                          value={customInstitution}
                          onChange={(e) => setCustomInstitution(e.target.value)}
                          placeholder="Ex: Institut Universitaire des Métiers (IUM) / Lycée..."
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Faculté / UFR / Département
                        </label>
                        <input
                          type="text"
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          placeholder="Ex: Sciences Économiques, EPAC, Génie Méca..."
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          Filière / Spécialité / Option
                        </label>
                        <input
                          type="text"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                          placeholder="Ex: Génie Logiciel, Comptabilité, Droit..."
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Centres d’intérêt pour relances d’opportunités :
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {OPPORTUNITY_TAGS.map((t) => {
                          const isSelected = selectedInterests.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleInterest(t.id)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                }`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Informations Professionnelles (Strictement pour associations Professionnelles ou Éducatives) */}
              {isProfessionalOrEducational && (
                <div
                  className={`rounded-2xl border p-4 space-y-3.5 transition ${hasProfInfoInAdd
                      ? 'border-amber-200 bg-linear-to-b from-amber-50/50 to-orange-50/30 dark:border-amber-900 dark:bg-amber-950/20'
                      : 'border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-950/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Profil Professionnel (Optionnel)
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Métier, structure et secteur d'activité
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={hasProfInfoInAdd}
                        onChange={(e) => setHasProfInfoInAdd(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Renseigner profil pro</span>
                    </label>
                  </div>

                  {hasProfInfoInAdd && (
                    <div className="space-y-3 pt-1 border-t border-amber-100 dark:border-amber-900/60">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Poste / Titre Professionnel *
                          </label>
                          <input
                            type="text"
                            value={addProfJobTitle}
                            onChange={(e) => setAddProfJobTitle(e.target.value)}
                            placeholder="Ex: Ingénieur Logiciel, Comptable..."
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Entreprise / Organisation
                          </label>
                          <input
                            type="text"
                            value={addProfCompany}
                            onChange={(e) => setAddProfCompany(e.target.value)}
                            placeholder="Ex: Cabinet Audit, Start-up, ONG..."
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Secteur d'Activité
                          </label>
                          <input
                            type="text"
                            value={addProfSector}
                            onChange={(e) => setAddProfSector(e.target.value)}
                            placeholder="Ex: Numérique, Santé, BTP, Finance..."
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Diplôme le plus élevé
                          </label>
                          <input
                            type="text"
                            value={addProfDegree}
                            onChange={(e) => setAddProfDegree(e.target.value)}
                            placeholder="Ex: Master, Licence, Doctorat..."
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !userName.trim() ||
                    (addMode === 'EXISTING_CITIZEN' && (!selectedCitizenId || isCitizenAlreadyMember)) ||
                    (addMode === 'INVITE_NEW' && !userPhone.trim())
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  <span>
                    {isSubmitting
                      ? 'Traitement en cours...'
                      : addMode === 'EXISTING_CITIZEN'
                        ? 'Affilier au Registre'
                        : 'Inscrire & Affilier'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carte d'Adhérent (Adapté à toutes les typologies d'association) */}
      {selectedMemberCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl border ${isEducational
                ? 'bg-linear-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/40'
                : 'bg-linear-to-br from-brand-900 via-indigo-900 to-slate-900 border-brand-500/30'
              }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-brand-300 uppercase">
                  {isEducational
                    ? 'RÉPUBLIQUE DU BÉNIN — CADRE ÉDUCATIF & ACADÉMIQUE'
                    : 'RÉPUBLIQUE DU BÉNIN'}
                </span>
                <p className="text-xs font-black truncate max-w-[240px]">
                  {selectedAssociation?.name || 'Association Reconnue'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberCard(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black border border-white/20">
                {selectedMemberCard.userName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black">{selectedMemberCard.userName}</p>
                <p className="text-xs text-brand-200">
                  {selectedMemberCard.positionTitle || 'Membre Adhérent Actif'}
                </p>
                <span className="inline-block mt-1 font-mono text-[11px] font-bold text-amber-300">
                  {selectedMemberCard.membershipCardNumber}
                </span>
              </div>
            </div>

            {/* Informations Établissement / Apprenant Spécifiques si renseignées */}
            {selectedMemberCard.isStudent && selectedMemberCard.studentInfo && (
              <div className="mt-4 rounded-2xl bg-indigo-900/40 border border-indigo-400/30 p-3 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>Matricule Étudiant / Élève :</span>
                  <span className="font-mono text-white">
                    {selectedMemberCard.studentInfo.studentIdNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Établissement / École :</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {selectedMemberCard.studentInfo.institutionName ||
                      selectedMemberCard.studentInfo.university ||
                      'Non renseigné'}
                  </span>
                </div>
                {(selectedMemberCard.studentInfo.faculty ||
                  selectedMemberCard.studentInfo.fieldOfStudy) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Cursus &amp; Filière :</span>
                      <span className="font-semibold text-amber-200 truncate max-w-[180px]">
                        {selectedMemberCard.studentInfo.studyLevel
                          ? `${selectedMemberCard.studentInfo.studyLevel} — `
                          : ''}
                        {selectedMemberCard.studentInfo.faculty ||
                          selectedMemberCard.studentInfo.fieldOfStudy}
                      </span>
                    </div>
                  )}
                {selectedMemberCard.studentInfo.opportunityInterests && (
                  <div className="pt-1 border-t border-white/10 text-[10px] text-indigo-200">
                    <span className="text-gray-400">Intérêts : </span>
                    {selectedMemberCard.studentInfo.opportunityInterests.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Informations Professionnelles si association Éducative ou Professionnelle */}
            {isProfessionalOrEducational && selectedMemberCard.professionalInfo && (
              <div className="mt-4 rounded-2xl bg-amber-950/40 border border-amber-400/30 p-3 text-[11px] space-y-1.5 text-amber-100">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-1">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5" />
                    <span>Profil Professionnel</span>
                  </span>
                  {selectedMemberCard.professionalInfo.isAvailableForMentoring && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold border border-emerald-500/30">
                      <GraduationCap className="size-3 text-emerald-300" />
                      <span>Mentor Disponible</span>
                    </span>
                  )}
                </div>
                {selectedMemberCard.professionalInfo.currentJobTitle && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Poste / Métier :</span>
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {selectedMemberCard.professionalInfo.currentJobTitle}
                    </span>
                  </div>
                )}
                {(selectedMemberCard.professionalInfo.company ||
                  selectedMemberCard.professionalInfo.companyOrOrganization) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Structure / Entreprise :</span>
                      <span className="font-semibold text-amber-200 truncate max-w-[200px]">
                        {selectedMemberCard.professionalInfo.company ||
                          selectedMemberCard.professionalInfo.companyOrOrganization}
                      </span>
                    </div>
                  )}
                {selectedMemberCard.professionalInfo.industrySector && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Secteur :</span>
                    <span className="text-gray-200">
                      {selectedMemberCard.professionalInfo.industrySector}
                    </span>
                  </div>
                )}
                {selectedMemberCard.professionalInfo.yearsOfExperience !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Expérience :</span>
                    <span className="text-gray-200">
                      {selectedMemberCard.professionalInfo.yearsOfExperience} an(s)
                    </span>
                  </div>
                )}
                {selectedMemberCard.professionalInfo.highestDegree && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Diplôme :</span>
                    <span className="text-gray-200">
                      {selectedMemberCard.professionalInfo.highestDegree}
                    </span>
                  </div>
                )}
                {selectedMemberCard.professionalInfo.skills &&
                  selectedMemberCard.professionalInfo.skills.length > 0 && (
                    <div className="pt-1 border-t border-white/10">
                      <span className="text-gray-400 block mb-1">Compétences clés :</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedMemberCard.professionalInfo.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-amber-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {(selectedMemberCard.professionalInfo.linkedInUrl ||
                  selectedMemberCard.professionalInfo.linkedinUrl) && (
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">Profil LinkedIn :</span>
                      <a
                        href={
                          selectedMemberCard.professionalInfo.linkedInUrl ||
                          selectedMemberCard.professionalInfo.linkedinUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-300 underline font-medium hover:text-white"
                      >
                        Consulter le lien
                      </a>
                    </div>
                  )}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-white/5 p-3 text-[11px] border border-white/10 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Date d'adhésion :</span>
                <span>{new Date(selectedMemberCard.joinedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut Cotisation :</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <Check className="size-3" />
                  <span>En règle</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plateforme :</span>
                <span>My Community Bénin</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {isProfessionalOrEducational && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedMemberCard;
                    setSelectedMemberCard(null);
                    openProfessionalModal(target);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                >
                  <Briefcase className="size-3.5" />
                  <span>Éditer Profil Pro</span>
                </button>
              )}

              {isEducational && selectedMemberCard.isStudent && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemberCard(null);
                    setIsOpportunityModalOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <Send className="size-3.5" />
                  <span>Relancer Opportunité</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedMemberCard(null)}
                className="flex-1 rounded-xl bg-white/10 py-2 text-xs font-semibold hover:bg-white/20 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saisie des Informations Professionnelles (Strictement pour Professionnelles ou Éducatives) */}
      {isProfessionalOrEducational && editingProfessionalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Informations Professionnelles
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Membre : <strong>{editingProfessionalMember.userName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfessionalMember(null)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfessionalInfo} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Poste / Métier / Titre Actuel *
                  </label>
                  <input
                    type="text"
                    required
                    value={profJobTitle}
                    onChange={(e) => setProfJobTitle(e.target.value)}
                    placeholder="Ex: Ingénieur Logiciel Senior"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Entreprise / Organisation
                  </label>
                  <input
                    type="text"
                    value={profCompany}
                    onChange={(e) => setProfCompany(e.target.value)}
                    placeholder="Ex: MTN Bénin, Cabinet Conseil..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Secteur d'Activité
                  </label>
                  <input
                    type="text"
                    value={profSector}
                    onChange={(e) => setProfSector(e.target.value)}
                    placeholder="Ex: Numérique, Santé, BTP, Finance..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Années d'Expérience Professionnelle
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={profExperience}
                    onChange={(e) => setProfExperience(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Plus Haut Diplôme / Titre
                  </label>
                  <input
                    type="text"
                    value={profDegree}
                    onChange={(e) => setProfDegree(e.target.value)}
                    placeholder="Ex: Master 2, Doctorat, Ingénieur..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Profil LinkedIn (URL)
                  </label>
                  <input
                    type="url"
                    value={profLinkedIn}
                    onChange={(e) => setProfLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Compétences Clés (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={profSkills}
                  onChange={(e) => setProfSkills(e.target.value)}
                  placeholder="Ex: React, TypeScript, Audit comptable, Droit social..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Site Web / Portfolio Professionnel (Optionnel)
                </label>
                <input
                  type="url"
                  value={profPortfolio}
                  onChange={(e) => setProfPortfolio(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Courte Biographie Professionnelle
                </label>
                <textarea
                  rows={2}
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  placeholder="Présentation synthétique du parcours et des domaines d'expertise..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profMentoring}
                    onChange={(e) => setProfMentoring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Disponible pour le mentorat
                    </span>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                      J'accepte d'être contacté(e) pour conseiller et accompagner les jeunes adhérents
                      de l'association dans leur insertion.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingProfessionalMember(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProf || !profJobTitle.trim()}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {isSavingProf ? 'Enregistrement...' : 'Enregistrer le Profil Pro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Diffusion & Relance d'Opportunités Étudiantes */}
      {isOpportunityModalOpen && (
        <StudentOpportunityRelanceModal
          isOpen={isOpportunityModalOpen}
          onClose={() => setIsOpportunityModalOpen(false)}
          members={members}
          onSubmit={async (input) => {
            const res = await dispatchOpportunityRelance(input);
            showToast(
              `Opportunité « ${input.title} » diffusée avec succès auprès de ${res.notifiedCount} apprenants ciblés !`,
            );
          }}
        />
      )}
    </div>
  );
}
