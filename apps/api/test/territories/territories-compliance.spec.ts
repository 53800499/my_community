import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TerritoryType } from '@prisma/client';
import { TerritoryEntity } from '../../src/modules/territories/domain/entities/territory.entity.js';
import { TerritoryReaderPort } from '../../src/modules/territories/application/ports/territory-reader.port.js';
import { TerritoryWriterPort } from '../../src/modules/territories/application/ports/territory-writer.port.js';
import { ListRootTerritoriesQuery } from '../../src/modules/territories/application/queries/list-root-territories.query.js';
import { GetTerritoryChildrenQuery } from '../../src/modules/territories/application/queries/get-territory-children.query.js';
import { GetTerritoryByCodeQuery } from '../../src/modules/territories/application/queries/get-territory-by-code.query.js';

class InMemoryTerritoryRepository implements TerritoryReaderPort, TerritoryWriterPort {
  private readonly items = new Map<string, TerritoryEntity>();

  async findById(id: string): Promise<TerritoryEntity | null> {
    const item = this.items.get(id);
    return item ? TerritoryEntity.create(item.toJSON()) : null;
  }

  async findByCode(code: string): Promise<TerritoryEntity | null> {
    for (const item of this.items.values()) {
      if (item.code === code) return TerritoryEntity.create(item.toJSON());
    }
    return null;
  }

  async listRoots(): Promise<TerritoryEntity[]> {
    return Array.from(this.items.values())
      .filter((item) => item.isRoot())
      .map((item) => TerritoryEntity.create(item.toJSON()));
  }

  async listChildren(parentId: string): Promise<TerritoryEntity[]> {
    return Array.from(this.items.values())
      .filter((item) => item.parentId === parentId)
      .map((item) => TerritoryEntity.create(item.toJSON()));
  }

  async save(territory: TerritoryEntity): Promise<void> {
    this.items.set(territory.id, territory);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

describe('Module Territories — Conformité Hexagonale & SOLID', () => {
  let repository: InMemoryTerritoryRepository;
  let listRootsQuery: ListRootTerritoriesQuery;
  let getChildrenQuery: GetTerritoryChildrenQuery;
  let getByCodeQuery: GetTerritoryByCodeQuery;

  beforeEach(() => {
    repository = new InMemoryTerritoryRepository();
    listRootsQuery = new ListRootTerritoriesQuery(repository);
    getChildrenQuery = new GetTerritoryChildrenQuery(repository);
    getByCodeQuery = new GetTerritoryByCodeQuery(repository);
  });

  it('[SRP] Entité Territory : Valide les invariants métier (nom, code regex)', () => {
    expect(() =>
      TerritoryEntity.create({
        id: 't1',
        name: 'A',
        code: 'BEN',
        type: TerritoryType.COUNTRY,
        createdAt: new Date(),
      }),
    ).toThrow('Le nom du territoire doit comporter au moins 2 caractères.');

    expect(() =>
      TerritoryEntity.create({
        id: 't1',
        name: 'Bénin',
        code: 'invalid code!',
        type: TerritoryType.COUNTRY,
        createdAt: new Date(),
      }),
    ).toThrow('Le code territorial doit être composé de majuscules, chiffres ou tirets');
  });

  it('[LSP & DIP] ListRootTerritoriesQuery : Récupère uniquement les pays racines', async () => {
    const benin = TerritoryEntity.create({
      id: 'ben',
      name: 'Bénin',
      code: 'BEN',
      type: TerritoryType.COUNTRY,
      createdAt: new Date(),
    });
    const littoral = TerritoryEntity.create({
      id: 'ben-lit',
      name: 'Littoral',
      code: 'BEN-LIT',
      type: TerritoryType.DEPARTMENT,
      parentId: 'ben',
      createdAt: new Date(),
    });

    await repository.save(benin);
    await repository.save(littoral);

    const roots = await listRootsQuery.execute();
    expect(roots.length).toBe(1);
    expect(roots[0]?.code).toBe('BEN');
    expect(roots[0]?.isRoot()).toBe(true);
  });

  it('[ISP] GetTerritoryChildrenQuery : Récupère les enfants d\'un territoire sans écriture', async () => {
    const littoral = TerritoryEntity.create({
      id: 'ben-lit',
      name: 'Littoral',
      code: 'BEN-LIT',
      type: TerritoryType.DEPARTMENT,
      parentId: 'ben',
      createdAt: new Date(),
    });
    const cotonou = TerritoryEntity.create({
      id: 'ben-lit-cot',
      name: 'Cotonou',
      code: 'BEN-LIT-COT',
      type: TerritoryType.COMMUNE,
      parentId: 'ben-lit',
      createdAt: new Date(),
    });

    await repository.save(littoral);
    await repository.save(cotonou);

    const children = await getChildrenQuery.execute({ parentId: 'ben-lit' });
    expect(children.length).toBe(1);
    expect(children[0]?.name).toBe('Cotonou');
  });

  it('[LSP] GetTerritoryByCodeQuery : Lève NotFoundException si introuvable', async () => {
    await expect(getByCodeQuery.execute({ code: 'UNKNOWN' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
