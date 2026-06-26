import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { GratitudesController } from './gratitudes.controller';
import { GratitudesService } from './gratitudes.service';
import { CurrentRequest } from '../auth';
import { GetGratitudesDto } from './dto';
import { HeroesRadarDto } from './dto/heroes-radar.dto';
import { CountryDto } from './dto/country.dto';

const mockAdminUser = { id: 1, isAdmin: true, courses: {} } as Partial<
  CurrentRequest['user']
> as CurrentRequest['user'];
const mockNonAdminUser = {
  id: 2,
  isAdmin: false,
  courses: {},
} as Partial<CurrentRequest['user']> as CurrentRequest['user'];

const mockBadge = { id: 'Thank_you', name: 'Thank you' };

const mockHeroesRadarResult = {
  heroes: [],
  meta: { itemCount: 0, total: 0, current: 1, pageSize: 20, totalPages: 0 },
};

const mockService = {
  create: vi.fn(),
  getGratitudes: vi.fn(),
  getBadges: vi.fn(),
  getHeroesRadar: vi.fn(),
  getHeroesCountries: vi.fn(),
};

describe('GratitudesController', () => {
  let controller: GratitudesController;

  beforeEach(async () => {
    Object.values(mockService).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GratitudesController],
      providers: [{ provide: GratitudesService, useValue: mockService }],
    }).compile();

    controller = module.get<GratitudesController>(GratitudesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service.create with the current user and dto and returns nothing', async () => {
      const dto = { userIds: [3], courseId: 5, badgeId: 'Thank_you', comment: 'thanks' } as never;
      const req = { user: mockNonAdminUser } as CurrentRequest;
      mockService.create.mockResolvedValue(undefined);

      const result = await controller.create(req, dto);

      expect(mockService.create).toHaveBeenCalledWith(mockNonAdminUser, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('getGratitudes', () => {
    it('wraps the service result in a GetGratitudesDto', async () => {
      const query = { courseId: 5, pageSize: 10, current: 1 } as never;
      const serviceResult = { content: [], count: 0 };
      mockService.getGratitudes.mockResolvedValue(serviceResult);

      const result = await controller.getGratitudes(query);

      expect(mockService.getGratitudes).toHaveBeenCalledWith(query);
      expect(result).toBeInstanceOf(GetGratitudesDto);
      expect(result).toEqual({ content: [], count: 0 });
    });
  });

  describe('getBadges', () => {
    it('maps the service badges to BadgeDto using the current user and parsed courseId', async () => {
      const req = { user: mockNonAdminUser } as CurrentRequest;
      mockService.getBadges.mockReturnValue([mockBadge]);

      const result = await controller.getBadges(req, 7);

      expect(mockService.getBadges).toHaveBeenCalledWith(mockNonAdminUser, 7);
      expect(result).toEqual([mockBadge]);
    });

    it('returns an empty array when the service returns no badges', async () => {
      const req = { user: mockNonAdminUser } as CurrentRequest;
      mockService.getBadges.mockReturnValue([]);

      const result = await controller.getBadges(req, 7);

      expect(result).toEqual([]);
    });
  });

  describe('getHeroesRadar', () => {
    it('returns a HeroesRadarDto for a non-admin when no countryName is requested', async () => {
      const req = { user: mockNonAdminUser } as CurrentRequest;
      const query = { current: 1, pageSize: 20 } as never;
      mockService.getHeroesRadar.mockResolvedValue(mockHeroesRadarResult);

      const result = await controller.getHeroesRadar(req, query);

      expect(mockService.getHeroesRadar).toHaveBeenCalledWith(query);
      expect(result).toBeInstanceOf(HeroesRadarDto);
    });

    it('allows an admin to filter by countryName', async () => {
      const req = { user: mockAdminUser } as CurrentRequest;
      const query = { countryName: 'Poland', current: 1, pageSize: 20 } as never;
      mockService.getHeroesRadar.mockResolvedValue(mockHeroesRadarResult);

      const result = await controller.getHeroesRadar(req, query);

      expect(mockService.getHeroesRadar).toHaveBeenCalledWith(query);
      expect(result).toBeInstanceOf(HeroesRadarDto);
    });

    it('throws ForbiddenException when a non-admin filters by countryName', async () => {
      const req = { user: mockNonAdminUser } as CurrentRequest;
      const query = { countryName: 'Poland' } as never;

      await expect(controller.getHeroesRadar(req, query)).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockService.getHeroesRadar).not.toHaveBeenCalled();
    });
  });

  describe('getHeroesRadarCsv', () => {
    it('parses the radar content to csv and writes csv headers to the response', async () => {
      const query = { current: 1, pageSize: 20 } as never;
      mockService.getHeroesRadar.mockResolvedValue(mockHeroesRadarResult);
      const res = { setHeader: vi.fn(), end: vi.fn() };

      await controller.getHeroesRadarCsv(query, res as never);

      expect(mockService.getHeroesRadar).toHaveBeenCalledWith(query);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename=heroes-radar.csv');
      expect(res.end).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHeroesCountries', () => {
    it('maps each service country to a CountryDto', async () => {
      mockService.getHeroesCountries.mockResolvedValue([{ countryName: 'Poland' }, { countryName: 'Spain' }]);

      const result = await controller.getHeroesCountries();

      expect(mockService.getHeroesCountries).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CountryDto);
      expect(result.map(c => c.countryName)).toEqual(['Poland', 'Spain']);
    });

    it('returns an empty array when there are no countries', async () => {
      mockService.getHeroesCountries.mockResolvedValue([]);

      const result = await controller.getHeroesCountries();

      expect(result).toEqual([]);
    });
  });
});
