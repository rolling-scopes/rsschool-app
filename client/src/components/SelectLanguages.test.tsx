import { fireEvent, render, screen } from '@testing-library/react';
import { getLanguageName, SelectLanguages } from './SelectLanguages';
import { UpdateUserDtoLanguagesEnum } from '@client/api';

describe('getLanguageName', () => {
  it('maps a language code to a human readable English name', () => {
    expect(getLanguageName(UpdateUserDtoLanguagesEnum.En)).toBe('English');
    expect(getLanguageName(UpdateUserDtoLanguagesEnum.Ru)).toBe('Russian');
  });
});

describe('SelectLanguages', () => {
  it('renders the default placeholder', () => {
    render(<SelectLanguages />);
    expect(screen.getByText('Select languages')).toBeInTheDocument();
  });

  it('renders a custom placeholder when provided', () => {
    render(<SelectLanguages placeholder="Pick a language" />);
    expect(screen.getByText('Pick a language')).toBeInTheDocument();
  });

  it('renders a multiple-mode combobox', () => {
    render(<SelectLanguages />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows language options when opened', () => {
    render(<SelectLanguages />);

    fireEvent.mouseDown(screen.getByRole('combobox'));

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    // English should be present as an option label
    expect(screen.getByTitle('English')).toBeInTheDocument();
  });

  it('selects a language option', () => {
    const handleChange = vi.fn();
    render(<SelectLanguages onChange={handleChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTitle('English'));

    expect(handleChange).toHaveBeenCalledWith([UpdateUserDtoLanguagesEnum.En], expect.anything());
  });
});
