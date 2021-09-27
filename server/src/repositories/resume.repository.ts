import { AbstractRepository, EntityRepository } from 'typeorm';
import { Resume, User } from '../models';

@EntityRepository(Resume)
export class ResumeRepository extends AbstractRepository<Resume> {
  public async find(githubId: string) {
    const resume = await this.repository.findOne({
      where: {
        githubId,
      },
    });
    return resume;
  }

  public async save(githubId: string, data: Partial<Resume>) {
    return this.repository.save({
      ...data,
      githubId: githubId,
    });
  }

  public async create(githubId: string) {
    const created = this.repository.create({ githubId });
    return this.save(githubId, created);
  }

  public async delete(githubId: string) {
    return this.repository.delete({ githubId });
  }

  public async findActive(visibleOnly: boolean) {
    const currentTimestamp = new Date().getTime();
    const resumeQuery = this.createQueryBuilder('cv')
      .select([
        'cv.name',
        'cv.githubId',
        'cv.desiredPosition',
        'cv.englishLevel',
        'cv.fullTime',
        'cv.locations',
        'cv.startFrom',
        'cv.expires',
        'cv.isHidden',
      ])
      .leftJoin(User, 'user', 'cv.githubId = user.githubId')
      .where('user.opportunitiesConsent = true')
      .andWhere('cv.expires >= :currentTimestamp', { currentTimestamp });

    if (visibleOnly) {
      resumeQuery.andWhere('cv.isHidden = false');
    }

    const data = await resumeQuery.getMany();

    return data;
  }
}
