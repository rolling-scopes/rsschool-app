import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddCriteriaForCrossCheck } from '../AddCriteriaForCrossCheck';
import userEvent from '@testing-library/user-event';

const addCriteria = jest.fn();

describe('AddCriteriaForCrossCheck', () => {
  test('render match snapshot', () => {
    const view = render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    expect(view).toMatchSnapshot();
  });

  test('contains following text', () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const element = screen.getByText(/Add New Criteria/i);
    expect(element).toBeInTheDocument();
  });

  test('functions are called', () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const button = screen.getByText(/Add New Criteria/i);
    fireEvent.click(button);
    expect(addCriteria).toHaveBeenCalledTimes(1);
  });

  test('textarea renders correct', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const textarea = screen.getByPlaceholderText('Add description') as HTMLInputElement;
    expect(textarea).toBeInTheDocument();

    const testString = 'test value';
    textarea.value = '';
    await userEvent.type(textarea, testString);
    expect(textarea.value).toEqual(testString);
  });

  test('Simulates selection', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectCriteriaType).toBeInTheDocument();
    fireEvent.mouseDown(selectCriteriaType);
    const optionSubtask = screen.getByTestId('Subtask') as HTMLOptionElement;

    fireEvent.click(optionSubtask);
    const element = screen.getByRole('option', { name: 'Subtask' });
    expect(element).toBeInTheDocument();
  });

  test('inputs type renders correct', async () => {
    render(<AddCriteriaForCrossCheck onCreate={addCriteria} />);
    const selectCriteriaType = screen.getByRole('combobox') as HTMLSelectElement;

    const inputMaxScore = screen.queryByLabelText('Add Max Score') as HTMLInputElement;
    expect(inputMaxScore).not.toBeInTheDocument();

    fireEvent.mouseDown(selectCriteriaType);
    const optionSubtask = screen.getByTestId('Subtask') as HTMLOptionElement;
    fireEvent.click(optionSubtask);
    expect(screen.getByText('Add Max Score')).toBeInTheDocument();

    const inputMaxPenalty = screen.queryByLabelText('Add Max Penalty') as HTMLInputElement;
    expect(inputMaxPenalty).not.toBeInTheDocument();

    fireEvent.mouseDown(selectCriteriaType);
    const optionPenalty = screen.getByTestId('Penalty') as HTMLOptionElement;
    fireEvent.click(optionPenalty);
    expect(screen.getByText('Add Max Penalty')).toBeInTheDocument();
  });
});
