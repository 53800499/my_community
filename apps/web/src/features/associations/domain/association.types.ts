/**
 * Types & Modèles de Domaine : Module Associations & Postes de Gouvernance (SOLID - ISP)
 */

export type AssociationRoleType =
  | 'MEMBER'
  | 'PRESIDENT'
  | 'SECRETARY'
  | 'TREASURER'
  | 'BOARD_MEMBER';

export type AssociationCategory =
  | 'COMMUNITY' // Collectif de Quartier, Résidence, Développement Local, Amicale Citoyenne
  | 'EDUCATIONAL' // Association Éducative, Universitaire, Scolaire, Amicale d’Apprenants / Alumni
  | 'PROFESSIONAL' // Groupement Professionnel, Coopérative d’Artisans, Agriculteurs, PME
  | 'CULTURAL' // Culture, Arts & Patrimoine
  | 'SPORT' // Sport, Bien-être & Loisirs
  | 'HUMANITARIAN'; // Solidarité, Entraide & ONG

export type PositionStatus = 'VACANT' | 'OCCUPIED';

export type PostVisibilityType = 'PUBLIC' | 'COMMUNITY' | 'ASSOCIATION_MEMBERS';

export type PostCategoryType =
  | 'COMMUNIQUE'
  | 'ASSEMBLEE_GENERALE'
  | 'AVIS_RESIDENTS'
  | 'APPEL_COTISATION'
  | 'EVENEMENT'
  | 'OPPORTUNITE_ETUDIANTE'; // Bourses, Stages, Concours & Mentorat

export interface PermissionDef {
  id: string;
  name: string;
  description: string;
}

export type AccessSpaceIconName =
  | 'Home'
  | 'Coins'
  | 'Megaphone'
  | 'Contact'
  | 'Settings2';

export interface AccessSpaceDef {
  id: string;
  name: string;
  icon: AccessSpaceIconName;
  badgeColor: 'primary' | 'success' | 'warning' | 'error' | 'light';
  description: string;
  permissions: PermissionDef[];
}

export const ASSOCIATION_ACCESS_SPACES: AccessSpaceDef[] = [
  {
    id: 'RESIDENCES',
    name: 'Résidences & Gestion Locative',
    icon: 'Home',
    badgeColor: 'primary',
    description: 'Gestion des pavillons, chambres étudiantes, baux et délivrance d’attestations d’occupation.',
    permissions: [
      { id: 'residences:read', name: 'Consulter Résidences', description: 'Accès en lecture aux pavillons, chambres et baux' },
      { id: 'residences:manage_rooms', name: 'Gérer Chambres & Baux', description: 'Création, modification et attribution des chambres' },
      { id: 'residences:issue_certificate', name: 'Signer Attestations', description: 'Génération et signature des attestations de résidence officielles' },
    ],
  },
  {
    id: 'FINANCE',
    name: 'Trésorerie & Cotisations',
    icon: 'Coins',
    badgeColor: 'warning',
    description: 'Recouvrement des cotisations mensuelles en FCFA, livre de caisse et engagement des dépenses.',
    permissions: [
      { id: 'finance:read', name: 'Consulter Trésorerie', description: 'Accès aux soldes de comptes et bilans financiers' },
      { id: 'finance:collect_dues', name: 'Encaisser Cotisations', description: 'Enregistrement des règlements et délivrance des reçus' },
      { id: 'finance:manage_expenses', name: 'Ordonnancer Dépenses', description: 'Validation et décaissement des fonds associatifs' },
    ],
  },
  {
    id: 'COMMUNICATION',
    name: 'Communication & Publications',
    icon: 'Megaphone',
    badgeColor: 'primary',
    description: 'Diffusion des communiqués officiels, convocations aux Assemblées Générales et avis aux résidents.',
    permissions: [
      { id: 'communication:read', name: 'Consulter Communiqués', description: 'Accès aux communications et notes internes' },
      { id: 'communication:publish_posts', name: 'Diffuser Communiqués', description: 'Rédaction et publication d’avis officiels du bureau' },
      { id: 'communication:pin_posts', name: 'Épingler Annonces', description: 'Mise en avant prioritaire des notes urgentes' },
    ],
  },
  {
    id: 'MEMBERSHIP',
    name: 'Adhésions & Registre des Membres',
    icon: 'Contact',
    badgeColor: 'success',
    description: 'Tenue de l’annuaire des membres, délivrance des cartes d’adhérents et statuts civiques.',
    permissions: [
      { id: 'membership:read', name: 'Consulter Registre', description: 'Accès à l’annuaire et coordonnées des adhérents' },
      { id: 'membership:register', name: 'Inscrire Adhérents', description: 'Validation et inscription de nouveaux membres' },
      { id: 'membership:issue_card', name: 'Émettre Cartes Membres', description: 'Génération des cartes avec matricule officiel' },
    ],
  },
  {
    id: 'GOVERNANCE',
    name: 'Gouvernance & Organigramme',
    icon: 'Settings2',
    badgeColor: 'light',
    description: 'Modification des statuts, création des postes, attribution des permissions et passation de service.',
    permissions: [
      { id: 'governance:manage_positions', name: 'Gérer Postes', description: 'Création et suppression de postes de direction' },
      { id: 'governance:assign_roles', name: 'Nommer & Configurer Droits', description: 'Nomination des membres et paramétrage des accès' },
    ],
  },
];

