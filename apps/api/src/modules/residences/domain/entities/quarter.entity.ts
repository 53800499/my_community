export interface QuarterProps {
  id?: string;
  associationId: string;
  name: string;
  city: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class QuarterEntity {
  private constructor(
    private readonly _id: string,
    private readonly _associationId: string,
    private _name: string,
    private _city: string,
    private _description: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: QuarterProps): QuarterEntity {
    if (!props.associationId || props.associationId.trim() === '') {
      throw new Error("L'identifiant de l'association est obligatoire pour un quartier.");
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Le nom du quartier doit comporter au moins 2 caractères.');
    }
    if (!props.city || props.city.trim() === '') {
      throw new Error('La ville du quartier est obligatoire.');
    }

    const now = new Date();
    return new QuarterEntity(
      props.id ?? crypto.randomUUID(),
      props.associationId,
      props.name.trim(),
      props.city.trim(),
      props.description?.trim() ?? null,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get name(): string {
    return this._name;
  }

  public get city(): string {
    return this._city;
  }

  public get description(): string | null {
    return this._description;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateDetails(props: { name?: string; city?: string; description?: string | null }): void {
    if (props.name !== undefined) {
      if (props.name.trim().length < 2) {
        throw new Error('Le nom du quartier doit comporter au moins 2 caractères.');
      }
      this._name = props.name.trim();
    }
    if (props.city !== undefined) {
      if (props.city.trim() === '') {
        throw new Error('La ville du quartier est obligatoire.');
      }
      this._city = props.city.trim();
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() ?? null;
    }
    this._updatedAt = new Date();
  }
}

