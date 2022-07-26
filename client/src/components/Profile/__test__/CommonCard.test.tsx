import React from 'react';
import { render } from '@testing-library/react';
import CommonCard from '../CommonCard';

describe('CommonCard', () => {
  describe('Should render correctly', () => {
    it('if just basic props is present', () => {
      const output = render(<CommonCard title="Test" icon={<i>Icon</i>} content={<p>Card body</p>} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if is null content passed', () => {
      const output = render(<CommonCard title="Test" icon={<i>Icon</i>} content={null} />);
      expect(output.container).toMatchSnapshot();
    });
  });
});
