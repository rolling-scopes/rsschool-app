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

  public getAll() {
    return this.repository.find();
  }

  public create(data: CreateDiscordServerDto) {
    return this.repository.save(data);
  }

  public update(id: number, data: UpdateDiscordServerDto) {
    return this.repository.save({ id, ...data });
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
