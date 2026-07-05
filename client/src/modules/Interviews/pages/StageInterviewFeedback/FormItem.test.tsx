import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { ReactNode } from 'react';
import { FormItem } from './FormItem';
import { StepForm } from './StepForm';
import { FeedbackStep, FeedbackStepId, StepFormItem } from '@client/data/interviews/technical-screening';
import { InputType } from '@client/data/interviews';

// FormItem only renders a non-brittle widget per branch (Radio / RadioButton / Checkbox /
// Input / TextArea). The Rating branch delegates to QuestionList, whose Form.List +
// useWatch + Rate combo is genuinely brittle in jsdom — it has its own dedicated spec
// (QuestionList.test.tsx), so here we stub it to a marker to keep this spec fast and to
// assert the Rating branch is reached.
vi.mock('./QuestionList', () => ({
  QuestionList: ({ question }: { question: { id: string } }) => (
    <div data-testid="question-list-stub">QuestionList:{question.id}</div>
  ),
}));

// Helper: render a single FormItem inside a real antd Form so antd injects value/onChange
// and runs validation. The caller owns the `onFinish` spy so we can assert submitted values.
function renderItem(
  item: StepFormItem,
  onFinish: ReturnType<typeof vi.fn>,
  initialValues: Record<string, unknown> = {},
) {
  render(
    <Form onFinish={onFinish} initialValues={initialValues}>
      <FormItem item={item} form={undefined as never} stepId={FeedbackStepId.Introduction} />
      <button type="submit">submit</button>
    </Form>,
  );
}

// We pass `form={undefined}` for items that never touch `form` (every branch except Radio,
// whose NestedRadio child needs a real form). For the Radio case we render with a real form.

