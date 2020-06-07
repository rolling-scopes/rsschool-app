import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { RepositoryEvent } from '../models';

@EntityRepository(RepositoryEvent)
export class RepositoryEventRepository extends AbstractRepository<RepositoryEvent> {
  public async save(events: Pick<RepositoryEvent, 'repositoryUrl' | 'action' | 'githubId'>[]): Promise<void> {
    await getRepository(RepositoryEvent).save(events);
  }
}
