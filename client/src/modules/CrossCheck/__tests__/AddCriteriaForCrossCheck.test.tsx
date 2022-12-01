import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddCriteriaForCrossCheck } from '../AddCriteriaForCrossCheck';
import userEvent from '@testing-library/user-event';

const addCriteria = jest.fn();

describe('AddCriteriaForCrossCheck', () => {
  test('should match shapshot', () => {
    const view = render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    expect(view).toMatchSnapshot();
  });

  test('should render "Add New Criteria" button', () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const element = screen.getByText(/Add New Criteria/i);
    expect(element).toBeInTheDocument();
  });

  test('should call addCriteria when "Add new criteria" button was clicked', () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const button = screen.getByRole('button', { name: /Add New Criteria/i });
    fireEvent.click(button);
    expect(addCriteria).toHaveBeenCalledTimes(1);
  });

  test('should render textarea', () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);

    const textarea = screen.getByPlaceholderText('Add description') as HTMLInputElement;
    expect(textarea).toBeInTheDocument();
  });

  test('should change textarea value on typing', async () => {
    const expectedString = 'test value';
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);

    const textarea = screen.getByPlaceholderText('Add description') as HTMLInputElement;
    await userEvent.type(textarea, expectedString);

    expect(textarea.value).toEqual(expectedString);
  });

  test('should select criteria', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectCriteriaType).toBeInTheDocument();
    fireEvent.mouseDown(selectCriteriaType);

    const element = screen.getByRole('option', { name: 'Subtask' });
    expect(element).toBeInTheDocument();
  });

  test('input with adding max score renders only after user select criteria type Subtask', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox') as HTMLSelectElement;

    const inputMaxScore = screen.queryByLabelText('Add Max Score') as HTMLInputElement;
    expect(inputMaxScore).not.toBeInTheDocument();

    fireEvent.mouseDown(selectCriteriaType);
    const optionSubtask = screen.getByTestId('Subtask') as HTMLOptionElement;
    fireEvent.click(optionSubtask);
    expect(screen.getByText('Add Max Score')).toBeInTheDocument();
  });
});
