export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type CommunityRole = 'MEMBER' | 'MODERATOR' | 'MANAGER' | 'ADMIN';

export interface CommunityMembershipProps {
  id: string;
  communityId: string;
  userId: string;
  status?: MembershipStatus;
  roles?: CommunityRole[];
  joinedAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Adhésion Communautaire (CommunityMembership)
 * Encapsule l'affiliation d'un citoyen à un espace territorial et ses rôles contextuels locaux.
 * 0 dépendance envers des frameworks externes.
 */
export class CommunityMembershipEntity {
  private readonly _id: string;
  private readonly _communityId: string;
  private readonly _userId: string;
  private _status: MembershipStatus;
  private _roles: Set<CommunityRole>;
  private readonly _joinedAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    communityId: string;
    userId: string;
    status: MembershipStatus;
    roles: CommunityRole[];
    joinedAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._communityId = props.communityId;
    this._userId = props.userId;
    this._status = props.status;
    this._roles = new Set(props.roles);
    this._joinedAt = props.joinedAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: CommunityMembershipProps): CommunityMembershipEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de l'adhésion est obligatoire.");
    }
    if (!props.communityId || props.communityId.trim().length === 0) {
      throw new Error("L'identifiant de la communauté est obligatoire.");
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("L'identifiant du citoyen adhérent est obligatoire.");
    }

    const initialRoles: CommunityRole[] =
      props.roles && props.roles.length > 0 ? [...props.roles] : ['MEMBER'];

    return new CommunityMembershipEntity({
      id: props.id,
      communityId: props.communityId,
      userId: props.userId,
      status: props.status ?? 'PENDING',
      roles: initialRoles,
      joinedAt: props.joinedAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  public approve(at: Date = new Date()): void {
    if (this._status === 'ACTIVE') {
      throw new Error("L'adhésion est déjà active.");
    }
    this._status = 'ACTIVE';
    this._updatedAt = at;
  }

  public suspend(at: Date = new Date()): void {
    if (this._status === 'SUSPENDED') {
      throw new Error("L'adhésion est déjà suspendue.");
    }
    this._status = 'SUSPENDED';
    this._updatedAt = at;
  }

  public revoke(at: Date = new Date()): void {
    if (this._status === 'REVOKED') {
      throw new Error("L'adhésion est déjà révoquée.");
    }
    this._status = 'REVOKED';
    this._updatedAt = at;
  }

  public assignRole(role: CommunityRole, at: Date = new Date()): void {
    this._roles.add(role);
    this._updatedAt = at;
  }

  public removeRole(role: CommunityRole, at: Date = new Date()): void {
    if (role === 'MEMBER') {
      throw new Error('Le rôle MEMBER ne peut pas être retiré d’une adhésion.');
    }
    this._roles.delete(role);
    this._updatedAt = at;
  }

  public hasRole(role: CommunityRole): boolean {
    return this._roles.has(role);
  }

  public isManagerOrAdmin(): boolean {
    return this._roles.has('MANAGER') || this._roles.has('ADMIN');
  }

  public get id(): string {
    return this._id;
  }

  public get communityId(): string {
    return this._communityId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get status(): MembershipStatus {
    return this._status;
  }

  public get roles(): CommunityRole[] {
    return Array.from(this._roles);
  }

  public get joinedAt(): Date {
    return this._joinedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
