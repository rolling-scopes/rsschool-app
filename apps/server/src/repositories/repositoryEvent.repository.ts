import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { RepositoryEvent, User } from '../models';

@EntityRepository(RepositoryEvent)
export class RepositoryEventRepository extends AbstractRepository<RepositoryEvent> {
  public async save(events: Pick<RepositoryEvent, 'repositoryUrl' | 'action' | 'githubId'>[]): Promise<void> {
    const repository = getRepository(RepositoryEvent);
    const userRepository = getRepository(User);
    const cache = new Map<string, number>();

    for (const event of events) {
      let userId: number | undefined;
      if (cache.has(event.githubId)) {
        userId = cache.get(event.githubId);
      } else {
        const [user] = await userRepository.find({
          select: ['id', 'githubId'],
          where: { githubId: event.githubId },
        });
        userId = user?.id;
        cache.set(event.githubId, userId);
      }
      await repository.save({ ...event, userId });
    }
  }
}
