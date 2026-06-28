import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutCard from '../AboutCard';

describe('AboutCard', () => {
  describe('Should render correctly', () => {
    it('if "data" is present', () => {
      const { container } = render(
        <AboutCard data={'Top contributor of Rolling Scopes'} isEditingModeEnabled={false} updateProfile={vi.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });
    it('if "data" is not present', () => {
      const { container } = render(<AboutCard data={''} isEditingModeEnabled={false} updateProfile={vi.fn()} />);

      expect(container).toMatchSnapshot();
    });
  });

  it('edits, saves the about text and reflects the new value on success', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<AboutCard data="old bio" isEditingModeEnabled updateProfile={updateProfile} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'new bio');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ aboutMyself: 'new bio' }));
    await waitFor(() => expect(screen.getAllByText('new bio').length).toBeGreaterThan(0));
  });

  it('keeps the previous displayed value when the update fails', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(false);
    render(<AboutCard data="old bio" isEditingModeEnabled updateProfile={updateProfile} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'failed bio');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ aboutMyself: 'failed bio' }));
    // displayed paragraph still shows the original value because the save was rejected
    expect(screen.getAllByText('old bio').length).toBeGreaterThan(0);
  });

  it('restores the original value when the edit is cancelled', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<AboutCard data="original" isEditingModeEnabled updateProfile={updateProfile} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'discarded');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updateProfile).not.toHaveBeenCalled();
    expect(screen.getAllByText('original').length).toBeGreaterThan(0);

    // reopening shows the restored original value, not the discarded draft
    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByRole('textbox')).toHaveValue('original');
  });

  it('disables Save until the text changes', async () => {
    const user = userEvent.setup();
    render(<AboutCard data="unchanged" isEditingModeEnabled updateProfile={vi.fn()} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await user.type(screen.getByRole('textbox'), '!');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});
