export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CommunityProposalProps {
  id: string;
  name: string;
  description: string;
  justification: string;
  territoryId: string;
  proposedById: string;
  status?: ProposalStatus;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt?: Date;
}

/**
 * Entité Métier Pure : Proposition de Communauté Citoyenne
 * Encapsule le cycle de vie d'une initiative citoyenne locale.
 * Respect strict de l'architecture hexagonale : 0 dépendance framework.
 */
export class CommunityProposalEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _justification: string;
  private readonly _territoryId: string;
  private readonly _proposedById: string;
  private _status: ProposalStatus;
  private _reviewedById: string | null;
  private _reviewedAt: Date | null;
  private _rejectionReason: string | null;
  private readonly _createdAt: Date;

  private constructor(props: {
    id: string;
    name: string;
    description: string;
    justification: string;
    territoryId: string;
    proposedById: string;
    status: ProposalStatus;
    reviewedById: string | null;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._justification = props.justification;
    this._territoryId = props.territoryId;
    this._proposedById = props.proposedById;
    this._status = props.status;
    this._reviewedById = props.reviewedById;
    this._reviewedAt = props.reviewedAt;
    this._rejectionReason = props.rejectionReason;
    this._createdAt = props.createdAt;
  }

  public static create(props: CommunityProposalProps): CommunityProposalEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant de la proposition est obligatoire.");
    }

    const trimmedName = props.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Le nom de la communauté proposée doit comporter au moins 2 caractères.');
    }
    if (trimmedName.length > 150) {
      throw new Error('Le nom ne peut pas dépasser 150 caractères.');
    }

    const trimmedDesc = props.description?.trim();
    if (!trimmedDesc || trimmedDesc.length < 10) {
      throw new Error('La description de la proposition doit comporter au moins 10 caractères.');
    }

    const trimmedJustif = props.justification?.trim();
    if (!trimmedJustif || trimmedJustif.length < 10) {
      throw new Error('La justification citoyenne doit comporter au moins 10 caractères.');
    }

    if (!props.territoryId || props.territoryId.trim().length === 0) {
      throw new Error('Le territoire rattaché est obligatoire.');
    }

    if (!props.proposedById || props.proposedById.trim().length === 0) {
      throw new Error("L'identifiant du proposant est obligatoire.");
    }

    return new CommunityProposalEntity({
      id: props.id,
      name: trimmedName,
      description: trimmedDesc,
      justification: trimmedJustif,
      territoryId: props.territoryId,
      proposedById: props.proposedById,
      status: props.status ?? 'PENDING',
      reviewedById: props.reviewedById ?? null,
      reviewedAt: props.reviewedAt ?? null,
      rejectionReason: props.rejectionReason ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public approve(reviewedById: string, reviewedAt: Date = new Date()): void {
    if (this._status !== 'PENDING') {
      throw new Error(`Impossible d'approuver une proposition déjà traitée (${this._status}).`);
    }
    if (!reviewedById || reviewedById.trim().length === 0) {
      throw new Error("L'identifiant du réviseur administratif est obligatoire.");
    }
    this._status = 'APPROVED';
    this._reviewedById = reviewedById;
    this._reviewedAt = reviewedAt;
  }

  public reject(
    reviewedById: string,
    rejectionReason: string,
    reviewedAt: Date = new Date(),
  ): void {
    if (this._status !== 'PENDING') {
      throw new Error(`Impossible de rejeter une proposition déjà traitée (${this._status}).`);
    }
    if (!reviewedById || reviewedById.trim().length === 0) {
      throw new Error("L'identifiant du réviseur administratif est obligatoire.");
    }
    const trimmedReason = rejectionReason?.trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      throw new Error('Le motif de rejet doit comporter au moins 5 caractères.');
    }
    this._status = 'REJECTED';
    this._reviewedById = reviewedById;
    this._rejectionReason = trimmedReason;
    this._reviewedAt = reviewedAt;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get justification(): string {
    return this._justification;
  }

  public get territoryId(): string {
    return this._territoryId;
  }

  public get proposedById(): string {
    return this._proposedById;
  }

  public get status(): ProposalStatus {
    return this._status;
  }

  public get reviewedById(): string | null {
    return this._reviewedById;
  }

  public get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}
