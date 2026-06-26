import { Test, TestingModule } from '@nestjs/testing';
import { Event } from '@entities/event';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, EventDto, UpdateEventDto } from './dto';

const mockId = 1;

const mockEvent = {
  id: mockId,
  name: 'Event 1',
  descriptionUrl: 'http://example.com',
  description: 'desc',
  type: 'lecture',
  discipline: null,
} as Partial<Event> as Event;

const mockFindAll = vi.fn(() => Promise.resolve([mockEvent, mockEvent]));
const mockCreate = vi.fn(() => Promise.resolve(mockEvent));
const mockUpdate = vi.fn(() => Promise.resolve(mockEvent));
const mockRemove = vi.fn(() => Promise.resolve());

const mockEventsServiceFactory = vi.fn(() => ({
  findAll: mockFindAll,
  create: mockCreate,
  update: mockUpdate,
  remove: mockRemove,
}));

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useFactory: mockEventsServiceFactory }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  describe('findAll', () => {
    it('should get all events mapped to EventDto', async () => {
      const result = await controller.findAll();

      expect(mockFindAll).toHaveBeenCalled();
      expect(result).toEqual([new EventDto(mockEvent), new EventDto(mockEvent)]);
    });
  });

  describe('create', () => {
    it('should create a new event and wrap it in an EventDto', async () => {
      const mockCreateEventDto = new CreateEventDto();

      const result = await controller.create(mockCreateEventDto);

      expect(mockCreate).toHaveBeenCalledWith(mockCreateEventDto);
      expect(result).toEqual(new EventDto(mockEvent));
    });
  });

  describe('update', () => {
    it('should update an event and wrap it in an EventDto', async () => {
      const mockUpdateEventDto = new UpdateEventDto();

      const result = await controller.update(mockId, mockUpdateEventDto);

      expect(mockUpdate).toHaveBeenCalledWith(mockId, mockUpdateEventDto);
      expect(result).toEqual(new EventDto(mockEvent));
    });
  });

  describe('delete', () => {
    it('should remove an event by id', async () => {
      await controller.delete(mockId);

      expect(mockRemove).toHaveBeenCalledWith(mockId);
    });
  });
});
