import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { StageInterviewFeedback } from './StageInterviewFeedback';
import { InterviewFeedbackDto, ProfileCourseDto, StudentDto, TaskDtoTypeEnum } from '@client/api';
import { StageFeedbackProps } from '../../data';

// --- Boundary & heavy-collaborator mocks -----------------------------------

// Brittle-widget stub: repair antd v6 Form.useWatch on Form.List fields in jsdom
// (see StepContext.test.tsx for the rationale) so the Theory/Practice steps render.
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

// Header pulls in SessionContext, navigation, theme switch, etc. — replace with a marker.
vi.mock('@client/shared/components/Header', () => ({
  Header: ({ title }: { title: string }) => <header>{title}</header>,
}));

// The legacy technical-screening page is dynamically imported as a fallback. next/dynamic
// returns the module's default export; replace the whole page with a marker so we don't
// pull the legacy tree into jsdom.
vi.mock('@client/pages/course/mentor/interview-technical-screening', () => ({
  default: () => <div>Legacy tech screening</div>,
}));

// API boundary: the save call is exercised by StepContext.test.tsx; here just stub it.
vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesInterviewsApi: function CoursesInterviewsApi() {
    return { createInterviewFeedback: vi.fn().mockResolvedValue(undefined) };
  },
}));

// next/dynamic: render the page's `loading` fallback first, then swap in the loaded
// component once the loader resolves — mirroring real next/dynamic behaviour so the
// page's `loading: () => <p>Loading...</p>` branch is exercised too.
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: () => ReactNode }>, options?: { loading?: () => ReactNode }) => {
    const Lazy = (props: Record<string, unknown>) => {
      const [Comp, setComp] = useState<(() => ReactNode) | null>(null);
      useEffect(() => {
        loader().then(m => setComp(() => m.default));
      }, []);
      return Comp ? <Comp {...props} /> : (options?.loading?.() ?? null);
    };
    return Lazy;
  },
}));

// --- Fixtures --------------------------------------------------------------

const student = {
  githubId: 'ada',
  name: 'Ada Lovelace',
  rank: 1,
  totalScore: 100,
  cityName: 'London',
  countryName: 'UK',
} as StudentDto;

function makeProps(feedback: Partial<InterviewFeedbackDto> = {}): StageFeedbackProps {
  return {
    student,
    courseSummary: { totalScore: 1000, studentsCount: 10 },
    interviewFeedback: { isCompleted: false, maxScore: 100, version: 1, ...feedback },
    course: { id: 42, alias: 'rs-2024' } as ProfileCourseDto,
    interviewId: 7,
    type: TaskDtoTypeEnum.StageInterview,
    session: {} as never,
  } as StageFeedbackProps;
}

describe('<StageInterviewFeedback /> (page)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the full feedback form (header, sub-header, first step, student sidebar)', () => {
    render(<StageInterviewFeedback {...makeProps()} />);

    expect(screen.getByRole('banner')).toHaveTextContent('Technical screening');
    expect(screen.getByText('Feedback form')).toBeInTheDocument();
    // First step content.
    expect(screen.getByRole('heading', { level: 3, name: 'Introduction' })).toBeInTheDocument();
    // Sidebar student info.
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    // Sub-header reflects the not-completed state.
    expect(screen.getByText('Uncompleted')).toBeInTheDocument();
  });

  it('falls back to the legacy screening page when the feedback version is 0', async () => {
    render(<StageInterviewFeedback {...makeProps({ version: 0 })} />);

    // The dynamic loading fallback shows first, then the legacy page resolves in.
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Legacy tech screening')).toBeInTheDocument();
    // None of the new-form chrome is rendered.
    expect(screen.queryByText('Feedback form')).not.toBeInTheDocument();
  });

  it('falls back to the legacy screening page when the feedback feature toggle is off', async () => {
    const features = await import('@client/services/features');
    const original = features.featureToggles.feedback;
    features.featureToggles.feedback = false;
    try {
      render(<StageInterviewFeedback {...makeProps({ version: 1 })} />);
      expect(await screen.findByText('Legacy tech screening')).toBeInTheDocument();
      expect(screen.queryByText('Feedback form')).not.toBeInTheDocument();
    } finally {
      features.featureToggles.feedback = original;
    }
  });

  it('marks the sub-header tag "Completed" when the feedback is completed', () => {
    render(<StageInterviewFeedback {...makeProps({ isCompleted: true })} />);

    const tag = screen.getByText('Completed');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass('ant-tag-green');
  });

  it('treats a missing isCompleted flag as "Uncompleted" in the sub-header', () => {
    render(<StageInterviewFeedback {...makeProps({ isCompleted: undefined as unknown as boolean })} />);

    expect(screen.getByText('Uncompleted')).toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });

  it('shows the vertical stepper with every template step', async () => {
    render(<StageInterviewFeedback {...makeProps()} />);

    await waitFor(() => {
      expect(screen.getByText('Interview confirmation')).toBeInTheDocument();
      expect(screen.getByText('Student admission to the mentoring program')).toBeInTheDocument();
    });
  });
});
