import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManualSubmitTab } from './ManualSubmitTab';

// Replace StudentSearch with a simple text input that integrates with antd Form.Item
// (Form.Item injects `value` and `onChange` into the child via cloneElement).
vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: (props: { value?: string; onChange?: (v: string) => void }) => (
    <input data-testid="student-input" value={props.value ?? ''} onChange={e => props.onChange?.(e.target.value)} />
  ),
}));

const courseTasks = [
  { id: 1, name: 'Task A', studentStartDate: '2024-01-01', studentEndDate: '2024-12-31', maxScore: 100 },
  { id: 2, name: 'Task B', studentStartDate: '2024-01-01', studentEndDate: '2024-12-31', maxScore: 50 },
] as never;

function makeProps(overrides: Partial<Parameters<typeof ManualSubmitTab>[0]> = {}) {
  return {
    courseId: 42,
    courseService: { postMultipleScores: vi.fn().mockResolvedValue([]) } as never,
    courseTasks,
    onResults: vi.fn(),
    onLoadingChange: vi.fn(),
    ...overrides,
  };
}

describe('<ManualSubmitTab />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders one initial row with student input, task select, score input and remove button', () => {
    render(<ManualSubmitTab {...makeProps()} />);

    expect(screen.getAllByTestId('student-input')).toHaveLength(1);
    // antd Select renders a combobox; one combobox = one task select for one row.
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    // antd InputNumber renders role="spinbutton".
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
  });

  it('"Add row" button appends a new row', () => {
    render(<ManualSubmitTab {...makeProps()} />);

    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    fireEvent.click(screen.getByRole('button', { name: /add row/i }));

    expect(screen.getAllByTestId('student-input')).toHaveLength(3);
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
  });

  it('disables the remove button when only one row exists', () => {
    render(<ManualSubmitTab {...makeProps()} />);

    const removeBtn = screen.getByRole('button', { name: /remove row/i });
    expect(removeBtn).toBeDisabled();
  });

  it('removes a row when the remove button is clicked (with >1 rows)', () => {
    render(<ManualSubmitTab {...makeProps()} />);

    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    expect(screen.getAllByTestId('student-input')).toHaveLength(2);

    const [firstRemove] = screen.getAllByRole('button', { name: /remove row/i });
    fireEvent.click(firstRemove);

    expect(screen.getAllByTestId('student-input')).toHaveLength(1);
  });

  it('does not submit when all rows are empty (validation prevents submit)', async () => {
    const props = makeProps();
    render(<ManualSubmitTab {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    // antd validation fires asynchronously; postMultipleScores should never be called.
    await waitFor(() => {
      expect(props.courseService.postMultipleScores).not.toHaveBeenCalled();
    });
    expect(props.onResults).not.toHaveBeenCalled();
  });

  // Note: the (student, task) duplicate-detection logic itself is covered by unit tests
  // for `findDuplicateRow` in utils.test.ts. Driving antd Select/InputNumber through
  // jsdom is too brittle to be worth a parallel integration test here.

  it('renders the configured task options in each row select', () => {
    render(<ManualSubmitTab {...makeProps()} />);

    // Open the first row's task combobox; antd renders options into the document body.
    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);

    // After opening, options become visible somewhere in the document.
    return waitFor(() => {
      const popup = document.body;
      expect(within(popup).getByText('Task A (max 100)')).toBeInTheDocument();
      expect(within(popup).getByText('Task B (max 50)')).toBeInTheDocument();
    });
  });

  // Fills the single initial row: student -> task option -> score. Returns when the
  // form value has settled so a subsequent submit sees a complete row.
  async function fillRow(taskLabel: string, score: string) {
    fireEvent.change(screen.getByTestId('student-input'), { target: { value: 'alice' } });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const option = await within(document.body).findByText(taskLabel);
    fireEvent.click(option);

    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: score } });
    fireEvent.blur(scoreInput);
  }

  it('submits a complete row: posts scores, reports aggregated results and toggles loading', async () => {
    const postMultipleScores = vi.fn().mockResolvedValue([{ status: 'created', value: undefined }]);
    const props = makeProps({ courseService: { postMultipleScores } as never });
    render(<ManualSubmitTab {...props} />);

    await fillRow('Task A (max 100)', '80');
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(postMultipleScores).toHaveBeenCalledWith(1, [{ studentGithubId: 'alice', score: 80 }]);
    });
    // onResults is cleared first ([]) then populated with the aggregate.
    expect(props.onResults).toHaveBeenCalledWith([]);
    expect(props.onResults).toHaveBeenLastCalledWith([{ status: 'created', count: 1, messages: undefined }]);
    // Loading is toggled on then off around the request.
    expect(props.onLoadingChange).toHaveBeenNthCalledWith(1, true);
    expect(props.onLoadingChange).toHaveBeenLastCalledWith(false);
  });

  it('blocks submit and does not post when two rows duplicate the same (student, task)', async () => {
    const postMultipleScores = vi.fn().mockResolvedValue([]);
    const props = makeProps({ courseService: { postMultipleScores } as never });
    render(<ManualSubmitTab {...props} />);

    // Row 1.
    await fillRow('Task A (max 100)', '10');
    // Row 2 — duplicate student + task.
    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    const studentInputs = screen.getAllByTestId('student-input');
    fireEvent.change(studentInputs[1], { target: { value: 'Alice' } }); // case-insensitive dup
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    const options = await within(document.body).findAllByText('Task A (max 100)');
    fireEvent.click(options[options.length - 1]);
    const scoreInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(scoreInputs[1], { target: { value: '20' } });
    fireEvent.blur(scoreInputs[1]);

    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(props.onResults).not.toHaveBeenCalled();
    });
    expect(postMultipleScores).not.toHaveBeenCalled();
    expect(props.onLoadingChange).not.toHaveBeenCalled();
  });

  it('reports an error and resets loading when the request rejects', async () => {
    const postMultipleScores = vi.fn().mockRejectedValue(new Error('boom'));
    const props = makeProps({ courseService: { postMultipleScores } as never });
    render(<ManualSubmitTab {...props} />);

    await fillRow('Task A (max 100)', '50');
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(postMultipleScores).toHaveBeenCalled();
    });
    // The catch clears loading without populating results beyond the initial [] reset.
    await waitFor(() => {
      expect(props.onLoadingChange).toHaveBeenLastCalledWith(false);
    });
    expect(props.onResults).toHaveBeenCalledTimes(1); // only the [] reset, never an aggregate
    expect(props.onResults).toHaveBeenCalledWith([]);
  });

  it('changing the task re-validates the score field (onChange handler runs)', async () => {
    render(<ManualSubmitTab {...makeProps()} />);

    // Enter a score that is valid for Task A (max 100) but not Task B (max 50).
    await fillRow('Task A (max 100)', '80');
    // Now switch the task to Task B — the Select onChange triggers score re-validation.
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const optionB = await within(document.body).findByText('Task B (max 50)');
    fireEvent.click(optionB);

    await waitFor(() => {
      expect(screen.getByText('Max 50')).toBeInTheDocument();
    });
  });
});
