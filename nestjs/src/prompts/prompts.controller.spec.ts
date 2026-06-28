import { Test, TestingModule } from '@nestjs/testing';
import { Prompt } from '@entities/prompt';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';
import { CreatePromptDto, PromptDto, UpdatePromptDto } from './dto';

const mockId = 1;

const mockPrompt = { id: mockId, type: 'system', text: 'Hello', temperature: 0.5 } as Partial<Prompt> as Prompt;

const mockCreate = vi.fn(() => Promise.resolve(mockPrompt));
const mockFindAll = vi.fn(() => Promise.resolve([mockPrompt, mockPrompt]));
const mockRemove = vi.fn(() => Promise.resolve());
const mockUpdate = vi.fn(() => Promise.resolve(mockPrompt));

const mockPromptsServiceFactory = vi.fn(() => ({
  create: mockCreate,
  findAll: mockFindAll,
  remove: mockRemove,
  update: mockUpdate,
}));

describe('PromptsController', () => {
  let controller: PromptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptsController],
      providers: [{ provide: PromptsService, useFactory: mockPromptsServiceFactory }],
    }).compile();

    controller = module.get<PromptsController>(PromptsController);
  });

  describe('create', () => {
    it('should create a prompt and wrap it in a PromptDto', async () => {
      const dto = new CreatePromptDto();

      const result = await controller.create(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(new PromptDto(mockPrompt));
    });
  });

  describe('getAll', () => {
    it('should get all prompts mapped to PromptDto', async () => {
      const result = await controller.getAll();

      expect(mockFindAll).toHaveBeenCalled();
      expect(result).toEqual([new PromptDto(mockPrompt), new PromptDto(mockPrompt)]);
    });
  });

  describe('remove', () => {
    it('should remove a prompt by id', async () => {
      await controller.remove(mockId);

      expect(mockRemove).toHaveBeenCalledWith(mockId);
    });
  });

  describe('update', () => {
    it('should update a prompt and wrap it in a PromptDto', async () => {
      const dto = new UpdatePromptDto();

      const result = await controller.update(mockId, dto);

      expect(mockUpdate).toHaveBeenCalledWith(mockId, dto);
      expect(result).toEqual(new PromptDto(mockPrompt));
    });
  });
});
