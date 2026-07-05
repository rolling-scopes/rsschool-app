import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateUserDtoLanguagesEnum } from '@client/api';
import { getLanguageName } from '@client/components/SelectLanguages';
import LanguagesCard from '../LanguagesCard';

const lang = Object.values(UpdateUserDtoLanguagesEnum)[0];

function renderCard(overrides: Partial<React.ComponentProps<typeof LanguagesCard>> = {}) {
  const props = {
    data: [] as UpdateUserDtoLanguagesEnum[],
    isEditingModeEnabled: true,
    updateProfile: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
  return { props, ...render(<LanguagesCard {...props} />) };
}

describe('LanguagesCard', () => {
  it('renders no tags when data is empty', () => {
    renderCard({ data: [] });
    expect(screen.queryByText(String(getLanguageName(lang)))).not.toBeInTheDocument();
    expect(screen.getByText('Languages are not selected')).toBeInTheDocument();
  });

  it('renders a tag for each language when data is populated', () => {
    renderCard({ data: [lang] });
    expect(screen.getAllByText(String(getLanguageName(lang))).length).toBeGreaterThan(0);
  });

  it('does not show the edit affordance when editing is disabled', () => {
    renderCard({ isEditingModeEnabled: false });
    expect(screen.queryByRole('img', { name: 'edit' })).not.toBeInTheDocument();
  });

  it('opens the settings modal and saves languages when updateProfile resolves true', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    renderCard({ data: [lang], updateProfile });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(updateProfile).toHaveBeenCalledWith({ languages: [lang] });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not update languages when updateProfile resolves false', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(false);
    renderCard({ data: [lang], updateProfile });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateProfile).toHaveBeenCalledTimes(1);
    // tag still rendered because setLanguages was skipped (handleSave early return)
    expect(screen.getAllByText(String(getLanguageName(lang))).length).toBeGreaterThan(0);
  });

  it('resets the form on cancel', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    renderCard({ data: [lang], updateProfile });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updateProfile).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
