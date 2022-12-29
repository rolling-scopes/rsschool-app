import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeamDistributionService {
  constructor(
    @InjectRepository(TeamDistribution)
    private repository: Repository<TeamDistribution>,
  ) {}

  public async create(data: Partial<TeamDistribution>) {
    return this.repository.save(data);
  }

  // findAll() {
  //   return `This action returns all teamDistribution`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} teamDistribution`;
  // }

  // update(id: number, updateTeamDistributionDto: UpdateTeamDistributionDto) {
  //   return `This action updates a #${id} teamDistribution`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} teamDistribution`;
  // }
}
