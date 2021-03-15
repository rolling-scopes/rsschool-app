import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { Student, User } from '../models';

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  public async findByStudentIds(studentIds: number[]): Promise<{ studentId: number; githubId: string }[]> {
    if (!studentIds || studentIds.length === 0) {
      return [];
    }
    const data = await getRepository(Student)
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')
      .addSelect(['s.id', 'u.githubId'])
      .where('s.id IN (:...ids)', { ids: studentIds })
      .getMany();

    return data.map(s => ({
      studentId: s.id,
      githubId: s.user.githubId,
    }));
  }
}
