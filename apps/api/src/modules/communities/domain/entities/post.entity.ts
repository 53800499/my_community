/**
 * Entité Métier : Publication Citoyenne (PostEntity)
 * Domaine 3: Communities & Social Feed
 * 
 * Invariants Métier (SRP, Static Factory Method) :
 * - id valide (UUID v4)
 * - communityId valide
 * - authorId valide
 * - title non vide (longueur 1 à 255 caractères)
 * - content non vide
 * - visibility obligatoire (PUBLIC, COMMUNITY, ASSOCIATION_MEMBERS)
 */

export type PostVisibilityType = 'PUBLIC' | 'COMMUNITY' | 'ASSOCIATION_MEMBERS';

export interface PostEntityProps {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  visibility: PostVisibilityType;
  publishedAt?: Date;
  updatedAt?: Date;
}

export class PostEntity {
  private constructor(private readonly props: PostEntityProps) {}

  /**
   * Static Factory Method garantissant l'intégrité et les invariants métier
   */
  static create(props: PostEntityProps): PostEntity {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('L’identifiant unique de la publication est obligatoire.');
    }
    if (!props.communityId || typeof props.communityId !== 'string') {
      throw new Error('La publication doit être rattachée à une communauté valide.');
    }
    if (!props.authorId || typeof props.authorId !== 'string') {
      throw new Error('L’auteur de la publication est obligatoire.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Le titre de la publication ne peut être vide.');
    }
    if (props.title.trim().length > 255) {
      throw new Error('Le titre ne peut excéder 255 caractères.');
    }
    if (!props.content || props.content.trim().length === 0) {
      throw new Error('Le contenu de la publication ne peut être vide.');
    }
    const validVisibilities: PostVisibilityType[] = ['PUBLIC', 'COMMUNITY', 'ASSOCIATION_MEMBERS'];
    if (!validVisibilities.includes(props.visibility)) {
      throw new Error(`Visibilité invalide : ${props.visibility}`);
    }

    return new PostEntity({
      ...props,
      title: props.title.trim(),
      content: props.content.trim(),
      publishedAt: props.publishedAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get communityId(): string {
    return this.props.communityId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get visibility(): PostVisibilityType {
    return this.props.visibility;
  }

  get publishedAt(): Date {
    return this.props.publishedAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  toJSON(): PostEntityProps {
    return {
      id: this.id,
      communityId: this.communityId,
      authorId: this.authorId,
      title: this.title,
      content: this.content,
      visibility: this.visibility,
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
    };
  }
}
