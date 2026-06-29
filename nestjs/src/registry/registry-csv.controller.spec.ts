import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';

// Same export rows as in registry-export.service.spec.ts
const exportRows = [
  {
    id: 1,
    englishMentoring: true,
    languagesMentoring: ['en', 'ru'],
    githubId: 'mentor-john',
    primaryEmail: 'john@example.com',
    contactsEpamEmail: 'john@epam.com',
    cityName: 'Minsk',
    maxStudentsLimit: 4,
    name: 'John Doe',
    preferedCourses: ['JS 2024', 'React 2024'],
    preselectedCourses: ['React 2024'],
    preferedStudentsLocation: 'any',
    technicalMentoring: ['nodejs'],
    updatedDate: '2024-04-01T10:00:00.000Z',
    courses: ['JS 2024', 'Node 2024'],
    hasCertificate: true,
  },
  {
    id: 2,
    englishMentoring: false,
    languagesMentoring: [],
    githubId: 'mentor-jane',
    primaryEmail: null,
    contactsEpamEmail: null,
    cityName: null,
    maxStudentsLimit: 2,
    name: 'Jane null',
    preferedCourses: [],
    preselectedCourses: [],
    preferedStudentsLocation: '',
    technicalMentoring: [],
    updatedDate: '2024-03-15T08:00:00.000Z',
    courses: [],
    hasCertificate: false,
  },
];

// Identical to the CSV produced by the legacy GET /registry/mentors/csv for the same data
const expectedCsv = [
  '"id","englishMentoring","languagesMentoring","githubId","primaryEmail","contactsEpamEmail","cityName","maxStudentsLimit","name","preferedCourses","preselectedCourses","preferedStudentsLocation","technicalMentoring","updatedDate","courses","hasCertificate"',
  '1,true,"[""en"",""ru""]","mentor-john","john@example.com","john@epam.com","Minsk",4,"John Doe","[""JS 2024"",""React 2024""]","[""React 2024""]","any","[""nodejs""]","2024-04-01T10:00:00.000Z","[""JS 2024"",""Node 2024""]",true',
  '2,false,"[]","mentor-jane",,,,2,"Jane null","[]","[]","","[]","2024-03-15T08:00:00.000Z","[]",false',
].join('\n');

const mockGetMentorRegistriesForExport = vi.fn();

describe('RegistryController.getMentorRegistriesCsv', () => {
  let controller: RegistryController;

  beforeEach(async () => {
    mockGetMentorRegistriesForExport.mockReset().mockResolvedValue(exportRows);

    const module = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [
        { provide: RegistryService, useValue: { getMentorRegistriesForExport: mockGetMentorRegistriesForExport } },
        { provide: UserNotificationsService, useValue: {} },
        { provide: CoursesService, useValue: {} },
        { provide: DisciplinesService, useValue: {} },
      ],
    }).compile();

    controller = module.get(RegistryController);
  });

  it('responds with csv content and csv headers', async () => {
    const res = { setHeader: vi.fn(), end: vi.fn() };

    await controller.getMentorRegistriesCsv(res as never);

    expect(mockGetMentorRegistriesForExport).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename="mentors.csv"');
    expect(res.end).toHaveBeenCalledWith(expectedCsv);
  });
});
