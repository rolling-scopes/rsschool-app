import { renderHook, waitFor } from '@testing-library/react';
import { ResumeDtoEnglishLevelEnum, ResumeDto, ResumeDtoMilitaryServiceEnum } from '@client/api';
import { useViewData } from './useViewData';

const mockResume = {
  id: 12345,
  uuid: '0882dc34-415d-4fa2-919d-37cab831db3a',
  avatarLink: 'https://example.com/avatar.png',
  desiredPosition: 'Senior Cookie Manager',
  email: 'example@gmail.com',
  englishLevel: ResumeDtoEnglishLevelEnum.A2,
  expires: '1666626604224',
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
  gratitudes: [
    {
      date: '2022-06-13T18:55:18.761Z',
      comment: 'Большое спасибо за замечательный фидьбек!',
    },
  ],
  courses: [],
  feedbacks: [],
} as unknown as ResumeDto;

describe('useViewData', () => {
  test('should split data if provided', async () => {
    const { result } = renderHook(() => useViewData({ initialData: mockResume }));

    const expected = {
      contacts: {
        email: mockResume.email,
        githubUsername: mockResume.githubUsername,
        linkedin: mockResume.linkedin,
        phone: mockResume.phone,
        skype: mockResume.skype,
        telegram: mockResume.telegram,
        website: mockResume.website,
      },
      courses: mockResume.courses,
      expires: mockResume.expires,
      feedbacks: mockResume.feedbacks,
      gratitudes: mockResume.gratitudes,
      loading: false,
      setExpires: expect.any(Function),
      userData: {
        avatarLink: mockResume.avatarLink,
        desiredPosition: mockResume.desiredPosition,
        englishLevel: mockResume.englishLevel,
        fullTime: mockResume.fullTime,
        locations: mockResume.locations,
        militaryService: mockResume.militaryService,
        name: mockResume.name,
        notes: mockResume.notes,
        selfIntroLink: mockResume.selfIntroLink,
        startFrom: mockResume.startFrom,
      },
      uuid: mockResume.uuid,
    };

    await waitFor(() => expect(result.current).toStrictEqual(expected));
  });

  test('should return empty data if not provided', async () => {
    const { result } = renderHook(() => useViewData({}));

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        contacts: null,
        courses: [],
        expires: null,
        feedbacks: [],
        gratitudes: [],
        loading: true,
        setExpires: expect.any(Function),
        userData: null,
        uuid: null,
      });
    });
  });
});
