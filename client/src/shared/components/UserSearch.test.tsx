import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSearch } from './UserSearch';
import type { SearchStudent } from '@client/services/course';

const PEOPLE = [
  { id: 1, githubId: 'alice', name: 'Alice A' },
  { id: 2, githubId: 'bob', name: 'Bob B' },
];

function openSelect() {
  const combobox = screen.getByRole('combobox');
  fireMouseDown(combobox);
  return combobox;
}

function fireMouseDown(el: Element) {
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
}

describe('UserSearch', () => {
  it('renders a searchable combobox', () => {
    render(<UserSearch />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('uses the default values to filter locally when no searchFn is provided', async () => {
    const user = userEvent.setup();
    render(<UserSearch defaultValues={PEOPLE} />);

    const combobox = openSelect();
    // defaultSearch filters by name/githubId startsWith (case-sensitive), so the
    // lowercase githubId "alice" matches Alice but not Bob.
    await user.type(combobox, 'alice');

    await waitFor(() => {
      expect(screen.queryByText(/Bob B/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Alice A/)).toBeInTheDocument();
  });

  it('calls the provided searchFn and renders the returned options', async () => {
    const user = userEvent.setup();
    const searchFn = vi.fn().mockResolvedValue(PEOPLE);
    render(<UserSearch searchFn={searchFn} />);

    const combobox = openSelect();
    await user.type(combobox, 'al');

    await waitFor(() => expect(searchFn).toHaveBeenCalledWith('al', undefined));
    expect(await screen.findByText(/Alice A/)).toBeInTheDocument();
    expect(screen.getByText(/Bob B/)).toBeInTheDocument();
  });

  it('passes onlyStudentsWithoutMentorShown to the searchFn', async () => {
    const user = userEvent.setup();
    const searchFn = vi.fn().mockResolvedValue([]);
    render(<UserSearch searchFn={searchFn} onlyStudentsWithoutMentorShown />);

    const combobox = openSelect();
    await user.type(combobox, 'x');

    await waitFor(() => expect(searchFn).toHaveBeenCalledWith('x', true));
  });

  it('shows the current mentor warning when showMentor is set and a mentor exists', async () => {
    const user = userEvent.setup();
    const withMentor: SearchStudent[] = [
      {
        id: 3,
        githubId: 'carol',
        name: 'Carol C',
        mentor: { id: 9, githubId: 'mentor-x', name: 'Mentor X' },
      } as unknown as SearchStudent,
    ];
    const searchFn = vi.fn().mockResolvedValue(withMentor);
    render(<UserSearch searchFn={searchFn} showMentor />);

    const combobox = openSelect();
    await user.type(combobox, 'car');

    expect(await screen.findByText(/Current mentor: mentor-x/)).toBeInTheDocument();
  });

  it('selects an option by github id when keyField is githubId', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const searchFn = vi.fn().mockResolvedValue(PEOPLE);
    render(<UserSearch searchFn={searchFn} keyField="githubId" onChange={onChange} />);

    const combobox = openSelect();
    await user.type(combobox, 'al');

    const option = await screen.findByText(/Alice A/);
    await user.click(option);

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe('alice');
  });

  it('does not call searchFn for a whitespace-only query (falls back to default values)', async () => {
    const user = userEvent.setup();
    const searchFn = vi.fn().mockResolvedValue(PEOPLE);
    render(<UserSearch searchFn={searchFn} defaultValues={PEOPLE} />);

    const combobox = openSelect();
    await user.type(combobox, '   ');

    // whitespace-only trims to empty -> falls back to defaultValues, searchFn not called.
    await waitFor(() => expect(searchFn).not.toHaveBeenCalled(), { timeout: 1000 });
    // The default values remain available as options.
    expect(await screen.findByText(/Alice A/)).toBeInTheDocument();
  });
});
