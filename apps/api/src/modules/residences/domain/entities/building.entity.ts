export interface BuildingProps {
  id?: string;
  quarterId: string;
  name: string;
  address: string;
  landlordName: string;
  landlordPhone?: string | null;
  landlordIbanOrMomo?: string | null;
  floorsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BuildingEntity {
  private constructor(
    private readonly _id: string,
    private readonly _quarterId: string,
    private _name: string,
    private _address: string,
    private _landlordName: string,
    private _landlordPhone: string | null,
    private _landlordIbanOrMomo: string | null,
    private _floorsCount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(props: BuildingProps): BuildingEntity {
    if (!props.quarterId || props.quarterId.trim() === '') {
      throw new Error("L'identifiant du quartier est obligatoire.");
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Le nom du bâtiment doit comporter au moins 2 caractères.');
    }
    if (!props.address || props.address.trim() === '') {
      throw new Error("L'adresse du bâtiment est obligatoire.");
    }
    if (!props.landlordName || props.landlordName.trim() === '') {
      throw new Error('Le nom du propriétaire / bailleur est obligatoire.');
    }

    const floors = props.floorsCount ?? 0;
    if (floors < 0) {
      throw new Error('Le nombre d’étages ne peut pas être négatif.');
    }

    const now = new Date();
    return new BuildingEntity(
      props.id ?? crypto.randomUUID(),
      props.quarterId,
      props.name.trim(),
      props.address.trim(),
      props.landlordName.trim(),
      props.landlordPhone?.trim() ?? null,
      props.landlordIbanOrMomo?.trim() ?? null,
      floors,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  public get id(): string {
    return this._id;
  }

  public get quarterId(): string {
    return this._quarterId;
  }

  public get name(): string {
    return this._name;
  }

  public get address(): string {
    return this._address;
  }

  public get landlordName(): string {
    return this._landlordName;
  }

  public get landlordPhone(): string | null {
    return this._landlordPhone;
  }

  public get landlordIbanOrMomo(): string | null {
    return this._landlordIbanOrMomo;
  }

  public get floorsCount(): number {
    return this._floorsCount;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateDetails(props: {
    name?: string;
    address?: string;
    landlordName?: string;
    landlordPhone?: string | null;
    landlordIbanOrMomo?: string | null;
    floorsCount?: number;
  }): void {
    if (props.name !== undefined) {
      if (props.name.trim().length < 2) {
        throw new Error('Le nom du bâtiment doit comporter au moins 2 caractères.');
      }
      this._name = props.name.trim();
    }
    if (props.address !== undefined) {
      if (props.address.trim() === '') {
        throw new Error("L'adresse du bâtiment est obligatoire.");
      }
      this._address = props.address.trim();
    }
    if (props.landlordName !== undefined) {
      if (props.landlordName.trim() === '') {
        throw new Error('Le nom du propriétaire / bailleur est obligatoire.');
      }
      this._landlordName = props.landlordName.trim();
    }
    if (props.landlordPhone !== undefined) {
      this._landlordPhone = props.landlordPhone?.trim() ?? null;
    }
    if (props.landlordIbanOrMomo !== undefined) {
      this._landlordIbanOrMomo = props.landlordIbanOrMomo?.trim() ?? null;
    }
    if (props.floorsCount !== undefined) {
      if (props.floorsCount < 0) {
        throw new Error('Le nombre d’étages ne peut pas être négatif.');
      }
      this._floorsCount = props.floorsCount;
    }
    this._updatedAt = new Date();
  }
}

