import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mocked } from 'vitest';
import { Prompt } from '@entities/prompt';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

const mockId = 1;
const mockPrompt = { id: mockId, type: 'system', text: 'Hello', temperature: 0.5 } as Partial<Prompt> as Prompt;

describe('PromptsService', () => {
  let service: PromptsService;
  let repository: Mocked<Repository<Prompt>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptsService,
        {
          provide: getRepositoryToken(Prompt),
          useValue: {
            find: vi.fn(),
            findOneByOrFail: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PromptsService>(PromptsService);
    repository = module.get(getRepositoryToken(Prompt));
  });

  describe('create', () => {
    it('should save only text/type/temperature and return the freshly fetched prompt', async () => {
      const dto = { text: 'Hello', type: 'system', temperature: 0.5 } as CreatePromptDto;
      repository.save.mockResolvedValue({ id: mockId } as Prompt);
      repository.findOneByOrFail.mockResolvedValue(mockPrompt);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith({ text: 'Hello', type: 'system', temperature: 0.5 });
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockId });
      expect(result).toEqual(mockPrompt);
    });
  });

  describe('findAll', () => {
    it('should return all prompts', async () => {
      const items = [mockPrompt, mockPrompt];
      repository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toEqual(items);
    });

    it('should return an empty array when there are no prompts', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the prompt and return the freshly fetched entity', async () => {
      const dto = { text: 'Updated' } as UpdatePromptDto;
      repository.findOneByOrFail.mockResolvedValue(mockPrompt);

      const result = await service.update(mockId, dto);

      expect(repository.update).toHaveBeenCalledWith(mockId, dto);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockId });
      expect(result).toEqual(mockPrompt);
    });
  });

  describe('remove', () => {
    it('should hard-delete the prompt by id', async () => {
      await service.remove(mockId);

      expect(repository.delete).toHaveBeenCalledWith(mockId);
    });
  });
});
