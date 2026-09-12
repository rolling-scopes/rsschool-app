import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getLanguageName, SelectLanguages } from './SelectLanguages';
import { UpdateUserDtoLanguagesEnum } from '@client/api';

describe('getLanguageName', () => {
  it('maps a language code to a human readable English name', () => {
    expect(getLanguageName(UpdateUserDtoLanguagesEnum.En)).toBe('English');
    expect(getLanguageName(UpdateUserDtoLanguagesEnum.Ru)).toBe('Russian');
  });
});

describe('SelectLanguages', () => {
  it('renders a multiple selector with default and custom placeholders', () => {
    const { rerender } = render(<SelectLanguages />);
    expect(screen.getByText('Select languages')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    rerender(<SelectLanguages placeholder="Pick a language" />);
    expect(screen.getByText('Pick a language')).toBeInTheDocument();
  });

  it('shows sorted language options and selects one', () => {
    const handleChange = vi.fn();
    render(<SelectLanguages onChange={handleChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(screen.getByTitle('English')).toBeInTheDocument();
    const optionLabels = options.map(option => option.textContent ?? '');
    const sortedLabels = [...optionLabels].sort((a, b) => a.localeCompare(b, 'en'));
    // Options are produced from `languages`, which is sorted at module load by languagesSorter.
    // This exercises the normal `localeCompare` path of the sorter.
    // unreachable: the sorter's `if (!aName || !bName) return 0` guard (SelectLanguages.tsx:31)
    // cannot fire because Intl.DisplayNames resolves every UpdateUserDtoLanguagesEnum value to a
    // truthy name, and the sorter is a module-private function run once at import with no injection point.
    expect(optionLabels).toEqual(sortedLabels);

    fireEvent.click(screen.getByTitle('English'));
    expect(handleChange).toHaveBeenCalledWith([UpdateUserDtoLanguagesEnum.En], expect.anything());
  });

  it('filters options by the typed language name via optionFilterProp="label"', async () => {
    const user = userEvent.setup();
    render(<SelectLanguages />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'Russ');

    // Matching label survives the filter; a non-matching one is filtered out.
    expect(screen.getByTitle('Russian')).toBeInTheDocument();
    expect(screen.queryByTitle('English')).not.toBeInTheDocument();
  });
});
