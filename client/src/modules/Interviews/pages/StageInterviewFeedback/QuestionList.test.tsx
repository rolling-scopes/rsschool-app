// antd Rate / DeleteOutlined icon expose state only via CSS classes (no ARIA role), so the
// row-count and delete-icon assertions reach into the DOM by class — intentional here.
/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { FeedbackStepId, QuestionItem } from '@client/data/interviews/technical-screening';
import { InputType } from '@client/data/interviews';

// Brittle-widget stub: antd v6 `Form.useWatch` on a `Form.List` field returns the internal
// watch-store object (not the array) on first paint in jsdom, crashing QuestionList's
// `formQuestions?.some(...)`. Everything else in antd stays real; we only repair useWatch by
// reading the live field value from the passed form instance (value/onChange contract intact).
vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof import('antd');
  const RealForm = actual.Form;
  const realUseWatch = RealForm.useWatch;
  function useWatch(this: unknown, ...args: unknown[]) {
    const opts = args[1] as { form?: import('antd').FormInstance } | undefined;
    if (opts?.form) {
      return opts.form.getFieldValue(args[0] as string | string[]);
    }
    return (realUseWatch as (...a: unknown[]) => unknown).apply(this, args);
  }
  const Form = Object.create(
    Object.getPrototypeOf(RealForm),
    Object.getOwnPropertyDescriptors(RealForm),
  ) as typeof RealForm;
  (Form as { useWatch: typeof useWatch }).useWatch = useWatch;
  return { ...actual, Form };
});

import { Form } from 'antd';
import { QuestionList } from './QuestionList';
import { StepForm } from './StepForm';

const baseQuestions = [
  { id: 'html', title: 'HTML/CSS question', topic: 'HTML/CSS' },
  { id: 'oop', title: 'OOP question', topic: 'CS' },
];
const poolOnly = { id: 'algorithms', title: 'Algorithms question', topic: 'CS' };

function makeQuestion(overrides: Partial<QuestionItem> = {}): QuestionItem {
  return {
    id: 'questions',
    title: 'Questions',
    type: InputType.Rating,
    required: true,
    tooltips: ['a', 'b', 'c', 'd', 'e'],
    questions: baseQuestions,
    examples: [...baseQuestions, poolOnly],
    ...overrides,
  };
}

// Render QuestionList inside a real Form with the same initial structure the StepForm uses.
function Harness({
  question = makeQuestion(),
  stepId = FeedbackStepId.Theory,
  onFinish = vi.fn(),
  initialQuestions = baseQuestions,
}: {
  question?: QuestionItem;
  stepId?: FeedbackStepId;
  onFinish?: (v: unknown) => void;
  initialQuestions?: typeof baseQuestions;
} = {}): ReactNode {
  function Inner() {
    const [form] = Form.useForm();
    return (
      <Form form={form} initialValues={{ [question.id]: initialQuestions }} onFinish={onFinish}>
        <QuestionList form={form} question={question} stepId={stepId} />
        <button type="submit">submit</button>
      </Form>
    );
  }
  return <Inner />;
}

