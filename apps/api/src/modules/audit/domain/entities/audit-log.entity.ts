/**
 * Entité Métier Pure : AuditLog (Domaine Hexagonal Pur)
 * Conforme SRP : Représente une trace immuable d'action sensible dans le système.
 * 0 dépendance vers Prisma, NestJS ou des frameworks externes.
 */

export interface AuditLogProps {
  id: string;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  payload?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export class AuditLogEntity {
  private constructor(private readonly props: AuditLogProps) {}

  public static create(props: AuditLogProps): AuditLogEntity {
    if (!props.action || props.action.trim().length === 0) {
      throw new Error("L'action auditée ne peut pas être vide.");
    }
    if (!props.resourceType || props.resourceType.trim().length === 0) {
      throw new Error('Le type de ressource est obligatoire pour la traçabilité.');
    }
    if (!props.resourceId || props.resourceId.trim().length === 0) {
      throw new Error("L'identifiant de la ressource auditée est obligatoire.");
    }

    return new AuditLogEntity({
      ...props,
      action: props.action.toUpperCase(),
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string | null | undefined {
    return this.props.actorId;
  }

  public get action(): string {
    return this.props.action;
  }

  public get resourceType(): string {
    return this.props.resourceType;
  }

  public get resourceId(): string {
    return this.props.resourceId;
  }

  public get payload(): Record<string, unknown> | null | undefined {
    return this.props.payload;
  }

  public get ipAddress(): string | null | undefined {
    return this.props.ipAddress;
  }

  public get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): AuditLogProps {
    return { ...this.props };
  }
}
