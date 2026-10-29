import {
  PrismaClient,
  TerritoryType,
  AccountStatus,
  ProposalStatus,
  MembershipStatus,
  CommunityRole,
  AssociationRole,
  RoomStatus,
  OccupationStatus,
} from '@prisma/client';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

async function main() {
  console.log('--- Initialisation des données réelles PostgreSQL pour My Community (Bénin) ---');

  // ===========================================================================
  // 1. TERRITOIRES DU BÉNIN (Pays, 12 Départements, Communes Clés)
  // ===========================================================================
  const benin = await prisma.territory.upsert({
    where: { code: 'BEN' },
    update: {},
    create: {
      name: 'République du Bénin',
      code: 'BEN',
      type: TerritoryType.COUNTRY,
    },
  });

  const deptData = [
    { code: 'BEN-ATL', name: 'Atlantique', communes: ['Abomey-Calavi', 'Allada', 'Ouidah', 'Kpomassè', 'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè'] },
    { code: 'BEN-LIT', name: 'Littoral', communes: ['Cotonou'] },
    { code: 'BEN-OUE', name: 'Ouémé', communes: ['Porto-Novo', 'Adjarra', 'Adjohoun', 'Aguégués', 'Akpro-Missérété', 'Avrankou', 'Bonou', 'Dangbo', 'Sèmè-Kpodji'] },
    { code: 'BEN-BOR', name: 'Borgou', communes: ['Parakou', 'Bembèrèkè', 'Kalalé', "N'Dali", 'Nikki', 'Pèrèrè', 'Sinendé', 'Tchaourou'] },
    { code: 'BEN-ZOU', name: 'Zou', communes: ['Abomey', 'Bohicon', 'Agbangnizoun', 'Covè', 'Djidja', 'Ouinhi', 'Za-Kpota', 'Zagnanado', 'Zogbodomey'] },
    { code: 'BEN-MON', name: 'Mono', communes: ['Lokossa', 'Athiémé', 'Bopa', 'Comè', 'Grand-Popo', 'Houéyogbé'] },
    { code: 'BEN-ALI', name: 'Alibori', communes: ['Kandi', 'Banikoara', 'Gogounou', 'Karimama', 'Malanville', 'Ségbana'] },
    { code: 'BEN-ATA', name: 'Atacora', communes: ['Natitingou', 'Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 'Matéri', 'Péhunco', 'Tanguiéta', 'Toucountouna'] },
    { code: 'BEN-COL', name: 'Collines', communes: ['Dassa-Zoumè', 'Bantè', 'Glazoué', 'Ouèssè', 'Savalou', 'Savè'] },
    { code: 'BEN-COU', name: 'Couffo', communes: ['Aplahoué', 'Djakotomey', 'Dogbo', 'Klouékanmè', 'Lalo', 'Toviklin'] },
    { code: 'BEN-DON', name: 'Donga', communes: ['Djougou', 'Bassila', 'Copargo', 'Ouaké'] },
    { code: 'BEN-PLA', name: 'Plateau', communes: ['Pobè', 'Adja-Ouèrè', 'Ifangni', 'Kétou', 'Sakété'] },
  ];

  const territoryMap = new Map<string, string>(); // code/name -> UUID
  territoryMap.set('BEN', benin.id);

  for (const d of deptData) {
    const deptRecord = await prisma.territory.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: {
        name: d.name,
        code: d.code,
        type: TerritoryType.DEPARTMENT,
        parentId: benin.id,
      },
    });
    territoryMap.set(d.code, deptRecord.id);
    territoryMap.set(d.name, deptRecord.id);

    // Communes
    for (const cName of d.communes) {
      const cleanSlug = cName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, 4);
      const cCode = `${d.code}-${cleanSlug}`;
      const communeRecord = await prisma.territory.upsert({
        where: { code: cCode },
        update: { name: cName },
        create: {
          name: cName,
          code: cCode,
          type: TerritoryType.COMMUNE,
          parentId: deptRecord.id,
        },
      });
      territoryMap.set(cName, communeRecord.id);
    }
  }

  console.log('✓ 12 Départements et Communes du Bénin initialisés.');

  // ===========================================================================
  // 2. UTILISATEURS DU SYSTÈME (Admin, Responsables, Citoyens)
  // ===========================================================================
  const pwdHash = await hashPassword('Password123!');

  const userAdmin = await prisma.userAccount.upsert({
    where: { phoneNumber: '+22997123456' },
    update: {},
    create: {
      phoneNumber: '+22997123456',
      email: 'sikirou@mycommunity.bj',
      passwordHash: pwdHash,
      status: AccountStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Abdoulaye',
          lastName: 'Sikirou',
          bio: 'Gestionnaire territorial et citoyen engagé pour le développement local au Bénin.',
          city: 'Abomey-Calavi',
        },
      },
    },
  });

  const userBenoit = await prisma.userAccount.upsert({
    where: { phoneNumber: '+22997112233' },
    update: {},
    create: {
      phoneNumber: '+22997112233',
      email: 'benoit@gmail.com',
      passwordHash: pwdHash,
      status: AccountStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Benoît',
          lastName: 'Ahouanmenou',
          city: 'Abomey-Calavi',
        },
      },
    },
  });

  const userNadine = await prisma.userAccount.upsert({
    where: { phoneNumber: '+22995667788' },
    update: {},
    create: {
      phoneNumber: '+22995667788',
      email: 'nadine.degila@uac.bj',
      passwordHash: pwdHash,
      status: AccountStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Nadine',
          lastName: 'Degila',
          city: 'Abomey-Calavi',
        },
      },
    },
  });

  console.log('✓ Comptes utilisateurs enregistrés (+22997123456 - Sikirou).');

  // ===========================================================================
  // 3. COMMUNAUTÉS CITOYENNES & PROPOSITIONS VALIDÉES (Niveau 2)
  // ===========================================================================
  const atlId = territoryMap.get('BEN-ATL') || benin.id;
  const litId = territoryMap.get('BEN-LIT') || benin.id;
  const calaviId = territoryMap.get('Abomey-Calavi') || atlId;
  const cotonouId = territoryMap.get('Cotonou') || litId;

  // 3.1 Communauté Abomey-Calavi
  const propCalavi = await prisma.communityProposal.upsert({
    where: { id: 'c1111111-1111-4111-a111-111111111111' },
    update: {},
    create: {
      id: 'c1111111-1111-4111-a111-111111111111',
      name: "Commune d'Abomey-Calavi",
      description: "Espace citoyen officiel des résidents d'Abomey-Calavi et ses 70 arrondissements & quartiers. Alertes municipales, salubrité et entraide de proximité.",
      justification: "Nécessité de concertation locale et d'amélioration du cadre de vie pour les résidents de Calavi.",
      territoryId: calaviId,
      proposedById: userAdmin.id,
      status: ProposalStatus.APPROVED,
      reviewedById: userAdmin.id,
      reviewedAt: new Date(),
    },
  });

  const comCalavi = await prisma.community.upsert({
    where: { slug: 'abomey-calavi' },
    update: {},
    create: {
      name: "Commune d'Abomey-Calavi",
      slug: 'abomey-calavi',
      description: "Espace citoyen officiel des résidents d'Abomey-Calavi et ses 70 arrondissements & quartiers.",
      territoryId: calaviId,
      approvedProposalId: propCalavi.id,
    },
  });

  // 3.2 Communauté Cotonou
  const propCotonou = await prisma.communityProposal.upsert({
    where: { id: 'c2222222-2222-4222-a222-222222222222' },
    update: {},
    create: {
      id: 'c2222222-2222-4222-a222-222222222222',
      name: 'Commune de Cotonou',
      description: 'Toutes les actualités des 13 arrondissements de la capitale économique : vie des quartiers, marchés, initiatives civiques.',
      justification: 'Coordination métropolitaine et fluidification des démarches participatives locales.',
      territoryId: cotonouId,
      proposedById: userAdmin.id,
      status: ProposalStatus.APPROVED,
      reviewedById: userAdmin.id,
      reviewedAt: new Date(),
    },
  });

  const comCotonou = await prisma.community.upsert({
    where: { slug: 'cotonou' },
    update: {},
    create: {
      name: 'Commune de Cotonou',
      slug: 'cotonou',
      description: 'Toutes les actualités des 13 arrondissements de la capitale économique.',
      territoryId: cotonouId,
      approvedProposalId: propCotonou.id,
    },
  });

  // 3.3 Communauté Campus UAC Solidarité
  const propUac = await prisma.communityProposal.upsert({
    where: { id: 'c3333333-3333-4333-a333-333333333333' },
    update: {},
    create: {
      id: 'c3333333-3333-4333-a333-333333333333',
      name: 'Campus Universitaire UAC Solidarité',
      description: "Regroupement des étudiants, résidents et enseignants de l'UAC. Logement solidaire, bourses, covoiturage et entraide académique.",
      justification: 'Plateforme solidaire pour les résidences étudiantes de Tankpè et Zogbadjè.',
      territoryId: calaviId,
      proposedById: userNadine.id,
      status: ProposalStatus.APPROVED,
      reviewedById: userAdmin.id,
      reviewedAt: new Date(),
    },
  });

  const comUac = await prisma.community.upsert({
    where: { slug: 'campus-uac' },
    update: {},
    create: {
      name: 'Campus Universitaire UAC Solidarité',
      slug: 'campus-uac',
      description: "Regroupement des étudiants, résidents et enseignants de l'UAC.",
      territoryId: calaviId,
      approvedProposalId: propUac.id,
    },
  });

  // 3.4 Propositions en attente d'instruction (Pending)
  await prisma.communityProposal.upsert({
    where: { id: 'c4444444-4444-4444-a444-444444444444' },
    update: {},
    create: {
      id: 'c4444444-4444-4444-a444-444444444444',
      name: 'Ville Historique de Porto-Novo',
      description: 'Espace de concertation pour la valorisation du patrimoine et des festivals de la capitale.',
      justification: 'Mise en valeur culturelle des trois quartiers historiques de Porto-Novo.',
      territoryId: territoryMap.get('BEN-OUE') || benin.id,
      proposedById: userBenoit.id,
      status: ProposalStatus.PENDING,
    },
  });

  // ===========================================================================
  // 4. ADHÉSIONS & RÔLES LOCAUX (Niveau 2 - Memberships)
  // ===========================================================================
  const memCalavi = await prisma.communityMembership.upsert({
    where: { communityId_userId: { communityId: comCalavi.id, userId: userAdmin.id } },
    update: {},
    create: {
      communityId: comCalavi.id,
      userId: userAdmin.id,
      status: MembershipStatus.ACTIVE,
    },
  });

  await prisma.communityMembershipRole.upsert({
    where: { membershipId_role: { membershipId: memCalavi.id, role: CommunityRole.MANAGER } },
    update: {},
    create: { membershipId: memCalavi.id, role: CommunityRole.MANAGER },
  });

  await prisma.communityMembershipRole.upsert({
    where: { membershipId_role: { membershipId: memCalavi.id, role: CommunityRole.MEMBER } },
    update: {},
    create: { membershipId: memCalavi.id, role: CommunityRole.MEMBER },
  });

  const memUac = await prisma.communityMembership.upsert({
    where: { communityId_userId: { communityId: comUac.id, userId: userAdmin.id } },
    update: {},
    create: {
      communityId: comUac.id,
      userId: userAdmin.id,
      status: MembershipStatus.ACTIVE,
    },
  });

  await prisma.communityMembershipRole.upsert({
    where: { membershipId_role: { membershipId: memUac.id, role: CommunityRole.MEMBER } },
    update: {},
    create: { membershipId: memUac.id, role: CommunityRole.MEMBER },
  });

  console.log('✓ Communautés et Adhésions réelles synchronisées.');

  // ===========================================================================
  // 5. ASSOCIATIONS (Niveau 3 - Associations & Multi-Rattachement N-N)
  // ===========================================================================
  const assocAjac = await prisma.association.upsert({
    where: { registrationNumber: 'BEN-ABC-2024-042' },
    update: {},
    create: {
      name: "Association des Jeunes d'Abomey-Calavi (AJAC)",
      acronym: 'AJAC',
      registrationNumber: 'BEN-ABC-2024-042',
      description: "Association citoyenne œuvrant pour l'engagement civique et l'entraide de quartier à Calavi.",
    },
  });

  await prisma.associationMember.upsert({
    where: { associationId_userId: { associationId: assocAjac.id, userId: userAdmin.id } },
    update: {},
    create: {
      associationId: assocAjac.id,
      userId: userAdmin.id,
      role: AssociationRole.PRESIDENT,
    },
  });

  // Rattachement N-N : AJAC rattachée à la communauté de Calavi
  await prisma.associationCommunity.upsert({
    where: { associationId_communityId: { associationId: assocAjac.id, communityId: comCalavi.id } },
    update: {},
    create: {
      associationId: assocAjac.id,
      communityId: comCalavi.id,
    },
  });

  const assocCadjehoun = await prisma.association.upsert({
    where: { registrationNumber: 'BEN-COT-2023-118' },
    update: {},
    create: {
      name: 'Collectif des Résidents de Cadjehoun',
      acronym: 'CRC',
      registrationNumber: 'BEN-COT-2023-118',
      description: 'Sécurité et vie citoyenne du quartier Cadjehoun.',
    },
  });

  await prisma.associationCommunity.upsert({
    where: { associationId_communityId: { associationId: assocCadjehoun.id, communityId: comCotonou.id } },
    update: {},
    create: {
      associationId: assocCadjehoun.id,
      communityId: comCotonou.id,
    },
  });

  console.log('✓ Associations réelles et liens multi-communautaires créés.');

  // ===========================================================================
  // 6. RÉSIDENCES & LOGEMENTS (Niveau 3 - ADR-010)
  // ===========================================================================
  const quarterCalavi = await prisma.quarter.upsert({
    where: { id: 'a1111111-1111-4111-b111-111111111111' },
    update: {},
    create: {
      id: 'a1111111-1111-4111-b111-111111111111',
      associationId: assocAjac.id,
      name: 'Bidossessi Résidences',
      city: 'Abomey-Calavi',
      description: 'Zone résidentielle et universitaire de Calavi',
    },
  });

  const bldgHibiscus = await prisma.building.upsert({
    where: { id: 'b1111111-1111-4111-a111-111111111111' },
    update: {},
    create: {
      id: 'b1111111-1111-4111-a111-111111111111',
      quarterId: quarterCalavi.id,
      name: 'Bâtiment Hibiscus',
      address: 'Rue 104, Lot 12',
      landlordName: 'El Hadj Ousmane Bio',
      landlordPhone: '+229 97 10 20 30',
      landlordIbanOrMomo: 'MoMo: 97102030',
      floorsCount: 3,
    },
  });

  // Chambres
  const room101 = await prisma.room.upsert({
    where: { buildingId_roomNumber: { buildingId: bldgHibiscus.id, roomNumber: 'Chambre 101' } },
    update: { status: RoomStatus.OCCUPIED },
    create: {
      buildingId: bldgHibiscus.id,
      roomNumber: 'Chambre 101',
      capacity: 1,
      status: RoomStatus.OCCUPIED,
    },
  });

  await prisma.room.upsert({
    where: { buildingId_roomNumber: { buildingId: bldgHibiscus.id, roomNumber: 'Chambre 102' } },
    update: { status: RoomStatus.AVAILABLE },
    create: {
      buildingId: bldgHibiscus.id,
      roomNumber: 'Chambre 102',
      capacity: 1,
      status: RoomStatus.AVAILABLE,
    },
  });

  await prisma.room.upsert({
    where: { buildingId_roomNumber: { buildingId: bldgHibiscus.id, roomNumber: 'Chambre 103' } },
    update: { status: RoomStatus.AVAILABLE },
    create: {
      buildingId: bldgHibiscus.id,
      roomNumber: 'Chambre 103',
      capacity: 2,
      status: RoomStatus.AVAILABLE,
    },
  });

  // Attribution active pour Benoît
  await prisma.roomOccupation.upsert({
    where: { id: 'd1111111-1111-4111-a111-111111111111' },
    update: {},
    create: {
      id: 'd1111111-1111-4111-a111-111111111111',
      roomId: room101.id,
      occupantUserId: userBenoit.id,
      associationId: assocAjac.id,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-08-31'),
      isActive: true,
      status: OccupationStatus.ACTIVE,
    },
  });

  console.log('✓ Quartiers, Bâtiments, Chambres et Baux actifs créés dans PostgreSQL.');
  console.log('--- Base de données PostgreSQL entièrement initialisée avec succès ! ---');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
