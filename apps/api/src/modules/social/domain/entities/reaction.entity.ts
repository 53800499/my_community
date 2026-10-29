export type ReactionTargetType = 'POST' | 'COMMENT';

export type ReactionValueType =
  | 'LIKE'
  | 'LOVE'
  | 'CELEBRATE'
  | 'SUPPORT'
  | 'INSIGHTFUL';

export interface ReactionProps {
  id: string;
  userId: string;
  targetType: ReactionTargetType;
  targetId: string;
  type: ReactionValueType;
  createdAt: Date;
}

export class ReactionEntity {
  private constructor(private readonly props: ReactionProps) {}

  public static create(
    params: Omit<ReactionProps, 'createdAt'> & { createdAt?: Date },
  ): ReactionEntity {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("L'identifiant de la réaction est obligatoire.");
    }
    if (!params.userId || params.userId.trim().length === 0) {
      throw new Error("L'utilisateur est obligatoire pour enregistrer une réaction.");
    }
    if (!params.targetType || !['POST', 'COMMENT'].includes(params.targetType)) {
      throw new Error("Le type de cible doit être 'POST' ou 'COMMENT'.");
    }
    if (!params.targetId || params.targetId.trim().length === 0) {
      throw new Error("L'identifiant de la cible est obligatoire.");
    }
    const validReactions: ReactionValueType[] = [
      'LIKE',
      'LOVE',
      'CELEBRATE',
      'SUPPORT',
      'INSIGHTFUL',
    ];
    if (!params.type || !validReactions.includes(params.type)) {
      throw new Error(`Type de réaction non valide: ${params.type}`);
    }

    return new ReactionEntity({
      id: params.id,
      userId: params.userId,
      targetType: params.targetType,
      targetId: params.targetId,
      type: params.type,
      createdAt: params.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get targetType(): ReactionTargetType {
    return this.props.targetType;
  }

  public get targetId(): string {
    return this.props.targetId;
  }

  public get type(): ReactionValueType {
    return this.props.type;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public changeType(newType: ReactionValueType): void {
    const validReactions: ReactionValueType[] = [
      'LIKE',
      'LOVE',
      'CELEBRATE',
      'SUPPORT',
      'INSIGHTFUL',
    ];
    if (!newType || !validReactions.includes(newType)) {
      throw new Error(`Type de réaction non valide: ${newType}`);
    }
    this.props.type = newType;
  }
}
