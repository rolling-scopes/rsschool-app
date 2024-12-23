import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContributorDto, UpdateContributorDto } from './dto';
import { Contributor } from '@entities/contributor';

@Injectable()
export class ContributorsService {
  constructor(
    @InjectRepository(Contributor)
    private repository: Repository<Contributor>,
  ) {}

  public async getAll() {
    return this.repository.find({ relations: ['user'] });
  }

  public async getById(id: number) {
    return this.repository.findOneOrFail({
      where: { id },
      relations: ['user'],
    });
  }

  public async create(data: CreateContributorDto) {
    const { id } = await this.repository.save(data);
    return this.getById(id);
  }

  public async update(id: number, data: UpdateContributorDto) {
    await this.repository.update(id, data);
    return this.getById(id);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}
