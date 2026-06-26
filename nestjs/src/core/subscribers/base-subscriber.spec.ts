import { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { History } from '@entities/history';
import { BaseSubscriber } from './base-subscriber';

type MockManager = {
  save: ReturnType<typeof vi.fn>;
  findOneBy: ReturnType<typeof vi.fn>;
};

const buildManager = (): MockManager => ({
  save: vi.fn().mockResolvedValue(undefined),
  findOneBy: vi.fn(),
});

const TARGET = class CourseEvent {};

const buildMetadata = () => ({ tableName: 'course_event', target: TARGET });

describe('BaseSubscriber', () => {
  let subscriber: BaseSubscriber;
  let manager: MockManager;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    subscriber = new BaseSubscriber();
    manager = buildManager();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('afterInsert', () => {
    it('saves an insert History record from the inserted entity', async () => {
      const entity = { id: 7, name: 'Demo' };
      const event = {
        manager,
        metadata: buildMetadata(),
        entity,
      } as unknown as InsertEvent<{ id: number }>;

      await subscriber.afterInsert!(event);

      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenCalledWith(
        History,
        {
          event: 'course_event',
          entityId: 7,
          update: entity,
          operation: 'insert',
        },
        { listeners: false },
      );
    });
  });

  describe('beforeUpdate', () => {
    it('warns and returns when there is no entity', async () => {
      const event = {
        manager,
        metadata: buildMetadata(),
        entity: undefined,
      } as unknown as UpdateEvent<{ id: number }>;

      await subscriber.beforeUpdate!(event);

      expect(warnSpy).toHaveBeenCalledWith('subscriber missing entity id');
      expect(manager.findOneBy).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('warns and returns when the entity has no id', async () => {
      const event = {
        manager,
        metadata: buildMetadata(),
        entity: { name: 'no id' },
      } as unknown as UpdateEvent<{ id: number }>;

      await subscriber.beforeUpdate!(event);

      expect(warnSpy).toHaveBeenCalledWith('subscriber missing entity id');
      expect(manager.findOneBy).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('returns without saving when the previous record is not found', async () => {
      manager.findOneBy.mockResolvedValue(null);
      const event = {
        manager,
        metadata: buildMetadata(),
        entity: { id: 3 },
      } as unknown as UpdateEvent<{ id: number }>;

      await subscriber.beforeUpdate!(event);

      expect(manager.findOneBy).toHaveBeenCalledWith(TARGET, { id: 3 });
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('saves an update History record with the previous and new state', async () => {
      const old = { id: 3, name: 'old' };
      const entity = { id: 3, name: 'new' };
      manager.findOneBy.mockResolvedValue(old);
      const event = {
        manager,
        metadata: buildMetadata(),
        entity,
      } as unknown as UpdateEvent<{ id: number }>;

      await subscriber.beforeUpdate!(event);

      expect(manager.save).toHaveBeenCalledWith(
        History,
        {
          event: 'course_event',
          update: entity,
          entityId: 3,
          previous: old,
          operation: 'update',
        },
        { listeners: false },
      );
    });
  });

  describe('beforeRemove', () => {
    it('returns silently when there is no entity', async () => {
      const event = {
        manager,
        metadata: buildMetadata(),
        entity: undefined,
        entityId: 9,
      } as unknown as RemoveEvent<{ id: number }>;

      await subscriber.beforeRemove!(event);

      expect(warnSpy).not.toHaveBeenCalled();
      expect(manager.findOneBy).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('warns and returns when neither entity.id nor event.entityId is set', async () => {
      const event = {
        manager,
        metadata: buildMetadata(),
        entity: { name: 'no id' },
        entityId: undefined,
      } as unknown as RemoveEvent<{ id: number }>;

      await subscriber.beforeRemove!(event);

      expect(warnSpy).toHaveBeenCalledWith('subscriber missing entity id');
      expect(manager.findOneBy).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('uses entity.id and saves a remove History record', async () => {
      const old = { id: 5, name: 'old' };
      const entity = { id: 5, name: 'removed' };
      manager.findOneBy.mockResolvedValue(old);
      const event = {
        manager,
        metadata: buildMetadata(),
        entity,
        entityId: 99,
      } as unknown as RemoveEvent<{ id: number }>;

      await subscriber.beforeRemove!(event);

      // entity.id takes precedence over event.entityId.
      expect(manager.findOneBy).toHaveBeenCalledWith(TARGET, { id: 5 });
      expect(manager.save).toHaveBeenCalledWith(
        History,
        {
          event: 'course_event',
          operation: 'remove',
          entityId: 5,
          update: entity,
          previous: old,
        },
        { listeners: false },
      );
    });

    it('falls back to event.entityId when entity.id is missing', async () => {
      const old = { id: 12 };
      manager.findOneBy.mockResolvedValue(old);
      const entity = { name: 'removed' };
      const event = {
        manager,
        metadata: buildMetadata(),
        entity,
        entityId: 12,
      } as unknown as RemoveEvent<{ id: number }>;

      await subscriber.beforeRemove!(event);

      expect(manager.findOneBy).toHaveBeenCalledWith(TARGET, { id: 12 });
      expect(manager.save).toHaveBeenCalledWith(
        History,
        expect.objectContaining({ entityId: 12, operation: 'remove' }),
        { listeners: false },
      );
    });

    it('saves with undefined entityId when the previous record is not found', async () => {
      manager.findOneBy.mockResolvedValue(null);
      const entity = { id: 8 };
      const event = {
        manager,
        metadata: buildMetadata(),
        entity,
        entityId: 8,
      } as unknown as RemoveEvent<{ id: number }>;

      await subscriber.beforeRemove!(event);

      expect(manager.save).toHaveBeenCalledWith(
        History,
        {
          event: 'course_event',
          operation: 'remove',
          entityId: undefined,
          update: entity,
          previous: null,
        },
        { listeners: false },
      );
    });
  });
});
