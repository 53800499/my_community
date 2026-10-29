import {
  Association,
  AssociationPosition,
  AssociationMember,
  AssociationPost,
  CreatePositionInput,
  AssignPositionInput,
  CreatePostInput,
  UpdatePostInput,
  RegisterAssociationInput,
  AddMemberInput,
  StudentOpportunityRelanceInput,
} from '../domain/association.types';

/**
 * Port Abstrait : Service de Gestion des Associations & Gouvernance (ISP & DIP)
 */
export interface AssociationServicePort {
  listAssociations(): Promise<Association[]>;
  getAssociationById(id: string): Promise<Association>;
  registerAssociation(input: RegisterAssociationInput): Promise<Association>;
  linkCommunity(associationId: string, communityId: string): Promise<{ success: boolean }>;

  // Gestion des Postes & Organigramme
  listPositions(associationId: string): Promise<AssociationPosition[]>;
  createPosition(associationId: string, input: CreatePositionInput): Promise<AssociationPosition>;
  assignPosition(
    associationId: string,
    positionId: string,
    input: AssignPositionInput,
  ): Promise<AssociationPosition>;
  vacatePosition(associationId: string, positionId: string): Promise<AssociationPosition>;
  deletePosition(associationId: string, positionId: string): Promise<void>;
  updatePositionPermissions(
    associationId: string,
    positionId: string,
    accessSpaces: string[],
    permissions: string[],
  ): Promise<AssociationPosition>;

  // Gestion des Membres & Adhésions
  listMembers(associationId: string): Promise<AssociationMember[]>;
  addMember(
    associationId: string,
    input: AddMemberInput,
  ): Promise<AssociationMember>;
  dispatchStudentOpportunityRelance(
    associationId: string,
    input: StudentOpportunityRelanceInput,
  ): Promise<{ notifiedCount: number; message: string }>;

  // Publications & Annonces du Bureau
  listPosts(associationId: string): Promise<AssociationPost[]>;
  createPost(associationId: string, input: CreatePostInput): Promise<AssociationPost>;
  updatePost(
    associationId: string,
    postId: string,
    input: UpdatePostInput,
  ): Promise<AssociationPost>;
  deletePost(associationId: string, postId: string): Promise<void>;
  togglePinPost(associationId: string, postId: string): Promise<AssociationPost>;
}
