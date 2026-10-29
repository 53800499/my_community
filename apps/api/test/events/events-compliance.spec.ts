import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  EventEntity,
  EventRegistrationEntity,
  EventReaderPort,
  EventWriterPort,
  CreateEventUseCase,
  RegisterAttendeeUseCase,
  CancelEventUseCase,
  ListCommunityEventsQuery,
  GetEventDetailsQuery,
  EventMapper,
} from '../../src/modules/events/index.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

class InMemoryEventRepository implements EventReaderPort, EventWriterPort {
  public events = new Map<string, EventEntity>();
  public registrations = new Map<string, EventRegistrationEntity>();

  async findById(id: string): Promise<EventEntity | null> {
    return this.events.get(id) || null;
  }

  async listByCommunity(communityId: string, status?: any): Promise<EventEntity[]> {
    return Array.from(this.events.values()).filter(
      (e) => e.communityId === communityId && (!status || e.status === status),
    );
  }

  async findRegistration(eventId: string, userId: string): Promise<EventRegistrationEntity | null> {
    for (const r of this.registrations.values()) {
      if (r.eventId === eventId && r.userId === userId) {
        return r;
      }
    }
    return null;
  }

  async listEventRegistrations(eventId: string): Promise<EventRegistrationEntity[]> {
    return Array.from(this.registrations.values()).filter((r) => r.eventId === eventId);
  }

  async countAttendees(eventId: string): Promise<number> {
    return Array.from(this.registrations.values()).filter(
      (r) => r.eventId === eventId && r.status === 'CONFIRMED',
    ).length;
  }

  async save(event: EventEntity): Promise<void> {
    this.events.set(event.id, event);
  }

  async update(event: EventEntity): Promise<void> {
    this.events.set(event.id, event);
  }

  async saveRegistration(registration: EventRegistrationEntity): Promise<void> {
    this.registrations.set(registration.id, registration);
  }

  async updateRegistration(registration: EventRegistrationEntity): Promise<void> {
    this.registrations.set(registration.id, registration);
  }
}

