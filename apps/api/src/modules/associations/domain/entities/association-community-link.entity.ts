export interface AssociationCommunityLinkProps {
  id: string;
  associationId: string;
  communityId: string;
  linkedAt?: Date;
}

/**
 * Entité Métier Pure : Rattachement Association <-> Communauté (N-N)
 * Permet à une association d'être multi-rattachée à plusieurs espaces citoyens.
 */
export class AssociationCommunityLinkEntity {
  private readonly _id: string;
  private readonly _associationId: string;
  private readonly _communityId: string;
  private readonly _linkedAt: Date;

  private constructor(props: {
    id: string;
    associationId: string;
    communityId: string;
    linkedAt: Date;
  }) {
    this._id = props.id;
    this._associationId = props.associationId;
    this._communityId = props.communityId;
    this._linkedAt = props.linkedAt;
  }

  public static create(
    props: AssociationCommunityLinkProps,
  ): AssociationCommunityLinkEntity {
    if (!props.id || !props.associationId || !props.communityId) {
      throw new Error("L'identifiant, l'associationId et le communityId sont obligatoires.");
    }

    return new AssociationCommunityLinkEntity({
      id: props.id,
      associationId: props.associationId,
      communityId: props.communityId,
      linkedAt: props.linkedAt ?? new Date(),
    });
  }

  public get id(): string {
    return this._id;
  }

  public get associationId(): string {
    return this._associationId;
  }

  public get communityId(): string {
    return this._communityId;
  }

  public get linkedAt(): Date {
    return this._linkedAt;
  }
}
