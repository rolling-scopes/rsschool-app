import React from 'react';
import { render } from '@testing-library/react';
import EducationCard from '../EducationCard';

describe('EducationCard', () => {
  describe('Should render correctly', () => {
    const mockData = [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }];

    it('if editing mode is disabled', () => {
      const { container } = render(
        <EducationCard data={mockData} isEditingModeEnabled={false} updateProfile={jest.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if editing mode is enabled', () => {
      const { container } = render(
        <EducationCard data={mockData} isEditingModeEnabled={false} updateProfile={jest.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if "data" has element with "null" value', () => {
      const { container } = render(
        <EducationCard
          data={[{ graduationYear: null, faculty: null, university: null }]}
          isEditingModeEnabled={true}
          updateProfile={jest.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if "data" is empty', () => {
      const { container } = render(<EducationCard data={[]} isEditingModeEnabled={false} updateProfile={jest.fn()} />);
      expect(container).toMatchSnapshot();
    });
  });
});
