import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddCriteriaForCrossCheck } from '../AddCriteriaForCrossCheck';
import userEvent from '@testing-library/user-event';

const addCriteria = vi.fn();

describe('AddCriteriaForCrossCheck', () => {
  test('should match shapshot', () => {
    const view = render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    expect(view).toMatchSnapshot();
    expect(screen.getByText(/Add New Criteria/i)).toBeInTheDocument();
  });

  test('should call addCriteria when "Add new criteria" button was clicked', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox');
    fireEvent.mouseDown(selectCriteriaType);
    const optionTitle = screen.getByTestId('Title');
    fireEvent.click(optionTitle);

    const descriptionInput = screen.getByPlaceholderText('Add description');
    fireEvent.change(descriptionInput, { target: { value: 'test' } });

    const button = screen.getByRole('button', { name: /Add New Criteria/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(addCriteria).toHaveBeenCalledTimes(1);
    });
  });

  test('should change textarea value on typing', async () => {
    const expectedString = 'test value';
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);

    const textarea = screen.getByPlaceholderText<HTMLInputElement>('Add description');
    expect(textarea).toBeInTheDocument();
    await userEvent.type(textarea, expectedString);

    expect(textarea.value).toEqual(expectedString);
  });

  test('input with adding max score renders only after user select criteria type Subtask', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox');
    expect(selectCriteriaType).toBeInTheDocument();

    const inputMaxScore = screen.queryByLabelText('Add Max Score');
    expect(inputMaxScore).not.toBeInTheDocument();

    fireEvent.mouseDown(selectCriteriaType);
    expect(screen.getByRole('option', { name: 'Subtask' })).toBeInTheDocument();
    const optionSubtask = screen.getByTestId('Subtask');
    fireEvent.click(optionSubtask);
    expect(screen.getByText('Add Max Score')).toBeInTheDocument();
  });
});
