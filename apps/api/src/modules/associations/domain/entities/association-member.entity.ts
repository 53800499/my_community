export type AssociationRole =
  | 'MEMBER'
  | 'PRESIDENT'
  | 'SECRETARY'
  | 'TREASURER'
  | 'BOARD_MEMBER';

export interface MemberProfessionalInfo {
  currentJobTitle?: string;
  companyOrOrganization?: string;
  industrySector?: string;
  yearsOfExperience?: number;
  highestDegree?: string;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  professionalBio?: string;
  isAvailableForMentoring?: boolean;
  lookingForOpportunities?: boolean;
}

export interface AssociationMemberProps {
  id: string;
  associationId: string;
  userId: string;
  role?: AssociationRole;
  professionalInfo?: MemberProfessionalInfo | null;
  joinedAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Membre / Bureau d'une Association
 * Encapsule la gouvernance associative (Président, Secrétaire, Trésorier, etc.).
 */
export class AssociationMemberEntity {
  private readonly _id: string;
  private readonly _associationId: string;
  private readonly _userId: string;
  private _role: AssociationRole;
  private _professionalInfo: MemberProfessionalInfo | null;
  private readonly _joinedAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    associationId: string;
    userId: string;
    role: AssociationRole;
    professionalInfo: MemberProfessionalInfo | null;
    joinedAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._associationId = props.associationId;
    this._userId = props.userId;
    this._role = props.role;
    this._professionalInfo = props.professionalInfo;
    this._joinedAt = props.joinedAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: AssociationMemberProps): AssociationMemberEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant du membre associatif est obligatoire.");
    }
    if (!props.associationId || props.associationId.trim().length === 0) {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("L'identifiant de l'utilisateur est obligatoire.");
    }

    const validRoles: AssociationRole[] = [
      'MEMBER',
      'PRESIDENT',
      'SECRETARY',
      'TREASURER',
      'BOARD_MEMBER',
    ];
    const role = props.role ?? 'MEMBER';
    if (!validRoles.includes(role)) {
      throw new Error(`Rôle associatif invalide: ${role}`);
    }

    return new AssociationMemberEntity({
      id: props.id,
      associationId: props.associationId,
      userId: props.userId,
      role,
      professionalInfo: props.professionalInfo ?? null,
      joinedAt: props.joinedAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  public updateRole(newRole: AssociationRole, at: Date = new Date()): void {
    this._role = newRole;
    this._updatedAt = at;
  }

  public updateProfessionalInfo(info: MemberProfessionalInfo, at: Date = new Date()): void {
    this._professionalInfo = { ...info };
    this._updatedAt = at;
  }

  public isExecutiveBureau(): boolean {
    return (
      this._role === 'PRESIDENT' ||
      this._role === 'SECRETARY' ||
      this._role === 'TREASURER'
    );
  }

  public isPresident(): boolean {
    return this._role === 'PRESIDENT';
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get role(): AssociationRole {
    return this._role;
  }

  public get professionalInfo(): MemberProfessionalInfo | null {
    return this._professionalInfo ? { ...this._professionalInfo } : null;
  }

  public get joinedAt(): Date {
    return this._joinedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
