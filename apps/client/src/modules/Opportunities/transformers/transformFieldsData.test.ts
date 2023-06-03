import { ResumeDtoEnglishLevelEnum, ResumeDtoMilitaryServiceEnum } from 'api';
import dayjs from 'dayjs';
import { transformFieldsData } from './transformFieldsData';

const mockFieldsData = {
  selfIntroLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  militaryService: ResumeDtoMilitaryServiceEnum.NotLiable,
  avatarLink: 'https://example.com/avatar.png',
  desiredPosition: 'Senior Cookie Manager',
  englishLevel: ResumeDtoEnglishLevelEnum.A2,
  locations: 'Minsk Belarus, Some Other, Some Another, Willbe Removed',
  name: 'John Doe',
  notes: 'Some notes',
  startFrom: dayjs('2022-09-24'),
  fullTime: true,
  phone: '+1111111111111',
  email: 'example@gmail.com',
  skype: 'example',
  telegram: 'example',
  linkedin: 'example',
  githubUsername: 'example',
  website: 'https://example.com',
  visibleCourses: [11, 21, 53],
};

describe('transformFieldsData', () => {
  it('should correctly tranform missing data', () => {
    const transformedData = transformFieldsData(mockFieldsData);

    expect(transformedData).toStrictEqual({
      selfIntroLink: mockFieldsData.selfIntroLink,
      militaryService: mockFieldsData.militaryService,
      avatarLink: mockFieldsData.avatarLink,
      desiredPosition: mockFieldsData.desiredPosition,
      englishLevel: mockFieldsData.englishLevel,
      locations: 'Minsk Belarus,Some Other,Some Another',
      name: mockFieldsData.name,
      notes: mockFieldsData.notes,
      startFrom: '2022-09-24',
      fullTime: mockFieldsData.fullTime,
      phone: mockFieldsData.phone,
      email: mockFieldsData.email,
      skype: mockFieldsData.skype,
      telegram: mockFieldsData.telegram,
      linkedin: mockFieldsData.linkedin,
      githubUsername: mockFieldsData.githubUsername,
      website: mockFieldsData.website,
      visibleCourses: mockFieldsData.visibleCourses,
    });
  });

  it('should transform fields data', () => {
    const transformedData = transformFieldsData({
      ...mockFieldsData,
      selfIntroLink: '\n',
      avatarLink: null,
      desiredPosition: '   ',
      name: '',
      notes: null,
      phone: null,
      email: '',
      skype: '',
      telegram: null,
      linkedin: '',
      locations: null,
      githubUsername: '  ',
      website: '',
    });

    expect(transformedData).toStrictEqual({
      selfIntroLink: null,
      militaryService: mockFieldsData.militaryService,
      avatarLink: null,
      desiredPosition: null,
      englishLevel: mockFieldsData.englishLevel,
      locations: null,
      name: null,
      notes: null,
      startFrom: '2022-09-24',
      fullTime: mockFieldsData.fullTime,
      phone: null,
      email: null,
      skype: null,
      telegram: null,
      linkedin: null,
      githubUsername: null,
      website: null,
      visibleCourses: mockFieldsData.visibleCourses,
    });
  });
});