export interface AssociationPosition {
  id: string;
  associationId: string;
  title: string;
  roleCategory: AssociationRoleType;
  department: string;
  description: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedUserAvatar?: string | null;
  assignedUserPhone?: string | null;
  termStartDate: string | null;
  termEndDate: string | null;
  isStatutory: boolean;
  status: PositionStatus;
  accessSpaces: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentAcademicInfo {
  studentIdNumber?: string; // Matricule Étudiant / Élève officiel
  institutionName?: string; // Établissement : Université, Grande École, Lycée, Institut Pro...
  university?: string; // (alias rétrocompatible pour institutionName)
  faculty?: string; // Faculté, UFR, École ou Département
  fieldOfStudy?: string; // Filière, Spécialité ou Série
  studyLevel?: string; // Niveau d'études : Secondaire, L1, L2, L3, M1, M2, Doctorat, Pro
  academicYear?: string; // Année académique (ex: 2025-2026)
  opportunityInterests?: string[]; // Types d'opportunités : Stages, Bourses, Jobs, Mentorat, Concours
}

export interface MemberProfessionalInfo {
  currentJobTitle?: string; // Intitulé du poste / Profession / Spécialité
  companyOrOrganization?: string; // Entreprise / Établissement / Organisation
  company?: string; // Alias pour companyOrOrganization
  industrySector?: string; // Secteur d'activité (ex: Technologies, Santé, BTP, Droit, Finance...)
  yearsOfExperience?: number; // Années d'expérience professionnelle
  highestDegree?: string; // Diplôme le plus élevé / Qualification
  skills?: string[]; // Compétences clés
  linkedinUrl?: string; // Lien Profil LinkedIn
  linkedInUrl?: string; // Alias pour linkedinUrl
  portfolioUrl?: string; // Site web / Portfolio professionnel
  professionalBio?: string; // Résumé du parcours / Biographie professionnelle
  bio?: string; // Alias pour professionalBio
  isAvailableForMentoring?: boolean; // Prêt à mentorer les plus jeunes adhérents
  lookingForOpportunities?: boolean; // En veille d'opportunités (recrutement, missions)
}

export interface AssociationMember {
  id: string;
  associationId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  roles: AssociationRoleType[];
  positionTitle?: string;
  joinedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  duesStatus: 'UP_TO_DATE' | 'PENDING' | 'LATE';
  membershipCardNumber?: string;
  // Informations académiques si association étudiante / éducative
  isStudent?: boolean;
  studentInfo?: StudentAcademicInfo;
  // Informations professionnelles si association professionnelle ou éducative
  professionalInfo?: MemberProfessionalInfo;
}

export interface AssociationPost {
  id: string;
  associationId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: PostCategoryType;
  visibility: PostVisibilityType;
  publishedAt: string;
  pinned: boolean;
  attachmentsCount?: number;
}

export interface Association {
  id: string;
  name: string;
  acronym?: string;
  registrationNumber?: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  isVerified?: boolean; // Vrai si déclarée avec récépissé officiel
  creatorRole?: string; // Ex: 'ADMINISTRATEUR_TECHNIQUE'
  creatorUserId?: string;
  category?: AssociationCategory; // Catégorie : COMMUNITY (défaut), EDUCATIONAL, PROFESSIONAL, etc.
  educationalInstitution?: string; // Établissement rattaché si association scolaire/universitaire (optionnel)
  universityCampus?: string; // (alias rétrocompatible pour educationalInstitution)
  membersCount: number;
  monthlyDuesXOF: number;
  treasuryBalanceXOF: number;
  territory?: string;
  city?: string;
  departmentName?: string;
  linkedCommunityIds: string[];
  createdAt: string;
  positions?: AssociationPosition[];
  members?: AssociationMember[];
  posts?: AssociationPost[];
}

export interface CreatePositionInput {
  title: string;
  roleCategory?: AssociationRoleType;
  department?: string;
  description?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  termStartDate?: string;
  termEndDate?: string;
}

export interface AssignPositionInput {
  targetUserId: string;
  targetUserName: string;
  termStartDate?: string;
  termEndDate?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  category: PostCategoryType;
  visibility: PostVisibilityType;
  pinned?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  category?: PostCategoryType;
  visibility?: PostVisibilityType;
  pinned?: boolean;
}

export interface RegisterAssociationInput {
  name: string;
  acronym?: string;
  registrationNumber?: string;
  description?: string;
  city?: string;
  monthlyDuesXOF?: number;
  territory?: string;
  category?: AssociationCategory;
  educationalInstitution?: string;
  universityCampus?: string;
}

export interface AddMemberInput {
  userId?: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  role?: string;
  isStudent?: boolean;
  studentIdNumber?: string;
  institutionName?: string;
  university?: string;
  faculty?: string;
  fieldOfStudy?: string;
  studyLevel?: string;
  academicYear?: string;
  opportunityInterests?: string[];
  studentInfo?: StudentAcademicInfo;
  professionalInfo?: MemberProfessionalInfo;
}

export interface StudentOpportunityRelanceInput {
  opportunityType: 'INTERNSHIP' | 'SCHOLARSHIP' | 'JOB' | 'MENTORSHIP' | 'TRAINING';
  title: string;
  description: string;
  targetInstitution?: string; // Tous ou établissement ciblé (UAC, Parakou, UNSTIM, Pigier, Epitech, Lycée...)
  targetFaculty?: string;
  targetStudyLevel?: string; // 'ALL' | 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'DOC' | 'SECONDAIRE'
  channel: 'NOTIFICATION' | 'SMS_WHATSAPP' | 'EMAIL';
  deadline?: string;
}
