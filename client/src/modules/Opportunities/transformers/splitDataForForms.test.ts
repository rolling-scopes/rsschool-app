import { ResumeDtoEnglishLevelEnum, ResumeDtoMilitaryServiceEnum } from 'api';
import { AllUserCVData } from '../models';
import { splitDataForForms } from './splitDataForForms';

const mockInitialData: AllUserCVData = {
  avatarLink: 'https://example.com/avatar.png',
  desiredPosition: 'Senior Cookie Manager',
  email: 'example@gmail.com',
  englishLevel: ResumeDtoEnglishLevelEnum.A2,
  fullTime: true,
  githubUsername: null,
  linkedin: null,
  locations: 'Minsk Belarus',
  militaryService: ResumeDtoMilitaryServiceEnum.NotLiable,
  name: 'John Doe',
  notes: null,
  phone: '+1111111111111',
  selfIntroLink: null,
  skype: null,
  startFrom: '2022-09-24',
  telegram: null,
  website: null,
  visibleCourses: [11, 21, 53],
};

describe('splitDataForForms', () => {
  it('should split data for forms', () => {
    const { userData, contacts, visibleCourses } = splitDataForForms(mockInitialData);

    expect(userData).toEqual({
      selfIntroLink: mockInitialData.selfIntroLink,
      militaryService: mockInitialData.militaryService,
      avatarLink: mockInitialData.avatarLink,
      desiredPosition: mockInitialData.desiredPosition,
      englishLevel: mockInitialData.englishLevel,
      locations: mockInitialData.locations,
      name: mockInitialData.name,
      notes: mockInitialData.notes,
      startFrom: mockInitialData.startFrom,
      fullTime: mockInitialData.fullTime,
    });

    expect(contacts).toEqual({
      phone: mockInitialData.phone,
      email: mockInitialData.email,
      skype: mockInitialData.skype,
      telegram: mockInitialData.telegram,
      linkedin: mockInitialData.linkedin,
      githubUsername: mockInitialData.githubUsername,
      website: mockInitialData.website,
    });

    expect(visibleCourses).toEqual(mockInitialData.visibleCourses);
  });
});
