import React from 'react';
import { render } from '@testing-library/react';
import AboutCard from '../AboutCard';
import { GeneralInfo } from 'common/models/profile';

describe('AboutCard', () => {
  describe('Should render correctly', () => {
    it('if "aboutMyself" is present', () => {
      const output = render(
        <AboutCard
          data={
            {
              aboutMyself: 'Top contributor of Rolling Scopes',
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
        <AboutCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
  });
});