describe('Module Événements Citoyens (Events) - Conformité SOLID (Niveau 4)', () => {
  let repository: InMemoryEventRepository;
  let auditLogger: any;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    repository = new InMemoryEventRepository();
    auditLogger = { log: vi.fn().mockResolvedValue(undefined) };
    eventEmitter = new EventEmitter2();
    vi.spyOn(eventEmitter, 'emit');
  });

  describe('1. Domaine Pur : EventEntity & Invariants Temporels', () => {
    it('devrait instancier un événement valide avec ses invariants respectés', () => {
      const now = new Date();
      const inTwoHours = new Date(now.getTime() + 2 * 3600 * 1000);

      const event = EventEntity.create({
        id: 'event-1',
        communityId: 'community-calavi',
        organizerUserId: 'user-organizer-1',
        title: 'Opération Salubrité Zogbadjè',
        description: 'Nettoyage des caniveaux et reboisement communautaire.',
        location: 'Carrefour Tankpè, Abomey-Calavi',
        startsAt: now,
        endsAt: inTwoHours,
        maxAttendees: 50,
      });

      expect(event.id).toBe('event-1');
      expect(event.title).toBe('Opération Salubrité Zogbadjè');
      expect(event.status).toBe('SCHEDULED');
      expect(event.maxAttendees).toBe(50);
      expect(event.isFull(20)).toBe(false);
      expect(event.isFull(50)).toBe(true);
    });

    it('devrait rejeter un événement si la date de fin est antérieure ou égale à la date de début', () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 3600 * 1000);

      expect(() => {
        EventEntity.create({
          id: 'event-invalid',
          communityId: 'community-calavi',
          organizerUserId: 'user-organizer-1',
          title: 'Titre Valide',
          description: 'Description Valide',
          location: 'Lieu',
          startsAt: now,
          endsAt: earlier,
        });
      }).toThrow('La date de fin doit être strictement postérieure à la date de début.');
    });

    it('devrait rejeter un titre vide ou dépassant 200 caractères', () => {
      const now = new Date();
      const end = new Date(now.getTime() + 3600 * 1000);

      expect(() => {
        EventEntity.create({
          id: 'event-err',
          communityId: 'c-1',
          organizerUserId: 'u-1',
          title: '',
          description: 'Desc',
          location: 'Lieu',
          startsAt: now,
          endsAt: end,
        });
      }).toThrow("Le titre de l'événement est obligatoire.");

      expect(() => {
        EventEntity.create({
          id: 'event-err2',
          communityId: 'c-1',
          organizerUserId: 'u-1',
          title: 'a'.repeat(201),
          description: 'Desc',
          location: 'Lieu',
          startsAt: now,
          endsAt: end,
        });
      }).toThrow('Le titre de l\'événement ne doit pas dépasser 200 caractères.');
    });

    it('devrait permettre à l’organisateur ou à un privilégié d’annuler l’événement', () => {
      const now = new Date();
      const end = new Date(now.getTime() + 3600 * 1000);

      const event = EventEntity.create({
        id: 'event-cancel',
        communityId: 'c-1',
        organizerUserId: 'u-organizer',
        title: 'Atelier Citoyen',
        description: 'Desc',
        location: 'Lieu',
        startsAt: now,
        endsAt: end,
      });

      // Annulation non autorisée par un tiers
      expect(() => event.cancel('u-intruder', false)).toThrow(
        "Seul l'organisateur ou un responsable peut annuler cet événement.",
      );

      // Annulation autorisée par l'organisateur
      event.cancel('u-organizer', false);
      expect(event.status).toBe('CANCELLED');

      // Double annulation rejetée
      expect(() => event.cancel('u-organizer', false)).toThrow('Cet événement est déjà annulé.');
    });
  });

  describe('2. Cas d’Usage : CreateEventUseCase', () => {
    it('devrait créer un événement, émettre un domain event et journaliser l’audit', async () => {
      const useCase = new CreateEventUseCase(repository, auditLogger, eventEmitter);

      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + 7200 * 1000);

      const event = await useCase.execute({
        communityId: 'community-calavi',
        organizerUserId: 'user-organizer-1',
        title: 'Journée Civique de l’Arbre',
        description: 'Plantation de tecks et sensibilisation écologique.',
        location: 'Campus UAC',
        startsAt,
        endsAt,
        maxAttendees: 30,
      });

      expect(event.id).toBeDefined();
      expect(event.title).toBe('Journée Civique de l’Arbre');
      expect(repository.events.has(event.id)).toBe(true);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'event.created',
        expect.objectContaining({
          eventId: event.id,
          title: 'Journée Civique de l’Arbre',
        }),
      );

      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EVENT.CREATED',
          resourceId: event.id,
          actorId: 'user-organizer-1',
        }),
      );
    });
  });

  describe('3. Cas d’Usage : RegisterAttendeeUseCase', () => {
    it('devrait inscrire un citoyen à un événement ouvert', async () => {
      const event = EventEntity.create({
        id: 'event-reg-1',
        communityId: 'c-1',
        organizerUserId: 'u-org',
        title: 'Rassemblement',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        maxAttendees: 10,
      });
      await repository.save(event);

      const useCase = new RegisterAttendeeUseCase(repository, repository, auditLogger, eventEmitter);

      const registration = await useCase.execute({
        eventId: 'event-reg-1',
        userId: 'citizen-benoit',
      });

      expect(registration.id).toBeDefined();
      expect(registration.status).toBe('CONFIRMED');
      expect(await repository.countAttendees('event-reg-1')).toBe(1);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'event.attendee_registered',
        expect.objectContaining({
          eventId: 'event-reg-1',
          userId: 'citizen-benoit',
        }),
      );
    });

    it('devrait placer le citoyen en liste d’attente si l’événement a atteint sa capacité maximale', async () => {
      const event = EventEntity.create({
        id: 'event-full',
        communityId: 'c-1',
        organizerUserId: 'u-org',
        title: 'Atelier Limité',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        maxAttendees: 1,
      });
      await repository.save(event);

      const useCase = new RegisterAttendeeUseCase(repository, repository, auditLogger, eventEmitter);

      // 1er participant : CONFIRMED
      const reg1 = await useCase.execute({ eventId: 'event-full', userId: 'user-1' });
      expect(reg1.status).toBe('CONFIRMED');

      // 2ème participant : WAITLIST
      const reg2 = await useCase.execute({ eventId: 'event-full', userId: 'user-2' });
      expect(reg2.status).toBe('WAITLIST');
      expect(await repository.countAttendees('event-full')).toBe(1);
    });

    it('devrait rejeter une double inscription du même citoyen', async () => {
      const event = EventEntity.create({
        id: 'event-dup',
        communityId: 'c-1',
        organizerUserId: 'u-org',
        title: 'Atelier',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
      });
      await repository.save(event);

      const useCase = new RegisterAttendeeUseCase(repository, repository, auditLogger, eventEmitter);

      await useCase.execute({ eventId: 'event-dup', userId: 'user-dup' });

      await expect(
        useCase.execute({ eventId: 'event-dup', userId: 'user-dup' }),
      ).rejects.toThrow('Vous êtes déjà inscrit à cet événement.');
    });
  });

  describe('4. Cas d’Usage : CancelEventUseCase', () => {
    it('devrait permettre l’annulation et émettre l’événement d’annulation', async () => {
      const event = EventEntity.create({
        id: 'event-cancel-test',
        communityId: 'c-1',
        organizerUserId: 'u-org-1',
        title: 'Événement à annuler',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
      });
      await repository.save(event);

      const useCase = new CancelEventUseCase(repository, repository, auditLogger, eventEmitter);

      await useCase.execute({
        eventId: 'event-cancel-test',
        requesterUserId: 'u-org-1',
      });

      const updated = await repository.findById('event-cancel-test');
      expect(updated?.status).toBe('CANCELLED');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'event.cancelled',
        expect.objectContaining({
          eventId: 'event-cancel-test',
          cancelledByUserId: 'u-org-1',
        }),
      );
    });
  });

  describe('5. Requêtes : ListCommunityEventsQuery & GetEventDetailsQuery', () => {
    it('devrait lister les événements d’une communauté et filtrer par statut', async () => {
      const e1 = EventEntity.create({
        id: 'e-1',
        communityId: 'com-calavi',
        organizerUserId: 'u-1',
        title: 'Event 1',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
      });
      const e2 = EventEntity.create({
        id: 'e-2',
        communityId: 'com-calavi',
        organizerUserId: 'u-1',
        title: 'Event 2',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        status: 'COMPLETED',
      });
      await repository.save(e1);
      await repository.save(e2);

      const query = new ListCommunityEventsQuery(repository);

      const all = await query.execute({ communityId: 'com-calavi' });
      expect(all).toHaveLength(2);

      const scheduledOnly = await query.execute({ communityId: 'com-calavi', status: 'SCHEDULED' });
      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].id).toBe('e-1');
    });

    it('devrait renvoyer les détails d’un événement avec statut d’inscription citoyen', async () => {
      const event = EventEntity.create({
        id: 'e-details',
        communityId: 'com-1',
        organizerUserId: 'u-1',
        title: 'Grand Rassemblement',
        description: 'Desc',
        location: 'Lieu',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        maxAttendees: 100,
      });
      await repository.save(event);

      const reg = EventRegistrationEntity.create({
        id: 'reg-1',
        eventId: 'e-details',
        userId: 'citizen-nadine',
        status: 'CONFIRMED',
      });
      await repository.saveRegistration(reg);

      const query = new GetEventDetailsQuery(repository);

      const result = await query.execute({
        eventId: 'e-details',
        currentUserId: 'citizen-nadine',
      });

      expect(result.event.title).toBe('Grand Rassemblement');
      expect(result.attendeesCount).toBe(1);
      expect(result.userRegistrationStatus).toBe('CONFIRMED');

      const dto = EventMapper.toResponseDto(
        result.event,
        result.attendeesCount,
        result.userRegistrationStatus,
      );
      expect(dto.attendeesCount).toBe(1);
      expect(dto.userRegistrationStatus).toBe('CONFIRMED');
    });
  });
});
