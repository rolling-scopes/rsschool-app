import { Prompt } from '@entities/prompt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
  ) {}

  public async create(dto: CreatePromptDto) {
    const { text, type, temperature } = dto;
    const { id } = await this.promptsRepository.save({ text, type, temperature });
    return this.promptsRepository.findOneByOrFail({ id });
  }

  public async findAll(): Promise<Prompt[]> {
    const items = await this.promptsRepository.find();
    return items;
  }

  public async update(id: number, dto: UpdatePromptDto) {
    await this.promptsRepository.update(id, dto);
    return this.promptsRepository.findOneByOrFail({ id });
  }

  public async remove(id: number) {
    await this.promptsRepository.delete(id);
  }
}
