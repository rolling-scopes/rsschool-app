// antd Spin/Steps expose state only via CSS classes (no ARIA role), so a few assertions
// reach into the DOM by class — direct node access is intentional and unavoidable here.
/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { StepContextProvider, StepContext } from './StepContext';
import { StepsContent } from './StepsContent';
import { Steps } from './Steps';
import { InterviewFeedbackDto, ProfileCourseDto } from '@client/api';

// --- Boundary mocks --------------------------------------------------------

// Brittle-widget stub: antd v6 `Form.useWatch` on a `Form.List` field returns the
// internal watch-store object (not the array) on first paint in jsdom, which crashes
// QuestionList's `formQuestions?.some(...)` on the Theory/Practice steps. Everything
// else in antd stays real; we only repair useWatch by reading the live field value
// from the form instance (preserving the value/onChange contract).
vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof import('antd');
  const RealForm = actual.Form;
  const realUseWatch = RealForm.useWatch;
  // Only intervene when a concrete form instance is passed (QuestionList does this);
  // otherwise defer to the real useWatch so nothing else recurses.
  function useWatch(this: unknown, ...args: unknown[]) {
    const opts = args[1] as { form?: import('antd').FormInstance } | undefined;
    if (opts?.form) {
      return opts.form.getFieldValue(args[0] as string | string[]);
    }
    return (realUseWatch as (...a: unknown[]) => unknown).apply(this, args);
  }
  // Clone the Form component object (forwardRef render object + static members) so we
  // never mutate the shared antd.Form — mutation would make realUseWatch point back at
  // us → infinite recursion. The clone keeps prototype + descriptors, only swaps useWatch.
  const Form = Object.create(
    Object.getPrototypeOf(RealForm),
    Object.getOwnPropertyDescriptors(RealForm),
  ) as typeof RealForm;
  (Form as { useWatch: typeof useWatch }).useWatch = useWatch;
  return { ...actual, Form };
});

// The only network boundary: CoursesInterviewsApi.createInterviewFeedback.
// vi.hoisted so the spy is available to the module factory below and to assertions.
const { createInterviewFeedback } = vi.hoisted(() => ({
  createInterviewFeedback: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesInterviewsApi: function CoursesInterviewsApi() {
    return { createInterviewFeedback };
  },
}));

// Controllable override for the template handler: by default delegate to the real
// pure-logic implementation; when `emptyStepsOverride.value` is true, return a feedback
// with NO steps so the provider's `activeStep` is undefined. This is the only way to reach
// the defensive `activeStep ? … : false` / `if (activeStep)` guards, since the real template
// is always non-empty.
const { emptyStepsOverride } = vi.hoisted(() => ({ emptyStepsOverride: { value: false } }));

vi.mock('./feedbackTemplateHandler', async () => {
  const actual = (await vi.importActual('./feedbackTemplateHandler')) as typeof import('./feedbackTemplateHandler');
  return {
    ...actual,
    getFeedbackFromTemplate: (...args: Parameters<typeof actual.getFeedbackFromTemplate>) =>
      emptyStepsOverride.value
        ? { steps: [], isCompleted: false, version: 1 }
        : actual.getFeedbackFromTemplate(...args),
  };
});

// next/router is aliased to src/__mocks__/next/router by vitest config. Grab its push spy.
import { useRouter } from 'next/router';
const routerPush = (useRouter() as unknown as { push: ReturnType<typeof vi.fn> }).push;

// --- Fixtures --------------------------------------------------------------

const course = { id: 42, alias: 'rs-2024' } as ProfileCourseDto;

function makeFeedback(overrides: Partial<InterviewFeedbackDto> = {}): InterviewFeedbackDto {
  return {
    isCompleted: false,
    maxScore: 100,
    version: 1,
    ...overrides,
  };
}

function renderProvider(feedback: InterviewFeedbackDto = makeFeedback()) {
  return render(
    <StepContextProvider
      interviewFeedback={feedback}
      course={course}
      interviewId={7}
      type="stage-interview"
      interviewMaxScore={feedback.maxScore}
    >
      <StepsContent />
      <Steps />
    </StepContextProvider>,
  );
}

// A tiny consumer that surfaces the raw context API for direct-state assertions.
function ContextProbe() {
  const { activeStepIndex, isFinalStep, steps } = useContext(StepContext);
  return (
    <div>
      <span data-testid="active-index">{activeStepIndex}</span>
      <span data-testid="is-final">{String(isFinalStep)}</span>
      <span data-testid="step-count">{steps.length}</span>
    </div>
  );
}

// Helper: select the "Yes, it's ok." radio on the Introduction step.
async function answerIntroductionAsConducted(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /Yes, it's ok\./i }));
}