describe('<QuestionList /> question picker + custom + remove', () => {
  it('renders the initial questions with topic + title and a Rate per row', () => {
    render(Harness());

    expect(screen.getByText('HTML/CSS question')).toBeInTheDocument();
    expect(screen.getByText('OOP question')).toBeInTheDocument();
    // Two rows → two Rate widgets, each exposing 5 radio stars.
    const rates = document.querySelectorAll('.ant-rate');
    expect(rates).toHaveLength(2);
  });

  it('shows "Add from list" only while there are unused pool questions', () => {
    // examples contains an extra pool question (algorithms) not in initial → button shown.
    render(Harness());
    expect(screen.getByRole('button', { name: /Add from list/i })).toBeInTheDocument();
  });

  it('hides "Add from list" when every example is already added', () => {
    render(Harness({ question: makeQuestion({ examples: baseQuestions }) }));
    expect(screen.queryByRole('button', { name: /Add from list/i })).not.toBeInTheDocument();
    // The custom-question button is always available.
    expect(screen.getByRole('button', { name: /Custom question/i })).toBeInTheDocument();
  });

  it('labels the custom button "Custom task" on the Practice step and "Custom question" otherwise', () => {
    const { unmount } = render(Harness({ stepId: FeedbackStepId.Practice }));
    expect(screen.getByRole('button', { name: /Custom task/i })).toBeInTheDocument();
    unmount();

    render(Harness({ stepId: FeedbackStepId.Theory }));
    expect(screen.getByRole('button', { name: /Custom question/i })).toBeInTheDocument();
  });

  it('opens the picker modal, validates an empty selection, then adds a pooled question', async () => {
    const user = userEvent.setup();
    render(Harness());

    await user.click(screen.getByRole('button', { name: /Add from list/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Add question')).toBeInTheDocument();
    // Only the not-yet-added pool question (algorithms) is offered.
    expect(within(dialog).getByText('Algorithms question')).toBeInTheDocument();
    expect(within(dialog).queryByText('HTML/CSS question')).not.toBeInTheDocument();

    // Submitting with nothing selected → validation error, modal stays open.
    await user.click(within(dialog).getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('Please select questions to add to the feedback')).toBeInTheDocument();

    // Select the pool question and confirm → it is appended as a new row.
    await user.click(within(dialog).getByRole('checkbox', { name: 'Algorithms question' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Algorithms question')).toBeInTheDocument();
    // Now three rows → three Rate widgets.
    await waitFor(() => expect(document.querySelectorAll('.ant-rate')).toHaveLength(3));
  });

  it('cancels the picker modal without adding anything', async () => {
    const user = userEvent.setup();
    render(Harness());

    await user.click(screen.getByRole('button', { name: /Add from list/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Cancel/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.querySelectorAll('.ant-rate')).toHaveLength(2);
  });

  it('adds a custom question (typed) as a new row and ignores blank input', async () => {
    const user = userEvent.setup();
    render(Harness());

    await user.click(screen.getByRole('button', { name: /Custom question/i }));
    const input = await screen.findByPlaceholderText('Enter your question');

    // Blank/whitespace input → Save is a no-op (card stays, no new row).
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(document.querySelectorAll('.ant-rate')).toHaveLength(2);

    await user.type(input, '  Explain closures  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Explain closures')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll('.ant-rate')).toHaveLength(3));
  });

  it('adds a custom question via Enter key (onPressEnter)', async () => {
    const user = userEvent.setup();
    render(Harness());

    await user.click(screen.getByRole('button', { name: /Custom question/i }));
    const input = await screen.findByPlaceholderText('Enter your question');

    await user.type(input, 'Event loop?{Enter}');

    expect(await screen.findByText('Event loop?')).toBeInTheDocument();
  });

  it('cancels the custom-question card without adding', async () => {
    const user = userEvent.setup();
    render(Harness());

    await user.click(screen.getByRole('button', { name: /Custom question/i }));
    await screen.findByPlaceholderText('Enter your question');
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => expect(screen.queryByPlaceholderText('Enter your question')).not.toBeInTheDocument());
    expect(document.querySelectorAll('.ant-rate')).toHaveLength(2);
  });

  it('removes a question row (delete icon shown only when more than one row)', async () => {
    const user = userEvent.setup();
    render(Harness());

    // Two rows → delete icons present.
    const deletes = document.querySelectorAll('.anticon-delete');
    expect(deletes.length).toBe(2);

    await user.click(deletes[0] as Element);

    await waitFor(() => expect(document.querySelectorAll('.ant-rate')).toHaveLength(1));
    // With a single row left, the delete icon disappears.
    expect(document.querySelectorAll('.anticon-delete')).toHaveLength(0);
  });

  it('submits the rated question values through the form', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(Harness({ onFinish }));

    // Each row's Rate is `required`, so rate BOTH rows or validation blocks submit.
    const rates = document.querySelectorAll('.ant-rate');
    const firstRowStars = within(rates[0] as HTMLElement).getAllByRole('radio');
    const secondRowStars = within(rates[1] as HTMLElement).getAllByRole('radio');
    await user.click(firstRowStars[3]); // value 4
    await user.click(secondRowStars[1]); // value 2

    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const submitted = onFinish.mock.calls[0][0] as { questions: Record<number, { value?: number }> };
    // The Form.List stores each row's rating under its `value` field, indexed by row.
    // (The id/title metadata is carried separately via form.getFieldValue, not in the
    // submitted list payload — so we assert on the captured ratings at indices 0 and 1.)
    expect(submitted.questions[0]).toMatchObject({ value: 4 });
    expect(submitted.questions[1]).toMatchObject({ value: 2 });
  });
});

// StepForm with a Rating step but no saved values exercises getInitialQuestions' default
// init (acc[id] = item.questions), which seeds the Form.List from the template questions.
describe('<StepForm /> Rating step default initialization', () => {
  it('seeds the question list from the template when the step has no saved values', () => {
    const step = {
      id: FeedbackStepId.Theory,
      title: 'Theory',
      description: 'desc',
      stepperDescription: 'stepper',
      isCompleted: false,
      items: [
        {
          id: 'questions',
          type: InputType.Rating,
          title: 'Questions',
          required: true,
          tooltips: ['a', 'b', 'c', 'd', 'e'],
          questions: baseQuestions,
          examples: baseQuestions,
        },
      ],
    };
    render(
      <StepForm step={step as never} next={vi.fn()} back={vi.fn()} isFirst isLast={false} onValuesChange={vi.fn()} />,
    );

    // Both template questions are seeded as rows.
    expect(screen.getByText('HTML/CSS question')).toBeInTheDocument();
    expect(screen.getByText('OOP question')).toBeInTheDocument();
    expect(document.querySelectorAll('.ant-rate')).toHaveLength(2);
  });
});
