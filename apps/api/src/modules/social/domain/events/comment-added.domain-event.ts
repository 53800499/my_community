export class CommentAddedDomainEvent {
  public static readonly EVENT_NAME = 'social.comment.added';

  constructor(
    public readonly commentId: string,
    public readonly postId: string,
    public readonly authorId: string,
    public readonly parentId?: string | null,
    public readonly createdAt: Date = new Date(),
  ) {}
}
