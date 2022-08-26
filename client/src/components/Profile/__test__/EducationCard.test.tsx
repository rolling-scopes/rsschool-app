import React from 'react';
import { render } from '@testing-library/react';
import EducationCard from '../EducationCard';
import { GeneralInfo } from 'common/models/profile';

describe('EducationCard', () => {
  describe('Should render correctly', () => {
    const mockData = {
      educationHistory: [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }],
    } as GeneralInfo;

    it('if editing mode is disabled', () => {
      const result = render(
        <EducationCard
          data={mockData}
          isEditingModeEnabled={false}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(result.container).toMatchSnapshot();
    });

    it('if editing mode is enabled', () => {
      const result = render(
        <EducationCard
          data={mockData}
          isEditingModeEnabled={true}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(result.container).toMatchSnapshot();
    });

    it('if "educationHistory" has element with "null" values', () => {
      const result = render(
        <EducationCard
          data={
            {
              educationHistory: [{ graduationYear: null, faculty: null, university: null }],
            } as GeneralInfo
          }
          isEditingModeEnabled={true}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(result.container).toMatchSnapshot();
    });

    it('if "educationHistory" is empty', () => {
      const result = render(
        <EducationCard
          data={{ educationHistory: [] } as GeneralInfo}
          isEditingModeEnabled={false}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(result.container).toMatchSnapshot();
    });
  });
});
