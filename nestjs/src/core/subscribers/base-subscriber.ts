import { EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { History } from '@entities/history';

export class BaseSubscriber implements EntitySubscriberInterface {
  async afterInsert?(event: InsertEvent<{ id: number }>): Promise<void> {
    await event.manager.save(
      History,
      {
        event: event.metadata.tableName,
        entityId: event.entity.id,
        update: event.entity,
        operation: 'insert',
      },
      {
        listeners: false,
      },
    );
  }

  async beforeUpdate?(event: UpdateEvent<{ id: number }>): Promise<void> {
    if (!event.entity) return;

    const old = await event.manager.findOne(event.metadata.target, event.entity.id);

    await event.manager.save(
      History,
      {
        event: event.metadata.tableName,
        update: event.entity,
        entityId: old.id,
        previous: old,
        operation: 'update',
      },
      {
        listeners: false,
      },
    );
  }

  async afterRemove?(event: RemoveEvent<{ id: number }>): Promise<void> {
    if (!event.entity) return;
    const old = await event.manager.findOne<{ id: number }>(event.metadata.target, event.entity.id);

    await event.manager.save(
      History,
      {
        event: event.metadata.tableName,
        operation: 'remove',
        entityId: old?.id,
        update: event.entity,
        previous: old,
      },
      {
        listeners: false,
      },
    );
  }
}
