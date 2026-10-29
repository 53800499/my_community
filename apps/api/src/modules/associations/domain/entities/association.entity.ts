export type AssociationCategory =
  | 'COMMUNITY'
  | 'EDUCATIONAL'
  | 'PROFESSIONAL'
  | 'CULTURAL'
  | 'SPORT'
  | 'HUMANITARIAN';

export interface AssociationProps {
  id: string;
  name: string;
  acronym?: string | null;
  registrationNumber?: string | null;
  description?: string | null;
  category?: AssociationCategory;
  createdAt?: Date;
}

/**
 * Entité Métier Pure : Association Citoyenne
 * Encapsule l'identité d'un regroupement citoyen ou associatif déclaré.
 * Respect strict de l'architecture hexagonale : 0 dépendance framework.
 */
export class AssociationEntity {
  private readonly _id: string;
  private _name: string;
  private _acronym: string | null;
  private _registrationNumber: string | null;
  private _description: string | null;
  private _category: AssociationCategory;
  private readonly _createdAt: Date;

  private constructor(props: {
    id: string;
    name: string;
    acronym: string | null;
    registrationNumber: string | null;
    description: string | null;
    category: AssociationCategory;
    createdAt: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._acronym = props.acronym;
    this._registrationNumber = props.registrationNumber;
    this._description = props.description;
    this._category = props.category;
    this._createdAt = props.createdAt;
  }

  public static create(props: AssociationProps): AssociationEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }

    const trimmedName = props.name?.trim();
    if (!trimmedName || trimmedName.length < 3) {
      throw new Error("Le nom de l'association doit comporter au moins 3 caractères.");
    }
    if (trimmedName.length > 200) {
      throw new Error("Le nom de l'association ne peut pas dépasser 200 caractères.");
    }

    return new AssociationEntity({
      id: props.id,
      name: trimmedName,
      acronym: props.acronym?.trim() ?? null,
      registrationNumber: props.registrationNumber?.trim() ?? null,
      description: props.description?.trim() ?? null,
      category: props.category ?? 'COMMUNITY',
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public updateDetails(props: {
    name?: string;
    acronym?: string | null;
    description?: string | null;
  }): void {
    if (props.name !== undefined) {
      const trimmed = props.name.trim();
      if (trimmed.length < 3) {
        throw new Error("Le nom de l'association doit comporter au moins 3 caractères.");
      }
      this._name = trimmed;
    }
    if (props.acronym !== undefined) {
      this._acronym = props.acronym?.trim() ?? null;
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() ?? null;
    }
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get acronym(): string | null {
    return this._acronym;
  }

  public get registrationNumber(): string | null {
    return this._registrationNumber;
  }

  public get description(): string | null {
    return this._description;
  }

  public get category(): AssociationCategory {
    return this._category;
  }

  public isProfessionalOrEducational(): boolean {
    return this._category === 'PROFESSIONAL' || this._category === 'EDUCATIONAL';
  }

  public updateCategory(cat: AssociationCategory): void {
    this._category = cat;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}
