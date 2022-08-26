import React from 'react';
import { render } from '@testing-library/react';
import EnglishCard from '../EnglishCard';
import { GeneralInfo } from 'common/models/profile';

describe('EnglishCard', () => {
  describe('Should render correctly', () => {
    it('if "englishLevel" is present', () => {
      const output = render(
        <EnglishCard
          data={
            {
              englishLevel: 'a2',
            } as GeneralInfo
          }
          isEditingModeEnabled={false}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
    it('if "aboutMyself" is not present', () => {
      const output = render(
        <EnglishCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
  });
});
