import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileSettingsModal from '../ProfileSettingsModal';

describe('ProfileSettingsModal', () => {
  it('should render correctly', () => {
    render(
      <ProfileSettingsModal
        isSettingsVisible={true}
        content={<div>content</div>}
        settingsTitle="Settings Title"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('should not be rendered if isSettingsVisible === false', async () => {
    render(
      <ProfileSettingsModal
        isSettingsVisible={false}
        content={<div>content</div>}
        settingsTitle="Settings Title"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const modal = screen.queryByRole('dialog');

    expect(modal).not.toBeInTheDocument();
  });
});
