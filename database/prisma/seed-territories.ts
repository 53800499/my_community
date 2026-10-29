import { PrismaClient, TerritoryType } from '@prisma/client';

const prisma = new PrismaClient();

interface DepartmentSeed {
  code: string;
  name: string;
  communes: {
    name: string;
    districts?: {
      name: string;
      neighborhoods?: string[];
    }[];
  }[];
}

const BENIN_TERRITORIES: DepartmentSeed[] = [
  {
    code: 'BEN-ATL',
    name: 'Atlantique',
    communes: [
      {
        name: 'Abomey-Calavi',
        districts: [
          {
            name: 'Abomey-Calavi Centre',
            neighborhoods: ['Bidossessi', 'Agori', 'Sèmè', 'Aitchedji'],
          },
          {
            name: 'Godomey',
            neighborhoods: ['Godomey Centre', 'Togoudo', 'Yénawa', 'Dênou'],
          },
          {
            name: 'Tankpè',
            neighborhoods: ['Campus UAC', 'Tankpè Centre', 'Gbodjè'],
          },
          { name: 'Akassato' },
          { name: 'Glo-Djigbé' },
          { name: 'Hêvié' },
          { name: 'Ouêdo' },
          { name: 'Zinvié' },
        ],
      },
      { name: 'Allada' },
      { name: 'Ouidah', districts: [{ name: 'Ouidah 1' }, { name: 'Ouidah 2' }, { name: 'Pahou' }] },
      { name: 'Kpomassè' },
      { name: 'Sô-Ava' },
      { name: 'Toffo' },
      { name: 'Tori-Bossito' },
      { name: 'Zè' },
    ],
  },
  {
    code: 'BEN-LIT',
    name: 'Littoral',
    communes: [
      {
        name: 'Cotonou',
        districts: [
          {
            name: '12ème Arrondissement',
            neighborhoods: ['Cadjehoun', 'Fidjrossè', 'Agla', 'Cocotiers'],
          },
          {
            name: '5ème Arrondissement',
            neighborhoods: ['Gbégamey', 'Zongo', 'Guinkomey'],
          },
          {
            name: '1er Arrondissement',
            neighborhoods: ['Dandji', 'Donaten', 'Tokplegbe'],
          },
          { name: '2ème Arrondissement' },
          { name: '3ème Arrondissement' },
          { name: '4ème Arrondissement' },
          { name: '6ème Arrondissement' },
          { name: '7ème Arrondissement' },
          { name: '8ème Arrondissement' },
          { name: '9ème Arrondissement' },
          { name: '10ème Arrondissement' },
          { name: '11ème Arrondissement' },
          { name: '13ème Arrondissement' },
        ],
      },
    ],
  },
  {
    code: 'BEN-OUE',
    name: 'Ouémé',
    communes: [
      {
        name: 'Porto-Novo',
        districts: [
          { name: '1er Arrondissement' },
          { name: '2ème Arrondissement' },
          { name: '3ème Arrondissement', neighborhoods: ['Oganla', 'Hodonou'] },
          { name: '4ème Arrondissement' },
          { name: '5ème Arrondissement' },
        ],
      },
      { name: 'Adjarra' },
      { name: 'Adjohoun' },
      { name: 'Aguégués' },
      { name: 'Akpro-Missérété' },
      { name: 'Avrankou' },
      { name: 'Bonou' },
      { name: 'Dangbo' },
      { name: 'Sèmè-Kpodji' },
    ],
  },
  {
    code: 'BEN-BOR',
    name: 'Borgou',
    communes: [
      {
        name: 'Parakou',
        districts: [
          { name: '1er Arrondissement', neighborhoods: ['Parakou Centre', 'Albarika'] },
          { name: '2ème Arrondissement', neighborhoods: ['Banikanni', 'Ladji Farani'] },
          { name: '3ème Arrondissement', neighborhoods: ['Guéma', 'Tranza'] },
        ],
      },
      { name: 'Bembèrèkè' },
      { name: 'Kalalé' },
      { name: "N'Dali" },
      { name: 'Nikki' },
      { name: 'Pèrèrè' },
      { name: 'Sinendé' },
      { name: 'Tchaourou' },
    ],
  },
  {
    code: 'BEN-ZOU',
    name: 'Zou',
    communes: [
      { name: 'Abomey' },
      { name: 'Bohicon' },
      { name: 'Agbangnizoun' },
      { name: 'Covè' },
      { name: 'Djidja' },
      { name: 'Ouinhi' },
      { name: 'Za-Kpota' },
      { name: 'Zagnanado' },
      { name: 'Zogbodomey' },
    ],
  },
  {
    code: 'BEN-MON',
    name: 'Mono',
    communes: [
      { name: 'Lokossa' },
      { name: 'Athiémé' },
      { name: 'Bopa' },
      { name: 'Comè' },
      { name: 'Grand-Popo' },
      { name: 'Houéyogbé' },
    ],
  },
  {
    code: 'BEN-ALI',
    name: 'Alibori',
    communes: [
      { name: 'Kandi' },
      { name: 'Banikoara' },
      { name: 'Gogounou' },
      { name: 'Karimama' },
      { name: 'Malanville' },
      { name: 'Ségbana' },
    ],
  },
  {
    code: 'BEN-ATA',
    name: 'Atacora',
    communes: [
      { name: 'Natitingou' },
      { name: 'Boukoumbé' },
      { name: 'Cobly' },
      { name: 'Kérou' },
      { name: 'Kouandé' },
      { name: 'Matéri' },
      { name: 'Péhunco' },
      { name: 'Tanguiéta' },
      { name: 'Toucountouna' },
    ],
  },
  {
    code: 'BEN-COL',
    name: 'Collines',
    communes: [
      { name: 'Dassa-Zoumè' },
      { name: 'Bantè' },
      { name: 'Glazoué' },
      { name: 'Ouèssè' },
      { name: 'Savalou' },
      { name: 'Savè' },
    ],
  },
  {
    code: 'BEN-COU',
    name: 'Couffo',
    communes: [
      { name: 'Aplahoué' },
      { name: 'Djakotomey' },
      { name: 'Dogbo' },
      { name: 'Klouékanmè' },
      { name: 'Lalo' },
      { name: 'Toviklin' },
    ],
  },
  {
    code: 'BEN-DON',
    name: 'Donga',
    communes: [
      { name: 'Djougou' },
      { name: 'Bassila' },
      { name: 'Copargo' },
      { name: 'Ouaké' },
    ],
  },
  {
    code: 'BEN-PLA',
    name: 'Plateau',
    communes: [
      { name: 'Pobè' },
      { name: 'Adja-Ouèrè' },
      { name: 'Ifangni' },
      { name: 'Kétou' },
      { name: 'Sakété' },
    ],
  },
];

