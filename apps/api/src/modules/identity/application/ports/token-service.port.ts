export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  email: string | null;
}

/**
 * Port Hexagonal : Émission et Validation des Jetons de Session (DIP)
 * Isole les cas d'usage de la technologie de token (JWT, opaque token, PASETO).
 */
export abstract class TokenServicePort {
  abstract generateToken(payload: TokenPayload): Promise<string>;
  abstract verifyToken(token: string): Promise<TokenPayload | null>;
}

export const TOKEN_SERVICE_PORT = Symbol('TOKEN_SERVICE_PORT');
