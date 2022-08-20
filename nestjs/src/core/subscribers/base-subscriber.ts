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
    if (!event.entity || !event.entity.id) {
      console.warn('subscriber missing entity id');
      return;
    }

    const old = await event.manager.findOneBy(event.metadata.target, { id: event.entity.id });
    if (!old) {
      return;
    }
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

  async beforeRemove?(event: RemoveEvent<{ id: number }>): Promise<void> {
    if (!event.entity) return;

    const entityId = event.entity.id ?? event.entityId;
    if (!entityId) {
      console.warn('subscriber missing entity id');
      return;
    }

    const old = await event.manager.findOneBy<{ id: number }>(event.metadata.target, { id: entityId });

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
