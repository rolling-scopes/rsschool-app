import React from 'react';
import { render } from '@testing-library/react';
import ProfileSettingsModal from '../ProfileSettingsModal';

describe('ProfileSettingsModal', () => {
  it('should render correctly', () => {
    const output = render(
      <ProfileSettingsModal
        isSettingsVisible={true}
        content={<div>content</div>}
        settingsTitle="Settings Title"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(output.getByRole('dialog')).toMatchSnapshot();
  });

  it('should not be rendered if isSettingsVisible === false', async () => {
    const output = render(
      <ProfileSettingsModal
        isSettingsVisible={false}
        content={<div>content</div>}
        settingsTitle="Settings Title"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const modal = output.queryByRole('dialog');

    expect(modal).toBe(null);
  });
});
