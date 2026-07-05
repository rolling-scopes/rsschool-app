import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonSelect } from './PersonSelect';

const DATA = [
  { id: 1, githubId: 'alice', name: 'Alice A' },
  { id: 2, githubId: 'bob', name: 'Bob B' },
];

function openSelect() {
  const combobox = screen.getByRole('combobox');
  combobox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  return combobox;
}

describe('PersonSelect', () => {
  it('renders a searchable combobox with a placeholder', () => {
    render(<PersonSelect data={DATA} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders an option per person keyed by id by default', async () => {
    render(<PersonSelect data={DATA} />);

    openSelect();

    expect(await screen.findByText(/Alice A/)).toBeInTheDocument();
    expect(screen.getByText(/Bob B/)).toBeInTheDocument();
  });

  it('selects a person by id and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PersonSelect data={DATA} onChange={onChange} />);

    openSelect();
    await user.click(await screen.findByText(/Alice A/));

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe(1);
  });

  it('keys options by githubId when keyField is githubId', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PersonSelect data={DATA} keyField="githubId" onChange={onChange} />);

    openSelect();
    await user.click(await screen.findByText(/Bob B/));

    expect(onChange.mock.calls[0][0]).toBe('bob');
  });

  it('preselects the provided default value', () => {
    render(<PersonSelect data={DATA} defaultValue={2} />);

    // antd renders the selected option's content in the selector
    expect(screen.getByText(/Bob B/)).toBeInTheDocument();
  });
});
