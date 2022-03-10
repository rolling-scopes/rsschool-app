import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordServer } from '@entities/discordServer';
import { CreateDiscordServerDto, UpdateDiscordServerDto } from './dto';

@Injectable()
export class DiscordServersService {
  constructor(
    @InjectRepository(DiscordServer)
    private repository: Repository<DiscordServer>,
  ) {}

  public async getById(id: number) {
    return this.repository.findOne(id);
  }

  public async getAll() {
    return this.repository.find();
  }

  public async create(data: CreateDiscordServerDto) {
    const { id } = await this.repository.save(data);
    return this.getById(id);
  }

  public async update(id: number, data: UpdateDiscordServerDto) {
    await this.repository.update(id, data);
    return this.getById(id);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
