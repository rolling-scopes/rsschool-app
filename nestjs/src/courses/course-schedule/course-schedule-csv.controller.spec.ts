import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseScheduleController } from './course-schedule.controller';
import { CourseScheduleService } from './course-schedule.service';

// Same sorted rows as in course-schedule-csv.service.spec.ts
const rows = [
  {
    entityType: 'task',
    templateId: 6,
    id: 22,
    startDate: '2024-01-10 11:00',
    endDate: '2024-01-20 23:00',
    type: 'selfeducation',
    name: 'Test Task',
    descriptionUrl: 'https://example.com/test',
    githubId: null,
    place: null,
    checker: 'auto-test',
    pairsCount: 4,
  },
  {
    entityType: 'event',
    templateId: 7,
    id: 31,
    startDate: '2024-02-15 11:30',
    type: 'lecture',
    special: 'urgent',
    name: 'Kickoff',
    descriptionUrl: 'https://example.com/kickoff',
    githubId: 'org-anna',
    place: 'Discord',
    checker: null,
    pairsCount: null,
  },
  {
    entityType: 'task',
    templateId: 5,
    id: 21,
    startDate: '2024-03-01 13:00',
    endDate: '2024-03-09 02:59',
    type: 'jstask',
    name: 'JS Task',
    descriptionUrl: 'https://example.com/js',
    githubId: 'task-owner',
    place: null,
    checker: 'mentor',
    pairsCount: null,
  },
  {
    entityType: 'event',
    templateId: 8,
    id: 32,
    startDate: '',
    type: 'meetup',
    special: '',
    name: 'TBD Event',
    descriptionUrl: 'https://example.com/tbd',
    githubId: null,
    place: null,
    checker: null,
    pairsCount: null,
  },
];

// Identical to the CSV produced by the legacy GET /schedule/csv/:timeZone for the same data:
// columns inferred from the first (task) row, so the event-only `special` column is absent.
const expectedCsv = [
  '"entityType","templateId","id","startDate","endDate","type","name","descriptionUrl","githubId","place","checker","pairsCount"',
  '"task",6,22,"2024-01-10 11:00","2024-01-20 23:00","selfeducation","Test Task","https://example.com/test",,,"auto-test",4',
  '"event",7,31,"2024-02-15 11:30",,"lecture","Kickoff","https://example.com/kickoff","org-anna","Discord",,',
  '"task",5,21,"2024-03-01 13:00","2024-03-09 02:59","jstask","JS Task","https://example.com/js","task-owner",,"mentor",',
  '"event",8,32,"",,"meetup","TBD Event","https://example.com/tbd",,,,',
].join('\n');

const mockGetScheduleAsCsvRows = vi.fn();

const createRes = () => ({ setHeader: vi.fn(), end: vi.fn() });

describe('CourseScheduleController.getScheduleAsCsv', () => {
  let controller: CourseScheduleController;

  beforeEach(async () => {
    mockGetScheduleAsCsvRows.mockReset().mockResolvedValue(rows);

    const module = await Test.createTestingModule({
      controllers: [CourseScheduleController],
      providers: [
        { provide: CourseScheduleService, useValue: { getScheduleAsCsvRows: mockGetScheduleAsCsvRows } },
      ],
    }).compile();

    controller = module.get(CourseScheduleController);
  });

  it('responds with csv content and csv headers', async () => {
    const res = createRes();

    await controller.getScheduleAsCsv(11, 'Europe_Minsk', res as never);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename="schedule_11.csv"');
    expect(res.end).toHaveBeenCalledWith(expectedCsv);
  });

  it('decodes the timezone path param (underscore to slash) before calling the service', async () => {
    await controller.getScheduleAsCsv(11, 'America_New_York', createRes() as never);

    expect(mockGetScheduleAsCsvRows).toHaveBeenCalledWith(11, 'America/New_York');
  });

  it('falls back to Europe/Minsk when the timezone is empty', async () => {
    await controller.getScheduleAsCsv(11, '', createRes() as never);

    expect(mockGetScheduleAsCsvRows).toHaveBeenCalledWith(11, 'Europe/Minsk');
  });
});
