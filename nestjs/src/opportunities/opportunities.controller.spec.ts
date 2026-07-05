import type { Mocked } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Resume } from '@entities/resume';
import { Student } from '@entities/student';
import { Feedback } from '@entities/feedback';
import { StudentFeedback } from '@entities/student-feedback';
import { CurrentRequest } from 'src/auth';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { ConsentDto } from './dto/consent.dto';
import { GiveConsentDto } from './dto/give-consent-dto';
import { StatusDto } from './dto/status.dto';
import { VisibilityDto } from './dto/visibility.dto';
import { ResumeDto } from './dto/resume.dto';
import { ApplicantResumeDto } from './dto/applicant-resume.dto';

const mockResume = {
  uuid: 'uuid-1',
  userId: 7,
  visibleCourses: [],
  avatarLink: null,
  desiredPosition: 'FE',
  email: null,
  englishLevel: null,
  expires: 123,
  fullTime: true,
  githubUsername: 'john',
  linkedin: null,
  locations: null,
  militaryService: null,
  name: 'John',
  notes: null,
  phone: null,
  selfIntroLink: null,
  skype: null,
  startFrom: null,
  telegram: null,
  website: null,
} as Partial<Resume> as Resume;

const resumeData = {
  resume: mockResume,
  students: [] as Student[],
  gratitudes: [] as Feedback[],
  feedbacks: [] as StudentFeedback[],
};

const makeReq = (githubId: string) => ({ user: { githubId } }) as CurrentRequest;

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;
  let service: Mocked<OpportunitiesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: {
            getResumeByGithubId: vi.fn(),
            getResumeByUuid: vi.fn(),
            saveResume: vi.fn(),
            getConsent: vi.fn(),
            createConsent: vi.fn(),
            deleteConsent: vi.fn(),
            prolong: vi.fn(),
            setVisibility: vi.fn(),
            getApplicantResumes: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(OpportunitiesController);
    service = module.get(OpportunitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getResume', () => {
    it('throws ForbiddenException when accessing another user resume', async () => {
      await expect(controller.getResume(makeReq('owner'), 'someone-else')).rejects.toThrow(ForbiddenException);
      expect(service.getResumeByGithubId).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when service returns null', async () => {
      service.getResumeByGithubId.mockResolvedValue(null);

      await expect(controller.getResume(makeReq('john'), 'john')).rejects.toThrow(NotFoundException);
    });

    it('returns a ResumeDto built from service data', async () => {
      service.getResumeByGithubId.mockResolvedValue(resumeData);

      const result = await controller.getResume(makeReq('john'), 'john');

      expect(service.getResumeByGithubId).toHaveBeenCalledWith('john');
      expect(result).toBeInstanceOf(ResumeDto);
      expect(result.uuid).toBe('uuid-1');
    });
  });

  describe('saveResume', () => {
    it('throws ForbiddenException for a foreign githubId', async () => {
      await expect(controller.saveResume(makeReq('owner'), 'other', {} as never)).rejects.toThrow(ForbiddenException);
      expect(service.saveResume).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when service returns null', async () => {
      service.saveResume.mockResolvedValue(null);

      await expect(controller.saveResume(makeReq('john'), 'john', {} as never)).rejects.toThrow(NotFoundException);
    });

    it('returns the saved resume', async () => {
      const dto = { name: 'Updated' } as never;
      service.saveResume.mockResolvedValue(mockResume);

      const result = await controller.saveResume(makeReq('john'), 'john', dto);

      expect(service.saveResume).toHaveBeenCalledWith('john', dto);
      expect(result).toBe(mockResume);
    });
  });

  describe('getConsent', () => {
    it('returns a ConsentDto wrapping the service value', async () => {
      service.getConsent.mockResolvedValue(true);

      const result = await controller.getConsent(makeReq('john'));

      expect(service.getConsent).toHaveBeenCalledWith('john');
      expect(result).toBeInstanceOf(ConsentDto);
      expect(result.consent).toBe(true);
    });

    it('returns ConsentDto(false) when consent is false', async () => {
      service.getConsent.mockResolvedValue(false);

      const result = await controller.getConsent(makeReq('john'));

      expect(result.consent).toBe(false);
    });
  });

  describe('createConsent', () => {
    it('returns a GiveConsentDto with consent and expires', async () => {
      service.createConsent.mockResolvedValue({ consent: true, expires: 999 });

      const result = await controller.createConsent(makeReq('john'));

      expect(service.createConsent).toHaveBeenCalledWith('john');
      expect(result).toBeInstanceOf(GiveConsentDto);
      expect(result).toEqual({ consent: true, expires: 999 });
    });
  });

  describe('deleteConsent', () => {
    it('returns a ConsentDto with the deletion result', async () => {
      service.deleteConsent.mockResolvedValue(false);

      const result = await controller.deleteConsent(makeReq('john'));

      expect(service.deleteConsent).toHaveBeenCalledWith('john');
      expect(result).toBeInstanceOf(ConsentDto);
      expect(result.consent).toBe(false);
    });
  });

  describe('prolong', () => {
    it('returns a StatusDto with new expiration', async () => {
      service.prolong.mockResolvedValue(555);

      const result = await controller.prolong(makeReq('john'));

      expect(service.prolong).toHaveBeenCalledWith('john');
      expect(result).toBeInstanceOf(StatusDto);
      expect(result.expires).toBe(555);
    });
  });

  describe('setVisibility', () => {
    it('inverts isHidden before calling the service and wraps the result', async () => {
      service.setVisibility.mockResolvedValue(true);

      const result = await controller.setVisibility(makeReq('john'), false);

      // controller passes !isHidden as the "isVisible" flag
      expect(service.setVisibility).toHaveBeenCalledWith('john', true);
      expect(result).toBeInstanceOf(VisibilityDto);
      expect(result.isHidden).toBe(true);
    });

    it('passes isVisible=false when isHidden=true', async () => {
      service.setVisibility.mockResolvedValue(false);

      const result = await controller.setVisibility(makeReq('john'), true);

      expect(service.setVisibility).toHaveBeenCalledWith('john', false);
      expect(result.isHidden).toBe(false);
    });
  });

  describe('getPublicResume', () => {
    it('throws NotFoundException when service returns null', async () => {
      service.getResumeByUuid.mockResolvedValue(null);

      await expect(controller.getPublicResume('uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('returns a ResumeDto for the public resume', async () => {
      service.getResumeByUuid.mockResolvedValue(resumeData);

      const result = await controller.getPublicResume('uuid-1');

      expect(service.getResumeByUuid).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeInstanceOf(ResumeDto);
    });
  });

  describe('getApplicants', () => {
    it('maps each applicant resume into an ApplicantResumeDto', async () => {
      const applicant = { ...mockResume, user: { githubId: 'john' } } as Partial<Resume> as Resume;
      service.getApplicantResumes.mockResolvedValue([applicant]);

      const result = await controller.getApplicants();

      expect(service.getApplicantResumes).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ApplicantResumeDto);
      expect(result[0].githubId).toBe('john');
    });

    it('returns an empty array when there are no applicants', async () => {
      service.getApplicantResumes.mockResolvedValue([]);

      const result = await controller.getApplicants();

      expect(result).toEqual([]);
    });
  });
});
