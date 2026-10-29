export interface ApiCommunity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  justification?: string;
  type: "TERRITORIAL" | "THEMATIC";
  membersCount: number;
  territoryName?: string;
  territoryId?: string;
  status?: "PENDING" | "ACTIVE" | "SUSPENDED";
  monthlyDuesXOF?: number;
  president?: string;
  secretary?: string;
  charter?: string[];
  createdAt?: string;
}

export interface ApiCommunityProposal {
  id: string;
  name: string;
  description: string;
  justification: string;
  territoryId: string;
  territoryName?: string;
  proposedById: string;
  proposedByName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";
  reviewedById?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiMembership {
  id: string;
  communityId: string;
  communityName?: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REVOKED";
  roles: ("MEMBER" | "MODERATOR" | "MANAGER" | "ADMIN")[];
  joinedAt: string;
  updatedAt: string;
}
