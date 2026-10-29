/**
 * Entité Métier Pure : Community (Domaine Hexagonal Pur)
 * Conforme SRP : Encapsule uniquement l'état et les invariants métier d'une communauté.
 * 0 dépendance vers Prisma, NestJS ou des frameworks externes.
 */

export interface CommunityProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  territoryId: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export class CommunityEntity {
  private constructor(private readonly props: CommunityProps) {}

  public static create(props: CommunityProps): CommunityEntity {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Le nom de la communauté doit comporter au moins 2 caractères.');
    }
    if (!props.slug || !/^[a-z0-9-]+$/.test(props.slug)) {
      throw new Error('Le slug de la communauté est invalide.');
    }
    return new CommunityEntity({ ...props });
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get slug(): string {
    return this.props.slug;
  }

  public get description(): string | null | undefined {
    return this.props.description;
  }

  public get territoryId(): string {
    return this.props.territoryId;
  }

  public get status(): 'PENDING' | 'ACTIVE' | 'SUSPENDED' {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public activate(): CommunityEntity {
    if (this.props.status === 'ACTIVE') {
      throw new Error('La communauté est déjà active.');
    }
    return new CommunityEntity({
      ...this.props,
      status: 'ACTIVE',
      updatedAt: new Date(),
    });
  }

  public toJSON(): CommunityProps {
    return { ...this.props };
  }
}