function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
}

async function main() {
  console.log('🌍 [Seed Territoires] Initialisation complète des Territoires de la République du Bénin...');

  // 1. Pays : Bénin
  const country = await prisma.territory.upsert({
    where: { code: 'BEN' },
    update: { name: 'République du Bénin', type: TerritoryType.COUNTRY },
    create: {
      name: 'République du Bénin',
      code: 'BEN',
      type: TerritoryType.COUNTRY,
    },
  });
  console.log(`✓ Pays racine : ${country.name} (${country.code}) [${country.id}]`);

  let countDepartments = 0;
  let countCommunes = 0;
  let countDistricts = 0;
  let countNeighborhoods = 0;

  for (const dept of BENIN_TERRITORIES) {
    // 2. Départements (12)
    const deptRecord = await prisma.territory.upsert({
      where: { code: dept.code },
      update: { name: dept.name, parentId: country.id, type: TerritoryType.DEPARTMENT },
      create: {
        name: dept.name,
        code: dept.code,
        type: TerritoryType.DEPARTMENT,
        parentId: country.id,
      },
    });
    countDepartments++;

    // 3. Communes (77)
    for (const comm of dept.communes) {
      const commSlug = generateSlug(comm.name);
      const commCode = `${dept.code}-${commSlug}`;

      const communeRecord = await prisma.territory.upsert({
        where: { code: commCode },
        update: { name: comm.name, parentId: deptRecord.id, type: TerritoryType.COMMUNE },
        create: {
          name: comm.name,
          code: commCode,
          type: TerritoryType.COMMUNE,
          parentId: deptRecord.id,
        },
      });
      countCommunes++;

      // 4. Arrondissements (si spécifiés)
      if (comm.districts && comm.districts.length > 0) {
        for (const dist of comm.districts) {
          const distSlug = generateSlug(dist.name);
          const distCode = `${commCode}-${distSlug}`;

          const districtRecord = await prisma.territory.upsert({
            where: { code: distCode },
            update: { name: dist.name, parentId: communeRecord.id, type: TerritoryType.ARRONDISSEMENT },
            create: {
              name: dist.name,
              code: distCode,
              type: TerritoryType.ARRONDISSEMENT,
              parentId: communeRecord.id,
            },
          });
          countDistricts++;

          // 5. Quartiers / Villages (si spécifiés)
          if (dist.neighborhoods && dist.neighborhoods.length > 0) {
            for (const neigh of dist.neighborhoods) {
              const neighSlug = generateSlug(neigh);
              const neighCode = `${distCode}-${neighSlug}`;

              await prisma.territory.upsert({
                where: { code: neighCode },
                update: { name: neigh, parentId: districtRecord.id, type: TerritoryType.VILLAGE_QUARTIER },
                create: {
                  name: neigh,
                  code: neighCode,
                  type: TerritoryType.VILLAGE_QUARTIER,
                  parentId: districtRecord.id,
                },
              });
              countNeighborhoods++;
            }
          }
        }
      }
    }
  }

  console.log(`\n🎉 [Seed Territoires Terminé avec Succès] :`);
  console.log(`- ${countDepartments} Départements béninois.`);
  console.log(`- ${countCommunes} Communes officielles.`);
  console.log(`- ${countDistricts} Arrondissements clés.`);
  console.log(`- ${countNeighborhoods} Quartiers / Villages enregistrés.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed des territoires:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
