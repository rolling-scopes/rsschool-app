import { ResumeDtoEnglishLevelEnum, ResumeDto, ResumeDtoMilitaryServiceEnum } from 'api';
import { mapValues } from 'lodash';
import { transformInitialCvData } from './transformInitialCvData';

const mockInitialData = {
  id: 12345,
  uuid: '0882dc34-415d-4fa2-919d-37cab831db3a',
  avatarLink: 'https://example.com/avatar.png',
  desiredPosition: 'Senior Cookie Manager',
  email: 'example@gmail.com',
  englishLevel: ResumeDtoEnglishLevelEnum.A2,
  expires: '1666626604224',
  fullTime: true,
  githubUsername: 'some-github-username',
  linkedin: 'linkedin',
  locations: 'Minsk Belarus',
  militaryService: ResumeDtoMilitaryServiceEnum.NotLiable,
  name: 'John Doe',
  notes: 'Lalala some info about myself',
  phone: '+1111111111111',
  selfIntroLink: 'https://example.com/self-intro.mp4',
  skype: 'skype',
  startFrom: '2022-09-24',
  telegram: 'telegram',
  website: 'https://example.com',
  visibleCourses: [11, 21, 53],
  gratitudes: [0, 1, 2],
  courses: [3, 4, 5],
  feedbacks: [6, 7, 8],
} as unknown as ResumeDto;

describe('transformInitialCvData', () => {
  it('should return correct data', () => {
    const { userData, contacts, courses, visibleCourses } = transformInitialCvData(mockInitialData);

    expect(userData).toEqual({
      notes: mockInitialData.notes,
      name: mockInitialData.name,
      selfIntroLink: mockInitialData.selfIntroLink,
      militaryService: mockInitialData.militaryService,
      avatarLink: mockInitialData.avatarLink,
      desiredPosition: mockInitialData.desiredPosition,
      englishLevel: mockInitialData.englishLevel,
      locations: mockInitialData.locations,
      startFrom: mockInitialData.startFrom,
      fullTime: mockInitialData.fullTime,
    });

    expect(contacts).toEqual({
      email: mockInitialData.email,
      githubUsername: mockInitialData.githubUsername,
      linkedin: mockInitialData.linkedin,
      phone: mockInitialData.phone,
      skype: mockInitialData.skype,
      telegram: mockInitialData.telegram,
      website: mockInitialData.website,
    });

    expect(courses).toEqual(mockInitialData.courses);
    expect(visibleCourses).toEqual(mockInitialData.visibleCourses);
  });

  it('should correctly handle absence of data', () => {
    const { userData, contacts, courses, visibleCourses } = transformInitialCvData(null);

    expect(userData).toEqual({
      notes: null,
      name: null,
      selfIntroLink: null,
      militaryService: null,
      avatarLink: null,
      desiredPosition: null,
      englishLevel: null,
      locations: null,
      startFrom: null,
      fullTime: false,
    });

    expect(contacts).toEqual({
      email: null,
      githubUsername: null,
      linkedin: null,
      phone: null,
      skype: null,
      telegram: null,
      website: null,
    });

    expect(courses).toEqual([]);
    expect(visibleCourses).toEqual([]);
  });

  it('should correctly handle mising values', () => {
    const { userData, contacts, courses, visibleCourses } = transformInitialCvData(
      mapValues(mockInitialData, () => undefined) as unknown as ResumeDto,
    );

    expect(userData).toEqual({
      notes: null,
      name: null,
      selfIntroLink: null,
      militaryService: null,
      avatarLink: null,
      desiredPosition: null,
      englishLevel: null,
      locations: null,
      startFrom: null,
      fullTime: false,
    });

    expect(contacts).toEqual({
      email: null,
      githubUsername: null,
      linkedin: null,
      phone: null,
      skype: null,
      telegram: null,
      website: null,
    });

    expect(courses).toEqual([]);
    expect(visibleCourses).toEqual([]);
  });
});
