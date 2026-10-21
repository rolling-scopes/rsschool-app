import { fireEvent, render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { PersonSelect } from './PersonSelect';

const DATA = [
  { id: 1, githubId: 'alice', name: 'Alice A' },
  { id: 2, githubId: 'bob', name: 'Bob B' },
];

function openSelect() {
  const combobox = screen.getByRole('combobox');
  fireEvent.mouseDown(combobox);
  return combobox;
}

describe('PersonSelect', () => {
  it('renders, preselects, and selects people by id', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<PersonSelect data={DATA} defaultValue={2} onChange={onChange} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/Bob B/)).toBeInTheDocument();
    openSelect();
    await user.click(await screen.findByText(/Alice A/));

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe(1);
  });

  it('keys options by githubId when keyField is githubId', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<PersonSelect data={DATA} keyField="githubId" onChange={onChange} />);

    openSelect();
    await user.click(await screen.findByText(/Bob B/));

    expect(onChange.mock.calls[0][0]).toBe('bob');
  });
});
