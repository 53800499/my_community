/**
 * Règle Métier dans le Domaine Pur (Indépendant de tout framework)
 * Réf: docs/08-documentation-code.md
 */
export class CommunityApprovalPolicy {
  public static canBeApproved(status: string, actorIsPlatformAdmin: boolean): boolean {
    if (!actorIsPlatformAdmin) {
      return false;
    }
    return status === 'PENDING';
  }
}
