import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetails } from '@my-community/contracts';

/**
 * Filtre Global RFC 7807 (Problem Details for HTTP APIs)
 * Intercepte et transforme toutes les exceptions en format structuré,
 * compréhensible et actionnable pour les utilisateurs et le frontend.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Erreur Interne du Serveur';
    let detail = 'Une anomalie inattendue est survenue lors du traitement de la requête.';
    let code = 'INTERNAL_SERVER_ERROR';
    let errors: Record<string, string[]> | undefined;

    // 1. Exceptions HTTP NestJS (Validation, 401, 403, 404, 409...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        detail = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        title = (body.error as string) || this.getDefaultTitleForStatus(status);
        detail = (body.message as string) || exception.message;
        code = (body.code as string) || `HTTP_${status}`;

        // Validation class-validator (tableau de messages)
        if (Array.isArray(body.message)) {
          detail = 'Les informations fournies ne respectent pas les critères de validation.';
          errors = { validation: body.message as string[] };
          title = 'Données de formulaire invalides';
          code = 'VALIDATION_FAILED';
        }
      }

      // Titres explicites pour les codes HTTP standards
      if (status === HttpStatus.UNAUTHORIZED) {
        title = 'Session non authentifiée';
        detail = typeof detail === 'string' && detail !== 'Unauthorized'
          ? detail
          : 'Vous devez vous connecter avec un compte valide pour accéder à cette ressource.';
        code = 'UNAUTHORIZED';
      } else if (status === HttpStatus.FORBIDDEN) {
        title = 'Accès non autorisé';
        detail = typeof detail === 'string' && detail !== 'Forbidden'
          ? detail
          : 'Votre profil utilisateur ne dispose pas des privilèges nécessaires pour cette action.';
        code = 'FORBIDDEN';
      } else if (status === HttpStatus.NOT_FOUND) {
        title = 'Ressource introuvable';
        code = 'NOT_FOUND';
      } else if (status === HttpStatus.CONFLICT) {
        title = 'Conflit d\'enregistrement';
        code = 'CONFLICT';
      }
    }
    // 2. Erreurs d'Infrastructure & Base de Données (Prisma / Réseau)
    else if (exception instanceof Error) {
      const err = exception as Error & { code?: string; meta?: Record<string, unknown> };
      const msg = err.message || '';

      // Connexion Base de Données inaccessible
      if (
        msg.includes("Can't reach database server") ||
        msg.includes('Connection refused') ||
        err.code === 'P1001'
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        title = 'Base de données momentanément indisponible';
        detail =
          'Le serveur de base de données local (port 5434) est inaccessible. Veuillez vérifier que le service Docker PostgreSQL est démarré.';
        code = 'DATABASE_UNAVAILABLE';
      }
      // Contrainte d'unicité violée (ex: numéro de téléphone ou email déjà pris)
      else if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        title = 'Information déjà enregistrée';
        const target = Array.isArray(err.meta?.target) ? (err.meta.target as string[]).join(', ') : 'champ unique';
        detail = `Un compte ou enregistrement utilisant déjà cette valeur (${target}) existe sur la plateforme.`;
        code = 'DUPLICATE_ENTRY';
      }
      // Enregistrement lié introuvable
      else if (err.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        title = 'Élément introuvable';
        detail = 'L\'élément référencé n\'existe pas dans la base de données.';
        code = 'RECORD_NOT_FOUND';
      }
      // Dépendance de clé étrangère invalide
      else if (err.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        title = 'Référence invalide';
        detail = 'Cette action fait référence à une entité parente inexistante ou supprimée.';
        code = 'FOREIGN_KEY_VIOLATION';
      }
      // Autre erreur système non catchée
      else {
        this.logger.error(`Erreur inattendue [${request.method} ${request.url}]: ${err.message}`, err.stack);
        detail = err.message;
      }
    }

    const problem: ProblemDetails = {
      type: `https://api.mycommunity.local/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title,
      status,
      detail,
      instance: request.url,
      code,
      timestamp: new Date().toISOString(),
      ...(errors ? { errors } : {}),
    };

    response.status(status).setHeader('Content-Type', 'application/problem+json').json(problem);
  }

  private getDefaultTitleForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Requête invalide';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentification requise';
      case HttpStatus.FORBIDDEN:
        return 'Permissions insuffisantes';
      case HttpStatus.NOT_FOUND:
        return 'Ressource non trouvée';
      case HttpStatus.CONFLICT:
        return 'Conflit de données';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Traitement impossible';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service temporairement indisponible';
      default:
        return 'Erreur de traitement';
    }
  }
}
