import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EducationCard from '../EducationCard';

describe('EducationCard', () => {
  // NOTE: EducationCard mutates university objects in place (handleChange writes
  // `university[field] = value` on objects shared with the original `data` array),
  // so each test must own a *fresh* data array to avoid cross-test contamination.
  const makeData = () => [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }];

  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const { container } = render(
        <EducationCard data={makeData()} isEditingModeEnabled={false} updateProfile={vi.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if editing mode is enabled', () => {
      const { container } = render(
        <EducationCard data={makeData()} isEditingModeEnabled={true} updateProfile={vi.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if "data" has element with "null" value', () => {
      const { container } = render(
        <EducationCard
          data={[{ graduationYear: null, faculty: null, university: null }]}
          isEditingModeEnabled={true}
          updateProfile={vi.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it('if "data" is empty', () => {
      const { container } = render(<EducationCard data={[]} isEditingModeEnabled={false} updateProfile={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });
  });

  const openSettings = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('img', { name: 'edit' }));

  // Fill all three fields of the (single) university in an open dialog.
  const fillNewUniversity = async (
    user: ReturnType<typeof userEvent.setup>,
    { university, faculty, graduationYear }: { university: string; faculty: string; graduationYear: string },
  ) => {
    const dialog = screen.getByRole('dialog');
    const inputs = within(dialog).getAllByRole('textbox') as HTMLInputElement[];
    await user.type(inputs[0], university);
    await user.type(inputs[1], faculty);
    await user.type(inputs[2], graduationYear);
  };

  it('adds a new university, fills it, saves and reflects it on success', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<EducationCard data={[]} isEditingModeEnabled updateProfile={updateProfile} />);

    await openSettings(user);
    await user.click(screen.getByRole('button', { name: /Add new university/ }));
    await fillNewUniversity(user, { university: 'MIT', faculty: 'CS', graduationYear: '2020' });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        educationHistory: [{ university: 'MIT', faculty: 'CS', graduationYear: '2020' }],
      }),
    );
    // the content list now reflects the saved university
    await waitFor(() => expect(screen.getAllByText(/MIT \/ CS/).length).toBeGreaterThan(0));
  });

  it('does not update the displayed list when the save fails (handleSave early return)', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(false);
    render(<EducationCard data={[]} isEditingModeEnabled updateProfile={updateProfile} />);

    await openSettings(user);
    await user.click(screen.getByRole('button', { name: /Add new university/ }));
    await fillNewUniversity(user, { university: 'Failed', faculty: 'CS', graduationYear: '2020' });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    // displayed content was not committed: the empty-state placeholder is still shown
    // (the unsaved "Failed / CS" only lives in the now-closed settings modal).
    expect(screen.getByText("Education history isn't filled in")).toBeInTheDocument();
  });

  it('typing into an existing university field updates the input (handleChange)', async () => {
    const user = userEvent.setup();
    render(<EducationCard data={makeData()} isEditingModeEnabled updateProfile={vi.fn()} />);

    await openSettings(user);
    const universityInput = screen.getByDisplayValue('MIT');
    await user.clear(universityInput);
    await user.type(universityInput, 'Harvard');

    expect(screen.getByDisplayValue('Harvard')).toBeInTheDocument();
  });

  it('disables Add new university while an entry has empty fields (isAddDisabled)', async () => {
    const user = userEvent.setup();
    render(<EducationCard data={makeData()} isEditingModeEnabled updateProfile={vi.fn()} />);

    await openSettings(user);
    await user.click(screen.getByRole('button', { name: /Add new university/ }));

    // the new entry is empty -> Add and Save disabled, "(Empty)" shown in settings
    expect(screen.getByRole('button', { name: /Add new university/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText('(Empty)')).toBeInTheDocument();
  });

  it('deletes a university entry (handleDelete)', async () => {
    const user = userEvent.setup();
    render(<EducationCard data={makeData()} isEditingModeEnabled updateProfile={vi.fn()} />);

    await openSettings(user);
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Delete/ }));

    expect(screen.queryByDisplayValue('MIT')).not.toBeInTheDocument();
  });

  it('restores the universities on cancel (handleCancel)', async () => {
    const user = userEvent.setup();
    render(<EducationCard data={makeData()} isEditingModeEnabled updateProfile={vi.fn()} />);

    await openSettings(user);
    // delete the only entry, then cancel to restore it
    await user.click(screen.getByRole('button', { name: /Delete/ }));
    expect(screen.queryByDisplayValue('MIT')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // reopening shows the restored original entry
    await openSettings(user);
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument();
  });

  it('renders the settings entry as "(Empty)" when a university is incomplete', async () => {
    const user = userEvent.setup();
    render(
      <EducationCard
        data={[{ graduationYear: null, faculty: 'POIT', university: 'MIT' }]}
        isEditingModeEnabled
        updateProfile={vi.fn()}
      />,
    );

    await openSettings(user);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('(Empty)')).toBeInTheDocument();
  });
});
