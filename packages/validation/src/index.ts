import { z } from 'zod';

// Validation UUID v4
export const uuidSchema = z.string().uuid({ message: 'Identifiant UUID invalide' });

// Format Téléphone Bénin / Afrique de l'Ouest (E.164 ou standard béninois +229)
export const beninPhoneRegex = /^(\+229)?[0-9]{8,10}$/;
export const phoneNumberSchema = z
  .string()
  .regex(beninPhoneRegex, { message: 'Numéro de téléphone invalide (format attendu : +229XXXXXXXX)' });

// Devise & Montant (NUMERIC 14,2 strictement positif)
export const moneySchema = z.object({
  amount: z.number().positive({ message: 'Le montant doit être strictement positif' }),
  currency: z.literal('XOF', { message: 'Seul le Franc CFA (XOF) est supporté' }),
});

// Pagination basée sur curseur (conformément à 05-specifications-techniques)
export const cursorPaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Schéma de création / proposition de communauté
export const proposeCommunitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  territoryId: uuidSchema,
  justification: z.string().min(10).max(2000),
});

export type ProposeCommunityInput = z.infer<typeof proposeCommunitySchema>;
