import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './jwt-auth.guard.js';

/**
 * Guard NestJS : Habilitation Administration Générale de la Plateforme (PlatformAdminGuard)
 * Conforme SOLID (SRP & ISP) et ADR-005 :
 * - Vérifie que l'utilisateur authentifié détient formellement le statut d'Administrateur Général.
 * - Rejette immédiatement les requêtes non autorisées avec HTTP 403 Forbidden (RFC 7807).
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        "Accès refusé : Utilisateur non authentifié.",
      );
    }

    if (!user.isPlatformAdmin) {
      throw new ForbiddenException(
        "Accès restreint : Cette ressource ou opération administrative est strictement réservée à l'Administration Générale de la Plateforme (Super-Admin).",
      );
    }

    return true;
  }
}
