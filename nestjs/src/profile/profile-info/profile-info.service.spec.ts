import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProfileInfoService } from './profile-info.service';

// Fixtures mirrored from server/src/routes/profile/__test__/info.test.ts to prove business-logic equivalence
const mockUserInfo = { generalInfo: { githubId: 'john-doe' }, contacts: { email: 'x' }, discord: null };
const mockSession = (overrides = {}) =>
  ({ id: 1, githubId: 'viewer', isAdmin: false, isHirer: false, courses: {}, ...overrides }) as never;

describe('ProfileInfoService.getProfileInfo orchestration', () => {
  let service: ProfileInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileInfoService, { provide: DataSource, useValue: {} }],
    }).compile();

    service = module.get(ProfileInfoService);

    vi.spyOn(service, 'getUserInfo').mockResolvedValue(mockUserInfo as never);
    vi.spyOn(service, 'getPublicFeedback').mockResolvedValue(['feedback'] as never);
    vi.spyOn(service, 'getMentorStats').mockResolvedValue(['mentorStats'] as never);
    vi.spyOn(service, 'getStudentStats').mockResolvedValue(['studentStats'] as never);
    vi.spyOn(service, 'getStageInterviewFeedback').mockResolvedValue(['stageFeedback'] as never);
    vi.spyOn(service, 'getConfigurableProfilePermissions').mockResolvedValue({});
    vi.spyOn(service, 'getRelationsRoles').mockResolvedValue(null);
    vi.spyOn(service, 'getStudentCourses').mockResolvedValue([]);
    vi.spyOn(service, 'getMentorCourses').mockResolvedValue(null);
  });

  it('returns own profile with permission settings, without own stage interview feedback', async () => {
    const result = await service.getProfileInfo(mockSession({ githubId: 'john-doe' }), undefined);

    expect(result.permissionsSettings).toBeDefined();
    expect(result.generalInfo).toEqual(mockUserInfo.generalInfo);
    expect(result.publicFeedback).toEqual(['feedback']);
    expect(result.mentorStats).toEqual(['mentorStats']);
    expect(result.studentStats).toEqual(['studentStats']);
    // own stage interview feedback is never visible
    expect(result.stageInterviewFeedback).toBeUndefined();
    expect(service.getStageInterviewFeedback).not.toHaveBeenCalled();
  });

  it('responds 403 for a stranger when profile is not visible', async () => {
    await expect(service.getProfileInfo(mockSession({ githubId: 'viewer' }), 'john-doe')).rejects.toThrow(
      ForbiddenException,
    );
    expect(service.getUserInfo).not.toHaveBeenCalled();
  });

  it('returns everything for an admin viewing another profile', async () => {
    const result = await service.getProfileInfo(mockSession({ githubId: 'viewer', isAdmin: true }), 'john-doe');

    expect(result.permissionsSettings).toBeUndefined();
    expect(result.publicFeedback).toEqual(['feedback']);
    expect(result.mentorStats).toEqual(['mentorStats']);
    expect(result.studentStats).toEqual(['studentStats']);
    expect(result.stageInterviewFeedback).toEqual(['stageFeedback']);
  });
});
