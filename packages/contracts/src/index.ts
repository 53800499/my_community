/**
 * My Community — Contrats d'API & Interfaces Partagées
 * Alignés sur les spécifications 05-specifications-techniques et ADR-007
 */

// Devise & Montants
export const DEFAULT_CURRENCY = 'XOF' as const;
export type CurrencyCode = 'XOF';

export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

// Spécification RFC 7807 (Problem Details for HTTP APIs)
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code?: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

// Statuts d'Adhésion Communautaire
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

// Rôles dans la Communauté
export type CommunityRole = 'MEMBER' | 'MODERATOR' | 'MANAGER' | 'ADMIN';

// Types d'Événements Financiers
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED';

// Visibilité des Publications
export type PostVisibility = 'PUBLIC' | 'COMMUNITY' | 'ASSOCIATION_MEMBERS';
