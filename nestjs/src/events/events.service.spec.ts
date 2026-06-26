import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mocked } from 'vitest';
import { Event } from '@entities/event';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';

const mockId = 1;
const mockEvent = { id: mockId, name: 'Event 1' } as Partial<Event> as Event;
const mockFindResponse = [mockEvent, mockEvent];

describe('EventsService', () => {
  let service: EventsService;
  let repository: Mocked<Repository<Event>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
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

    service = module.get<EventsService>(EventsService);
    repository = module.get(getRepositoryToken(Event));
  });

  describe('findAll', () => {
    it('should return all events ordered by updatedDate DESC with discipline relation', async () => {
      repository.find.mockResolvedValue(mockFindResponse);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { updatedDate: 'DESC' },
        relations: ['discipline'],
      });
      expect(result).toEqual(mockFindResponse);
    });

    it('should return an empty array when there are no events', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should save and return the event', async () => {
      const mockData = { name: 'Event 1' } as CreateEventDto;
      repository.save.mockResolvedValue(mockEvent);

      const result = await service.create(mockData);

      expect(repository.save).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update the event and return the freshly fetched entity', async () => {
      const mockData = { name: 'Updated' } as UpdateEventDto;
      repository.findOneByOrFail.mockResolvedValue(mockEvent);

      const result = await service.update(mockId, mockData);

      expect(repository.update).toHaveBeenCalledWith(mockId, mockData);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockId });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('remove', () => {
    it('should hard-delete the event by id', async () => {
      await service.remove(mockId);

      expect(repository.delete).toHaveBeenCalledWith(mockId);
    });
  });
});