describe('FormItem branches', () => {
  it('renders a TextArea and submits its typed value', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Comment',
      placeholder: 'Comment about skills',
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    const textarea = screen.getByPlaceholderText('Comment about skills');
    await user.type(textarea, 'Great student');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ comment: 'Great student' }));
  });

  it('blocks submit and shows "Required" for an empty required TextArea', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Comment',
      required: true,
      placeholder: 'Comment',
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('renders a text Input and submits its value', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'name',
      type: InputType.Input,
      title: 'Name',
      inputType: 'text',
      placeholder: 'Enter name',
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    await user.type(screen.getByPlaceholderText('Enter name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: 'Ada' }));
  });

  it('renders a number Input (narrow style) and submits a numeric string', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'finalScore',
      type: InputType.Input,
      title: 'Final Score',
      inputType: 'number',
      min: 0,
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '42');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ finalScore: '42' }));
  });

  it('renders RadioButton options (with description) and submits the chosen id', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'englishCertificate',
      type: InputType.RadioButton,
      title: 'English',
      required: true,
      description: 'Certified level',
      options: [
        { id: 'none', title: 'No certificate' },
        { id: 'B1', title: 'B1' },
        { id: 'B2', title: 'B2' },
      ],
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    expect(screen.getByText('Certified level')).toBeInTheDocument();
    // antd Radio.Button puts `pointer-events: none` on the underlying input and handles
    // clicks on the visible label, so click the label text like a real user would.
    await user.click(screen.getByText('B1'));
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ englishCertificate: 'B1' }));
  });

  it('shows "Required" for a required RadioButton left unselected', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'englishCertificate',
      type: InputType.RadioButton,
      title: 'English',
      required: true,
      options: [{ id: 'A1', title: 'A1' }],
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('renders a Checkbox.Group and submits the checked ids as an array', async () => {
    const user = userEvent.setup();
    const item: StepFormItem = {
      id: 'isGoodCandidate',
      type: InputType.Checkbox,
      title: 'Good candidate?',
      options: [
        { id: 'true', title: 'Good candidate' },
        { id: 'maybe', title: 'Maybe' },
      ],
    };
    const onFinish = vi.fn();
    renderItem(item, onFinish);

    await user.click(screen.getByRole('checkbox', { name: 'Good candidate' }));
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ isGoodCandidate: ['true'] }));
  });

  it('delegates the Rating type to QuestionList', () => {
    const item: StepFormItem = {
      id: 'questions',
      type: InputType.Rating,
      title: 'Questions',
      questions: [{ id: 'q1', title: 'Q1' }],
    };
    render(
      <Form>
        <FormItem item={item} form={undefined as never} stepId={FeedbackStepId.Theory} />
      </Form>,
    );

    expect(screen.getByTestId('question-list-stub')).toHaveTextContent('QuestionList:questions');
  });

  it('renders nothing for an unknown item type (default branch)', () => {
    render(
      <Form>
        <FormItem
          item={{ id: 'x', title: 'x', type: 'totally-unknown' } as unknown as StepFormItem}
          form={undefined as never}
          stepId={FeedbackStepId.Theory}
        />
      </Form>,
    );
    // Form renders, but no form control was produced by FormItem.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

// The Radio branch wires a NestedRadio child that needs a live form instance.
describe('FormItem Radio + nested conditional (real form)', () => {
  function RadioHarness({ children }: { children: (form: ReturnType<typeof Form.useForm>[0]) => ReactNode }) {
    const [form] = Form.useForm();
    return <Form form={form}>{children(form)}</Form>;
  }

  const radioItem: StepFormItem = {
    id: 'interviewResult',
    type: InputType.Radio,
    title: 'Show up?',
    required: true,
    options: [
      { id: 'completed', title: "Yes, it's ok." },
      {
        id: 'missed',
        title: 'No, failed.',
        options: [
          { id: 'reason', title: 'Has a reason.' },
          { id: 'ignores', title: 'Ignores mentor.' },
        ],
      },
    ],
  };

  it('shows nested sub-options only after the parent option with children is selected', async () => {
    const user = userEvent.setup();
    render(
      <RadioHarness>
        {form => <FormItem item={radioItem} form={form} stepId={FeedbackStepId.Introduction} />}
      </RadioHarness>,
    );

    // Initially nested reasons are hidden.
    expect(screen.queryByRole('radio', { name: 'Has a reason.' })).not.toBeInTheDocument();

    // Selecting "No, failed." (which has child options) reveals the nested radios.
    await user.click(screen.getByRole('radio', { name: 'No, failed.' }));
    expect(await screen.findByRole('radio', { name: 'Has a reason.' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Ignores mentor.' })).toBeInTheDocument();

    // Selecting the option WITHOUT children hides the nested group again.
    await user.click(screen.getByRole('radio', { name: "Yes, it's ok." }));
    await waitFor(() => expect(screen.queryByRole('radio', { name: 'Has a reason.' })).not.toBeInTheDocument());
  });

  it('does not render a nested group for a childless option', () => {
    const user = userEvent.setup();
    render(
      <RadioHarness>
        {form => <FormItem item={radioItem} form={form} stepId={FeedbackStepId.Introduction} />}
      </RadioHarness>,
    );
    // "Yes, it's ok." has no `options`, so NestedRadio returns null → no extra radios.
    void user;
    expect(screen.getAllByRole('radio')).toHaveLength(2); // only the two top-level options
  });
});

// StepForm wires the initial-values derivation (getInitialQuestions): an Input item with a
// defaultValue should pre-fill, and Back/Next labels depend on isFirst/isLast.
describe('<StepForm /> initial values + navigation labels', () => {
  function makeStep(items: StepFormItem[], values?: FeedbackStep['values']): FeedbackStep {
    return {
      id: FeedbackStepId.Decision,
      title: 'Mentor decision',
      description: 'desc',
      stepperDescription: 'stepper',
      items,
      isCompleted: false,
      values,
    };
  }

  it('pre-fills an Input item from its defaultValue when the step has no saved values', () => {
    const step = makeStep([
      {
        id: 'finalScore',
        type: InputType.Input,
        title: 'Final Score',
        inputType: 'number',
        defaultValue: 77,
        min: 0,
      },
    ]);
    render(<StepForm step={step} next={vi.fn()} back={vi.fn()} isFirst isLast={false} onValuesChange={vi.fn()} />);

    // <input type="number"> → jest-dom compares numerically.
    expect(screen.getByRole('spinbutton')).toHaveValue(77);
  });

  it('prefers saved step values over the template defaults', () => {
    const step = makeStep(
      [{ id: 'finalScore', type: InputType.Input, title: 'Final Score', inputType: 'number', defaultValue: 77 }],
      { finalScore: 12 },
    );
    render(<StepForm step={step} next={vi.fn()} back={vi.fn()} isFirst isLast={false} onValuesChange={vi.fn()} />);

    expect(screen.getByRole('spinbutton')).toHaveValue(12);
  });

  it('hides Back and shows "Next" on the first non-final step', () => {
    const step = makeStep([{ id: 'comment', type: InputType.TextArea, title: 'c', placeholder: 'c' }]);
    render(<StepForm step={step} next={vi.fn()} back={vi.fn()} isFirst isLast={false} onValuesChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('shows Back and "Submit" on a final, non-first step and calls back on click', async () => {
    const user = userEvent.setup();
    const back = vi.fn();
    const step = makeStep([{ id: 'comment', type: InputType.TextArea, title: 'c', placeholder: 'c' }]);
    render(<StepForm step={step} next={vi.fn()} back={back} isFirst={false} isLast onValuesChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('does not call next and runs onFinishFailed when a required field is empty on submit', async () => {
    const user = userEvent.setup();
    const next = vi.fn();
    const step = makeStep([{ id: 'comment', type: InputType.TextArea, title: 'c', required: true, placeholder: 'c' }]);
    render(<StepForm step={step} next={next} back={vi.fn()} isFirst isLast onValuesChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Validation fails → onFinishFailed (scrollToField) runs, next is never called.
    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with the collected values on a valid submit', async () => {
    const user = userEvent.setup();
    const next = vi.fn();
    const step = makeStep([{ id: 'comment', type: InputType.TextArea, title: 'c', placeholder: 'type' }]);
    render(<StepForm step={step} next={next} back={vi.fn()} isFirst isLast onValuesChange={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('type'), 'all good');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(next).toHaveBeenCalledWith({ comment: 'all good' }));
  });

  it('reports value changes via onValuesChange as the user types', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    const step = makeStep([{ id: 'comment', type: InputType.TextArea, title: 'c', placeholder: 'type here' }]);
    render(
      <StepForm step={step} next={vi.fn()} back={vi.fn()} isFirst isLast={false} onValuesChange={onValuesChange} />,
    );

    await user.type(screen.getByPlaceholderText('type here'), 'x');
    await waitFor(() => expect(onValuesChange).toHaveBeenCalled());
    const [, allValues] = onValuesChange.mock.calls.at(-1) as [unknown, Record<string, unknown>];
    expect(allValues).toMatchObject({ comment: 'x' });
  });
});

// A focused check that nested options live in the same group as their parent.
describe('FormItem Radio nested group structure', () => {
  it('nests sub-options under the selected parent', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [form] = Form.useForm();
      return (
        <Form form={form}>
          <FormItem
            item={{
              id: 'interviewResult',
              type: InputType.Radio,
              title: 'Show up?',
              required: true,
              options: [
                {
                  id: 'missed',
                  title: 'No, failed.',
                  options: [{ id: 'reason', title: 'Has a reason.' }],
                },
              ],
            }}
            form={form}
            stepId={FeedbackStepId.Introduction}
          />
        </Form>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole('radio', { name: 'No, failed.' }));
    const groups = screen.getAllByRole('radiogroup');
    // Outer group + the revealed nested group.
    expect(groups.length).toBeGreaterThanOrEqual(2);
    expect(within(groups[groups.length - 1]).getByRole('radio', { name: 'Has a reason.' })).toBeInTheDocument();
  });
});
