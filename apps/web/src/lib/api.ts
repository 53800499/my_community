/**
 * Unified API Client & Services Facade
 * 
 * Re-exports domain types and services decomposed by feature modules:
 * - Auth & Identity: @/features/auth
 * - Territories: @/features/territories
 * - Communities & Memberships: @/features/communities
 * - Associations & Governance: @/features/associations
 * - Residences & Leases: @/features/residences
 * - Users & Citizens: @/features/users
 * 
 * Complies with SOLID principles (SRP, ISP, DIP) and modular architecture.
 */

// Core HTTP client and storage helpers
export * from "./api-client";

// Feature Types
export * from "@/features/auth/types/auth.types";
export * from "@/features/territories/types/territory.types";
export * from "@/features/communities/types/community.types";
export * from "@/features/associations/types/association-api.types";
export * from "@/features/residences/types/residence-api.types";
export * from "@/features/users/types/user.types";

// Feature Services
import { authApiService } from "@/features/auth/services/auth-api.service";
import { territoryApiService } from "@/features/territories/services/territory-api.service";
import { communityApiService } from "@/features/communities/services/community-api.service";
import { associationGovernanceApiService } from "@/features/associations/services/association-governance-api.service";
import { residenceApiService } from "@/features/residences/services/residence-api.service";
import { userApiService } from "@/features/users/services/user-api.service";

import { mandateAuditTrailService } from "@/features/associations/services/mandate-audit-trail.service";

export {
  authApiService,
  territoryApiService,
  communityApiService,
  associationGovernanceApiService,
  residenceApiService,
  userApiService,
  mandateAuditTrailService,
};

/**
 * Composite apiService Facade for seamless backward compatibility.
 * Delegates calls to the appropriate feature-specific API service.
 */
export const apiService = {
  auth: authApiService,
  communities: communityApiService,
  associations: associationGovernanceApiService.associations,
  mandates: associationGovernanceApiService.mandates,
  associationContracts: associationGovernanceApiService.associationContracts,
  associationIntegrationRules: associationGovernanceApiService.associationIntegrationRules,
  associationExecutiveContracts: associationGovernanceApiService.associationExecutiveContracts,
  mandateAuditTrail: mandateAuditTrailService,
  residences: residenceApiService.residences,
  residenceContracts: residenceApiService.residenceContracts,
  residenceAdmissionRules: residenceApiService.residenceAdmissionRules,
  residentDelegateContracts: residenceApiService.residentDelegateContracts,
  territories: territoryApiService,
  users: userApiService,
};
