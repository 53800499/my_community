import { AssociationRole } from './association-member.entity.js';

export type PositionStatus = 'VACANT' | 'OCCUPIED';

export type AssociationAccessSpace =
  | 'RESIDENCES'
  | 'FINANCE'
  | 'COMMUNICATION'
  | 'MEMBERSHIP'
  | 'GOVERNANCE'
  | 'TERRITORIES';

export interface AssociationPositionProps {
  id: string;
  associationId: string;
  title: string;
  roleCategory?: AssociationRole;
  department?: string;
  description?: string;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  termStartDate?: Date | null;
  termEndDate?: Date | null;
  isStatutory?: boolean;
  status?: PositionStatus;
  accessSpaces?: string[];
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Poste de Gouvernance & Droits d'Accès d'une Association (AssociationPositionEntity)
 * Permet la création libre et la structuration personnalisée de l'organigramme associatif :
 * Président, Vice-Président, Secrétaire Général, Chargé aux Résidences & Logements, etc.
 * Conforme SOLID : Encapsulation totale des invariants, permissions fines et gestion des espaces d'accès.
 */
export class AssociationPositionEntity {
  private readonly _id: string;
  private readonly _associationId: string;
  private _title: string;
  private _roleCategory: AssociationRole;
  private _department: string;
  private _description: string;
  private _assignedUserId: string | null;
  private _assignedUserName: string | null;
  private _termStartDate: Date | null;
  private _termEndDate: Date | null;
  private readonly _isStatutory: boolean;
  private _status: PositionStatus;
  private _accessSpaces: string[];
  private _permissions: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    associationId: string;
    title: string;
    roleCategory: AssociationRole;
    department: string;
    description: string;
    assignedUserId: string | null;
    assignedUserName: string | null;
    termStartDate: Date | null;
    termEndDate: Date | null;
    isStatutory: boolean;
    status: PositionStatus;
    accessSpaces: string[];
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._associationId = props.associationId;
    this._title = props.title;
    this._roleCategory = props.roleCategory;
    this._department = props.department;
    this._description = props.description;
    this._assignedUserId = props.assignedUserId;
    this._assignedUserName = props.assignedUserName;
    this._termStartDate = props.termStartDate;
    this._termEndDate = props.termEndDate;
    this._isStatutory = props.isStatutory;
    this._status = props.status;
    this._accessSpaces = props.accessSpaces;
    this._permissions = props.permissions;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static defaultSpacesAndPermissions(
    role: AssociationRole,
    department: string,
  ): { accessSpaces: string[]; permissions: string[] } {
    if (role === 'PRESIDENT') {
      return {
        accessSpaces: ['RESIDENCES', 'FINANCE', 'COMMUNICATION', 'MEMBERSHIP', 'GOVERNANCE', 'TERRITORIES'],
        permissions: [
          'residences:read', 'residences:manage_rooms', 'residences:issue_certificate',
          'finance:read', 'finance:collect_dues', 'finance:manage_expenses',
          'communication:read', 'communication:publish_posts', 'communication:pin_posts',
          'membership:read', 'membership:register', 'membership:issue_card',
          'governance:manage_positions', 'governance:assign_roles',
          'territories:manage_links',
        ],
      };
    }

    if (role === 'SECRETARY') {
      return {
        accessSpaces: ['COMMUNICATION', 'MEMBERSHIP', 'TERRITORIES', 'RESIDENCES'],
        permissions: [
          'communication:read', 'communication:publish_posts', 'communication:pin_posts',
          'membership:read', 'membership:register', 'membership:issue_card',
          'residences:read', 'territories:manage_links',
        ],
      };
    }

    if (role === 'TREASURER') {
      return {
        accessSpaces: ['FINANCE', 'MEMBERSHIP'],
        permissions: [
          'finance:read', 'finance:collect_dues', 'finance:manage_expenses',
          'membership:read',
        ],
      };
    }

    const deptLower = department.toLowerCase();
    if (deptLower.includes('logement') || deptLower.includes('résidence') || deptLower.includes('patrimoine')) {
      return {
        accessSpaces: ['RESIDENCES', 'MEMBERSHIP'],
        permissions: [
          'residences:read', 'residences:manage_rooms', 'residences:issue_certificate',
          'membership:read',
        ],
      };
    }

    if (deptLower.includes('finance') || deptLower.includes('budget') || deptLower.includes('recouvrement')) {
      return {
        accessSpaces: ['FINANCE'],
        permissions: ['finance:read', 'finance:collect_dues'],
      };
    }

    if (deptLower.includes('communication') || deptLower.includes('mobilisation')) {
      return {
        accessSpaces: ['COMMUNICATION'],
        permissions: ['communication:read', 'communication:publish_posts'],
      };
    }

    // Par défaut pour un membre du bureau
    return {
      accessSpaces: ['COMMUNICATION', 'MEMBERSHIP'],
      permissions: ['communication:read', 'membership:read'],
    };
  }

  public static create(props: AssociationPositionProps): AssociationPositionEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant du poste est obligatoire.");
    }
    if (!props.associationId || props.associationId.trim().length === 0) {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }
    if (!props.title || props.title.trim().length < 2) {
      throw new Error('Le titre du poste doit comporter au moins 2 caractères.');
    }