describe('<StepContextProvider /> (multi-step feedback container)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts on the Introduction step (step 0) with 5 steps total', () => {
    renderProvider();
    render(
      <StepContextProvider
        interviewFeedback={makeFeedback()}
        course={course}
        interviewId={7}
        type="stage-interview"
        interviewMaxScore={100}
      >
        <ContextProbe />
      </StepContextProvider>,
    );

    const [probe] = screen.getAllByTestId('active-index');
    expect(probe).toHaveTextContent('0');
    expect(screen.getByTestId('step-count')).toHaveTextContent('5');
    expect(screen.getByTestId('is-final')).toHaveTextContent('false');
    // The Introduction title and Next button (not Submit, since not final).
    expect(screen.getByRole('heading', { level: 3, name: 'Introduction' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('blocks Next while a required field is empty (no API call, stays on step 0)', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Required')).toBeInTheDocument();
    await waitFor(() => expect(createInterviewFeedback).not.toHaveBeenCalled());
    // Still on Introduction.
    expect(screen.getByRole('heading', { level: 3, name: 'Introduction' })).toBeInTheDocument();
  });

  it('saves the Introduction step and advances to Theory, calling the API with the exact payload', async () => {
    const user = userEvent.setup();
    renderProvider();

    await answerIntroductionAsConducted(user);
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(createInterviewFeedback).toHaveBeenCalledTimes(1));

    const [courseId, interviewId, type, payload] = createInterviewFeedback.mock.calls[0];
    expect(courseId).toBe(42);
    expect(interviewId).toBe(7);
    expect(type).toBe('stage-interview');
    expect(payload).toMatchObject({
      isCompleted: false,
      version: 1,
      // interview conducted → decision/candidate computed from later (still-empty) steps.
      isGoodCandidate: undefined,
    });
    // The persisted json must record the Introduction answer on the intro step.
    const introStep = (payload.json as { steps: Record<string, { isCompleted: boolean; values?: object }> }).steps
      .intro;
    expect(introStep).toEqual({
      isCompleted: true,
      values: expect.objectContaining({ interviewResult: 'completed' }),
    });

    // Advanced to Theory.
    expect(await screen.findByRole('heading', { level: 3, name: 'Theory' })).toBeInTheDocument();
  });

  it('navigates Back from Theory to Introduction without calling the API', async () => {
    const user = userEvent.setup();
    renderProvider();

    await answerIntroductionAsConducted(user);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { level: 3, name: 'Theory' });

    createInterviewFeedback.mockClear();
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { level: 3, name: 'Introduction' })).toBeInTheDocument();
    expect(createInterviewFeedback).not.toHaveBeenCalled();
    // Back is hidden on the first step.
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('marks the interview as missed → becomes final, shows Submit, and completes on submit', async () => {
    const user = userEvent.setup();
    renderProvider();

    // Choosing "No, interview is failed." reveals a nested required reason radio,
    // and flips the form into a "canceled" → final state.
    await user.click(screen.getByRole('radio', { name: /No, interview is failed\./i }));
    await user.click(await screen.findByRole('radio', { name: /Student has a significant reason\./i }));

    // Now the only button is Submit (final step), Back is hidden (still step 0).
    const submit = await screen.findByRole('button', { name: 'Submit' });
    await user.click(submit);

    await waitFor(() => expect(createInterviewFeedback).toHaveBeenCalledTimes(1));
    const payload = createInterviewFeedback.mock.calls[0][3];
    expect(payload).toMatchObject({
      isCompleted: true,
      score: 0,
      // missed interview → decision carries the reason key.
      decision: 'missedWithReason',
      isGoodCandidate: false,
    });
    // Final step → routes back to the interviews list.
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/course/mentor/interviews?course=rs-2024'));
  });

  it('shows an error and stays on the step when the save API rejects', async () => {
    const user = userEvent.setup();
    createInterviewFeedback.mockRejectedValueOnce(new Error('boom'));
    renderProvider();

    await answerIntroductionAsConducted(user);
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(createInterviewFeedback).toHaveBeenCalledTimes(1));
    // Did NOT advance — still on Introduction because saveFeedback rejected.
    expect(await screen.findByRole('heading', { level: 3, name: 'Introduction' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Theory' })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('opens directly on the final Decision step (Submit) when prior steps are already completed', async () => {
    // Pre-fill all steps except Decision as completed; getDefaultStep lands on the last (Decision) step.
    const json = {
      steps: {
        intro: { isCompleted: true, values: { interviewResult: 'completed' } },
        theory: { isCompleted: true, values: { questions: [{ id: 'html', title: 'q', value: 5 }] } },
        practice: { isCompleted: true, values: { questions: [{ id: '1', title: 'q', value: 5 }], comment: 'ok' } },
        english: {
          isCompleted: true,
          values: { englishCertificate: 'none', selfAssessment: 'B1' },
        },
        decision: { isCompleted: false, values: {} },
      },
    };
    renderProvider(makeFeedback({ json }));

    expect(await screen.findByRole('heading', { level: 3, name: 'Mentor decision' })).toBeInTheDocument();
    // Final step → Submit, and Back is available since index > 0.
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders the vertical stepper with one entry per template step', () => {
    renderProvider();
    // antd Steps render each title; the sidebar stepper duplicates titles already in the form,
    // so assert on the stepper-only descriptions.
    expect(screen.getByText('Interview confirmation')).toBeInTheDocument();
    expect(screen.getByText('Talk about theory, how things work')).toBeInTheDocument();
    expect(screen.getByText('Propose technical tasks to solve')).toBeInTheDocument();
    expect(screen.getByText('Check English level')).toBeInTheDocument();
    expect(screen.getByText('Student admission to the mentoring program')).toBeInTheDocument();
  });

  it('falls back to "Step not found" when the active step is missing', () => {
    // Render StepsContent with a hand-built context whose steps array is empty.
    render(
      <StepContext.Provider
        value={{
          activeStepIndex: 0,
          steps: [],
          next: vi.fn(),
          prev: vi.fn(),
          onValuesChange: vi.fn(),
          loading: false,
          isFinalStep: false,
        }}
      >
        <StepsContent />
      </StepContext.Provider>,
    );

    expect(screen.getByText('Step not found')).toBeInTheDocument();
  });

  it('keeps the index at 0 when prev() is invoked on the first step (clamp guard)', async () => {
    const user = userEvent.setup();
    // A consumer that exposes the context `prev` action via a button and reports the index.
    function PrevProbe() {
      const { prev, activeStepIndex } = useContext(StepContext);
      return (
        <div>
          <span data-testid="idx">{activeStepIndex}</span>
          <button type="button" onClick={prev}>
            go-prev
          </button>
        </div>
      );
    }

    render(
      <StepContextProvider
        interviewFeedback={makeFeedback()}
        course={course}
        interviewId={7}
        type="stage-interview"
        interviewMaxScore={100}
      >
        <PrevProbe />
      </StepContextProvider>,
    );

    expect(screen.getByTestId('idx')).toHaveTextContent('0');
    // Invoking prev while already on step 0 must clamp at 0 (cannot go below the first step).
    await user.click(screen.getByRole('button', { name: 'go-prev' }));
    expect(screen.getByTestId('idx')).toHaveTextContent('0');
  });

  it('marks completed prior steps as "finish" and the active one as "process" in the stepper', async () => {
    const user = userEvent.setup();
    renderProvider();

    await answerIntroductionAsConducted(user);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { level: 3, name: 'Theory' });

    // The antd stepper exposes status via aria/class; assert the Introduction item is now finished.
    const introductionConfirmation = screen.getByText('Interview confirmation');
    const introItem = introductionConfirmation.closest('.ant-steps-item');
    expect(introItem).toHaveClass('ant-steps-item-finish');

    const theoryDesc = screen.getByText('Talk about theory, how things work');
    const theoryItem = theoryDesc.closest('.ant-steps-item');
    expect(theoryItem).toHaveClass('ant-steps-item-process');
  });
});

describe('StepContextProvider with no template steps (defensive guards)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emptyStepsOverride.value = true;
  });
  afterEach(() => {
    emptyStepsOverride.value = false;
  });

  it('treats an empty-steps feedback as not-finished and no-ops onValuesChange', async () => {
    const user = userEvent.setup();
    // Consumer that surfaces isFinalStep and lets us fire onValuesChange when activeStep is undefined.
    function EmptyProbe() {
      const { isFinalStep, onValuesChange, steps } = useContext(StepContext);
      return (
        <div>
          <span data-testid="final">{String(isFinalStep)}</span>
          <span data-testid="count">{steps.length}</span>
          <button type="button" onClick={() => onValuesChange({}, {} as never)}>
            change
          </button>
        </div>
      );
    }

    render(
      <StepContextProvider
        interviewFeedback={makeFeedback()}
        course={course}
        interviewId={7}
        type="stage-interview"
        interviewMaxScore={100}
      >
        <EmptyProbe />
      </StepContextProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    // No active step → isInterviewCanceled is skipped, isFinished stays false.
    // isFinalStep = (activeStepIndex === steps.length-1) → 0 === -1 → false, and isFinished false.
    expect(screen.getByTestId('final')).toHaveTextContent('false');

    // onValuesChange with no active step must not throw (the `if (activeStep)` guard short-circuits).
    await user.click(screen.getByRole('button', { name: 'change' }));
    expect(screen.getByTestId('final')).toHaveTextContent('false');
  });
});

describe('StepContext loading spinner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('disables the form via Spin while the save request is in flight', async () => {
    const user = userEvent.setup();
    let resolveSave: (v?: unknown) => void = () => {};
    createInterviewFeedback.mockReturnValueOnce(
      new Promise(resolve => {
        resolveSave = resolve;
      }),
    );

    render(
      <StepContextProvider
        interviewFeedback={makeFeedback()}
        course={course}
        interviewId={7}
        type="stage-interview"
        interviewMaxScore={100}
      >
        <StepsContent />
      </StepContextProvider>,
    );

    await user.click(screen.getByRole('radio', { name: /Yes, it's ok\./i }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // While pending, antd Spin renders the spinning indicator (no ARIA role → class query).
    await waitFor(() => expect(document.querySelector('.ant-spin-spinning')).toBeTruthy());

    // Resolve and the spinner clears.
    resolveSave(undefined);
    await waitFor(() => expect(document.querySelector('.ant-spin-spinning')).toBeFalsy());
  });
});
