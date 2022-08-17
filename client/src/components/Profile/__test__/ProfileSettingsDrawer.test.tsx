import React from 'react';
import { render } from '@testing-library/react';
import ProfileSettingsDrawer from '../ProfileSettingsDrawer';

describe('ProfileSettingsDrawer', () => {
  it('Should render correctly', () => {
    const output = render(
      <ProfileSettingsDrawer isSettingsVisible={true} hideSettings={jest.fn()} content={<div>content</div>} />,
    );
    expect(output.container).toMatchSnapshot();
  });
});
