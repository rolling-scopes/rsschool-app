import React from 'react';
import { render } from '@testing-library/react';
import { ProfileMainCardData } from 'services/user';
import MainCard from '../MainCard';

// TODO: Known Issue: https://stackoverflow.com/questions/59942808/how-can-i-use-jest-coverage-in-next-js-styled-jsx

const mockData: ProfileMainCardData = {
  name: 'John Doe',
  githubId: 'john-doe',
  location: {
    countryName: 'Belarus',
    cityName: 'Minsk',
  },
  publicCvUrl: 'public-url',
};

describe('MainCard', () => {
  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = render(<MainCard data={mockData} isEditingModeEnabled={false} updateProfile={jest.fn()} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = render(<MainCard data={mockData} isEditingModeEnabled={true} updateProfile={jest.fn()} />);
      expect(output.container).toMatchSnapshot();
    });
  });
});
