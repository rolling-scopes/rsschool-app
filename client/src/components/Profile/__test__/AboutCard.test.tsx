import React from 'react';
import { render } from '@testing-library/react';
import AboutCard from '../AboutCard';

describe('AboutCard', () => {
  describe('Should render correctly', () => {
    it('if "data" is present', () => {
      const output = render(
        <AboutCard data={'Top contributor of Rolling Scopes'} isEditingModeEnabled={false} updateProfile={jest.fn()} />,
      );
      expect(output.container).toMatchSnapshot();
    });
    it('if "data" is not present', () => {
      const output = render(<AboutCard data={''} isEditingModeEnabled={false} updateProfile={jest.fn()} />);
      expect(output.container).toMatchSnapshot();
    });
  });
});
