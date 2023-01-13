import { Team } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private repository: Repository<Team>,
  ) {}

  private generatePassword(length = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  public async create(data: Partial<Team>) {
    if (data.students?.length) {
      const [lead] = data.students.sort();
      data.teamLeadId = lead?.id;
    }
    const team = await this.repository.save({ ...data, password: this.generatePassword() });

    return this.repository
      .createQueryBuilder('team')
      .where({ id: team.id })
      .leftJoinAndSelect('team.students', 's')
      .leftJoinAndSelect('s.user', 'u')
      .getOneOrFail();
  }

  public async findById(id: number) {
    return this.repository.findOneByOrFail({ id });
  }
}
