import { fireEvent, render, screen, within } from '@testing-library/react';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';

describe('<CriteriaTypeSelect />', () => {
  it('renders options and reports the selected value', () => {
    const onChange = vi.fn();
    render(<CriteriaTypeSelect onChange={onChange} />);

    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));

    const body = within(document.body);
    expect(body.getByText('Title')).toBeInTheDocument();
    expect(body.getByText('Subtask')).toBeInTheDocument();
    expect(body.getByText('Penalty')).toBeInTheDocument();
    fireEvent.click(body.getByTestId('Subtask'));

    expect(onChange).toHaveBeenCalledWith('subtask', expect.anything());
  });
});
