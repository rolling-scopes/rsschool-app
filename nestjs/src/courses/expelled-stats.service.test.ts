import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CourseLeaveSurveyResponse } from '@entities/index';
import { ExpelledStatsService } from './expelled-stats.service';

const mockSurvey = { id: '1', courseId: 1 } as CourseLeaveSurveyResponse;

const mockFindResponse = [mockSurvey];
const mockDeleteResponse = { affected: 1 };
const mockCreateResponse = mockSurvey;
const mockSaveResponse = mockSurvey;

const mockFind = jest.fn(() => Promise.resolve(mockFindResponse));
const mockDelete = jest.fn(() => Promise.resolve(mockDeleteResponse));
const mockCreate = jest.fn(() => mockCreateResponse);
const mockSave = jest.fn(() => Promise.resolve(mockSaveResponse));

const mockSurveyRepositoryFactory = () => ({
  find: mockFind,
  delete: mockDelete,
  create: mockCreate,
  save: mockSave,
});

describe('ExpelledStatsService', () => {
  let service: ExpelledStatsService;
  let repository: Repository<CourseLeaveSurveyResponse>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpelledStatsService,
        {
          provide: getRepositoryToken(CourseLeaveSurveyResponse),
          useFactory: mockSurveyRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<ExpelledStatsService>(ExpelledStatsService);
    repository = module.get<Repository<CourseLeaveSurveyResponse>>(getRepositoryToken(CourseLeaveSurveyResponse));
  });

  describe('findAll', () => {
    it('should return all expelled stats', async () => {
      const result = await service.findAll();

      expect(result).toEqual(mockFindResponse);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['user', 'course'],
      });
    });
  });

  describe('findByCourseId', () => {
    it('should return expelled stats for a course', async () => {
      const courseId = 7;
      const result = await service.findByCourseId(courseId);

      expect(result).toEqual(mockFindResponse);
      expect(repository.find).toHaveBeenCalledWith({
        where: { courseId },
        relations: ['user', 'course'],
      });
    });
  });

  describe('remove', () => {
    it('should delete expelled stat by id', async () => {
      await service.remove('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw when stat is not found', async () => {
      mockDelete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitLeaveSurvey', () => {
    it('should create and save survey response', async () => {
      const result = await service.submitLeaveSurvey(10, 20, ['reason'], 'note');

      expect(result).toEqual(mockSaveResponse);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 10,
        courseId: 20,
        reasonForLeaving: ['reason'],
        otherComment: 'note',
        submittedAt: expect.any(Date),
      });
      expect(repository.save).toHaveBeenCalledWith(mockCreateResponse);
    });
  });
});
