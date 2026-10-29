import { TerritoryType } from '@prisma/client';

export interface TerritoryProps {
  id: string;
  name: string;
  code: string;
  type: TerritoryType;
  parentId?: string | null;
  createdAt: Date;
}

/**
 * Entité Métier Pure : Territory (Domaine Hexagonal Pur)
 * Conforme SRP : Référentiel géographique hiérarchique sans cycle.
 * 0 dépendance vers des frameworks d'infrastructure.
 */
export class TerritoryEntity {
  private constructor(private readonly props: TerritoryProps) {}

  public static create(props: TerritoryProps): TerritoryEntity {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Le nom du territoire doit comporter au moins 2 caractères.');
    }
    if (!props.code || !/^[A-Z0-9_-]+$/.test(props.code)) {
      throw new Error('Le code territorial doit être composé de majuscules, chiffres ou tirets (ex: BEN-LIT-COT).');
    }
    if (!props.type) {
      throw new Error('Le type de territoire est obligatoire.');
    }

    return new TerritoryEntity({
      ...props,
      code: props.code.toUpperCase(),
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get code(): string {
    return this.props.code;
  }

  public get type(): TerritoryType {
    return this.props.type;
  }

  public get parentId(): string | null | undefined {
    return this.props.parentId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public isRoot(): boolean {
    return !this.props.parentId;
  }

  public toJSON(): TerritoryProps {
    return { ...this.props };
  }
}
