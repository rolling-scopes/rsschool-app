import { fireEvent, render, screen, within } from '@testing-library/react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';

describe('<CriteriaTypeSelect />', () => {
  it('renders the placeholder and a combobox', () => {
    render(<CriteriaTypeSelect />);
    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('lists Title, Subtask and Penalty options when opened', () => {
    render(<CriteriaTypeSelect />);
    fireEvent.mouseDown(screen.getByRole('combobox'));

    const body = within(document.body);
    expect(body.getByText('Title')).toBeInTheDocument();
    expect(body.getByText('Subtask')).toBeInTheDocument();
    expect(body.getByText('Penalty')).toBeInTheDocument();
  });

  it('calls onChange with the selected option value', () => {
    const onChange = vi.fn();
    render(<CriteriaTypeSelect onChange={onChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(within(document.body).getByTestId('Subtask'));

    expect(onChange).toHaveBeenCalledWith('subtask', expect.anything());
  });
});
