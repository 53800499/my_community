export type CommentStatusType = 'PUBLISHED' | 'HIDDEN' | 'REMOVED';

export interface CommentProps {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
  status: CommentStatusType;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentEntity {
  private constructor(private readonly props: CommentProps) {}

  public static create(
    params: Omit<CommentProps, 'createdAt' | 'updatedAt' | 'status'> & {
      status?: CommentStatusType;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ): CommentEntity {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("L'identifiant du commentaire est obligatoire.");
    }
    if (!params.postId || params.postId.trim().length === 0) {
      throw new Error("L'identifiant de la publication cible est obligatoire.");
    }
    if (!params.authorId || params.authorId.trim().length === 0) {
      throw new Error("L'auteur du commentaire est obligatoire.");
    }
    if (!params.content || params.content.trim().length === 0) {
      throw new Error('Le commentaire ne peut pas être vide.');
    }
    if (params.content.trim().length > 1000) {
      throw new Error('Le commentaire ne peut pas excéder 1 000 caractères.');
    }

    const now = new Date();
    return new CommentEntity({
      id: params.id,
      postId: params.postId,
      authorId: params.authorId,
      parentId: params.parentId || null,
      content: params.content.trim(),
      status: params.status || 'PUBLISHED',
      createdAt: params.createdAt || now,
      updatedAt: params.updatedAt || now,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get postId(): string {
    return this.props.postId;
  }

  public get authorId(): string {
    return this.props.authorId;
  }

  public get parentId(): string | null | undefined {
    return this.props.parentId;
  }

  public get content(): string {
    return this.props.content;
  }

  public get status(): CommentStatusType {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Le contenu mis à jour ne peut pas être vide.');
    }
    if (newContent.trim().length > 1000) {
      throw new Error('Le commentaire ne peut pas excéder 1 000 caractères.');
    }
    this.props.content = newContent.trim();
    this.props.updatedAt = new Date();
  }

  public markHidden(): void {
    this.props.status = 'HIDDEN';
    this.props.updatedAt = new Date();
  }

  public markRemoved(): void {
    this.props.status = 'REMOVED';
    this.props.updatedAt = new Date();
  }
}