    const roleCategory: AssociationRole = props.roleCategory ?? 'BOARD_MEMBER';
    const department = props.department?.trim() || 'Bureau Exécutif';
    const description = props.description?.trim() || '';
    const assignedUserId = props.assignedUserId ?? null;
    const assignedUserName = props.assignedUserName ?? null;
    const status: PositionStatus = assignedUserId ? 'OCCUPIED' : (props.status ?? 'VACANT');

    const defaults = AssociationPositionEntity.defaultSpacesAndPermissions(roleCategory, department);
    const accessSpaces = props.accessSpaces && props.accessSpaces.length > 0 ? props.accessSpaces : defaults.accessSpaces;
    const permissions = props.permissions && props.permissions.length > 0 ? props.permissions : defaults.permissions;

    return new AssociationPositionEntity({
      id: props.id,
      associationId: props.associationId,
      title: props.title.trim(),
      roleCategory,
      department,
      description,
      assignedUserId,
      assignedUserName,
      termStartDate: props.termStartDate ?? (assignedUserId ? new Date() : null),
      termEndDate: props.termEndDate ?? null,
      isStatutory: props.isStatutory ?? false,
      status,
      accessSpaces,
      permissions,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  /**
   * Nomme ou affecte un adhérent à ce poste de gouvernance.
   */
  public assignMember(params: {
    userId: string;
    userName: string;
    termStartDate?: Date;
    termEndDate?: Date;
    at?: Date;
  }): void {
    if (!params.userId || params.userId.trim().length === 0) {
      throw new Error("L'identifiant du membre à nommer est obligatoire.");
    }
    const at = params.at ?? new Date();
    this._assignedUserId = params.userId.trim();
    this._assignedUserName = params.userName.trim();
    this._termStartDate = params.termStartDate ?? at;
    this._termEndDate = params.termEndDate ?? null;
    this._status = 'OCCUPIED';
    this._updatedAt = at;
  }

  /**
   * Libère le poste (fin de mandat, démission ou vacance avant élection).
   */
  public vacate(at: Date = new Date()): void {
    if (this._isStatutory && this._roleCategory === 'PRESIDENT') {
      throw new Error('Le poste statutaire de Président ne peut pas être rendu vacant directement.');
    }
    this._assignedUserId = null;
    this._assignedUserName = null;
    this._termStartDate = null;
    this._termEndDate = null;
    this._status = 'VACANT';
    this._updatedAt = at;
  }

  /**
   * Met à jour les attributions ou le département du poste.
   */
  public updateDetails(params: {
    title?: string;
    department?: string;
    description?: string;
    roleCategory?: AssociationRole;
    at?: Date;
  }): void {
    if (params.title) {
      if (params.title.trim().length < 2) {
        throw new Error('Le titre du poste doit comporter au moins 2 caractères.');
      }
      this._title = params.title.trim();
    }
    if (params.department) {
      this._department = params.department.trim();
    }
    if (params.description !== undefined) {
      this._description = params.description.trim();
    }
    if (params.roleCategory && !this._isStatutory) {
      this._roleCategory = params.roleCategory;
    }
    this._updatedAt = params.at ?? new Date();
  }

  /**
   * Met à jour les espaces d'accès autorisés et permissions granulaires accordés à ce poste.
   */
  public updatePermissions(params: {
    accessSpaces: string[];
    permissions: string[];
    at?: Date;
  }): void {
    if (this._isStatutory && this._roleCategory === 'PRESIDENT') {
      // Le Président conserve toujours les pleins pouvoirs institutionnels
      const allSpaces = ['RESIDENCES', 'FINANCE', 'COMMUNICATION', 'MEMBERSHIP', 'GOVERNANCE', 'TERRITORIES'];
      this._accessSpaces = Array.from(new Set([...params.accessSpaces, ...allSpaces]));
    } else {
      this._accessSpaces = [...params.accessSpaces];
    }
    this._permissions = [...params.permissions];
    this._updatedAt = params.at ?? new Date();
  }

  public hasAccessToSpace(space: string): boolean {
    return this._accessSpaces.includes(space);
  }

  public hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  public isOccupied(): boolean {
    return this._status === 'OCCUPIED' && this._assignedUserId !== null;
  }

  public isVacant(): boolean {
    return this._status === 'VACANT' || this._assignedUserId === null;
  }

  // Getters purs
  public get id(): string {
    return this._id;
  }
  public get associationId(): string {
    return this._associationId;
  }
  public get title(): string {
    return this._title;
  }
  public get roleCategory(): AssociationRole {
    return this._roleCategory;
  }
  public get department(): string {
    return this._department;
  }
  public get description(): string {
    return this._description;
  }
  public get assignedUserId(): string | null {
    return this._assignedUserId;
  }
  public get assignedUserName(): string | null {
    return this._assignedUserName;
  }
  public get termStartDate(): Date | null {
    return this._termStartDate;
  }
  public get termEndDate(): Date | null {
    return this._termEndDate;
  }
  public get isStatutory(): boolean {
    return this._isStatutory;
  }
  public get status(): PositionStatus {
    return this._status;
  }
  public get accessSpaces(): string[] {
    return [...this._accessSpaces];
  }
  public get permissions(): string[] {
    return [...this._permissions];
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
