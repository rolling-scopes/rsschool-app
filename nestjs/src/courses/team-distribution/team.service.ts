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

  public async findByDistributionId(distributionId: number) {
    const data = await this.repository.find({
      where: { teamDistributionId: distributionId },
      order: {
        id: 'ASC',
      },
    });
    return data;
  }

  public async create(data: Partial<Team>) {
    const team = await this.repository.save({ ...data, password: this.generatePassword() });
    return this.repository.findOneOrFail({ where: { id: team.id }, relations: ['students'] });
  }
}
