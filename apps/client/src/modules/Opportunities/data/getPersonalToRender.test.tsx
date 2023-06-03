import { UserData } from '../models';
import { getPersonalToRender } from './getPersonalToRender';

describe('getPersonalToRender', () => {
  it('should return correct data in case all values are present', () => {
    const mockUserData = {
      englishLevel: 'B1',
      fullTime: true,
      locations: 'Minsk Belarus',
      militaryService: 'notLiable',
      selfIntroLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      startFrom: '2022-09-24',
    } as unknown as UserData;

    const view = getPersonalToRender(mockUserData);
    expect(view).toMatchSnapshot();
  });

  it('should correctly handle missing values', () => {
    const mockUserData = {
      englishLevel: null,
      fullTime: false,
      locations: null,
      militaryService: null,
      selfIntroLink: null,
      startFrom: null,
    } as unknown as UserData;

    const view = getPersonalToRender(mockUserData);
    expect(view).toMatchSnapshot();
  });
});
