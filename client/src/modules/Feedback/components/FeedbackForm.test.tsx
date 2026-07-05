import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateStudentFeedbackDtoEnglishLevelEnum as EnglishLevelEnum,
  CreateStudentFeedbackDtoRecommendationEnum as RecommendationEnum,
  SoftSkillEntryIdEnum,
  SoftSkillEntryValueEnum,
  MentorStudentDto,
} from '@client/api';
import { FeedbackForm } from './FeedbackForm';

// UserSearch is a debounced, async, search-driven antd Select (a genuinely brittle
// widget). Replace it with a minimal controlled <select> that preserves the
// value/onChange contract Form.Item injects via cloneElement, so we can drive the
// "student change" branch like a user picking an option.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: (props: {
    value?: number | string;
    onChange?: (value: string) => void;
    defaultValues?: { id: number; name: string }[];
  }) => (
    <select data-testid="user-search" value={props.value ?? ''} onChange={e => props.onChange?.(e.target.value)}>
      <option value="">none</option>
      {(props.defaultValues ?? []).map(s => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  ),
}));

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }));
vi.mock('next/router', () => ({
  useRouter: () => ({ push: routerPush, query: {}, pathname: '/feedback' }),
}));

function makeStudent(overrides: Partial<MentorStudentDto> = {}): MentorStudentDto {
  return {
    name: 'Alice',
    githubId: 'alice',
    id: 1,
    active: true,
    cityName: null,
    countryName: null,
    totalScore: 0,
    rank: 0,
    feedbacks: [],
    ...overrides,
  } as MentorStudentDto;
}

const studentWithFeedback = makeStudent({
  name: 'Bob',
  githubId: 'bob',
  id: 2,
  feedbacks: [
    {
      id: 99,
      createdDate: '2024-01-01',
      updatedDate: '2024-01-01',
      recommendation: RecommendationEnum.Hire,
      englishLevel: EnglishLevelEnum.B2,
      content: {
        suggestions: 'Keep practicing',
        recommendationComment: 'Great work',
        softSkills: [
          { id: SoftSkillEntryIdEnum.Responsible, value: SoftSkillEntryValueEnum.Excellent },
          { id: SoftSkillEntryIdEnum.TeamPlayer, value: SoftSkillEntryValueEnum.Good },
          { id: SoftSkillEntryIdEnum.Communicable, value: SoftSkillEntryValueEnum.Fair },
        ],
      },
    },
  ] as MentorStudentDto['feedbacks'],
});

describe('<FeedbackForm />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the recommendation radios, comment field, english levels and soft-skill rates', () => {
    render(<FeedbackForm studentId={1} students={[makeStudent()]} onSubmit={vi.fn()} />);

    // Recommendation radios.
    expect(screen.getByRole('radio', { name: /^hire$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /not hire/i })).toBeInTheDocument();

    // Conditional comment field is always present (label "What was good").
    expect(screen.getByLabelText(/what was good/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what could be improved/i)).toBeInTheDocument();

    // English levels rendered uppercased.
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
      expect(screen.getByRole('radio', { name: level })).toBeInTheDocument();
    });

    // Three soft-skill Rate widgets, labelled by their skill names.
    expect(screen.getByText('Responsible')).toBeInTheDocument();
    expect(screen.getByText('Good team player')).toBeInTheDocument();
    expect(screen.getByText('Communicable')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
  });

  it('blocks submit and shows required errors when recommendation and comment are empty', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<FeedbackForm studentId={1} students={[makeStudent()]} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    // Two required fields (recommendation + recommendationComment) -> two "Required" messages.
    await waitFor(() => {
      expect(screen.getAllByText('Required')).toHaveLength(2);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the full payload to onSubmit when required fields are filled (Hire, english level, soft skills)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<FeedbackForm studentId={1} students={[makeStudent()]} onSubmit={onSubmit} />);

    // antd Radio.Button inner input has `pointer-events: none` in jsdom, which
    // userEvent.click rejects; fireEvent.click on the radio is the supported path.
    fireEvent.click(screen.getByRole('radio', { name: /^hire$/i }));
    await user.type(screen.getByLabelText(/what was good/i), 'Excellent communication');
    await user.type(screen.getByLabelText(/what could be improved/i), 'More tests');
    fireEvent.click(screen.getByRole('radio', { name: 'B1' }));

    // Rate the first soft-skill star = 1 (-> Poor). In antd v6 a Rate exposes its
    // stars as elements with role="radio" and accessible name "star star"; the
    // recommendation/english radios have distinct names, so filtering by /star/i
    // yields only Rate stars. Index 0 = first star of the first Rate widget.
    const stars = screen.getAllByRole('radio', { name: /star/i });
    fireEvent.click(stars[0]);

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    const [studentId, payload, existingFeedbackId] = onSubmit.mock.calls[0];
    expect(studentId).toBe(1);
    expect(existingFeedbackId).toBeUndefined();
    expect(payload.recommendation).toBe(RecommendationEnum.Hire);
    expect(payload.englishLevel).toBe(EnglishLevelEnum.B1);
    expect(payload.content.recommendationComment).toBe('Excellent communication');
    expect(payload.content.suggestions).toBe('More tests');
    // First soft skill rated 1 -> Poor; others unrated -> None.
    expect(payload.content.softSkills).toEqual([
      { id: SoftSkillEntryIdEnum.Responsible, value: SoftSkillEntryValueEnum.Poor },
      { id: SoftSkillEntryIdEnum.TeamPlayer, value: SoftSkillEntryValueEnum.None },
      { id: SoftSkillEntryIdEnum.Communicable, value: SoftSkillEntryValueEnum.None },
    ]);
  });

  it('defaults englishLevel to Unknown and suggestions to empty string when left blank', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<FeedbackForm studentId={1} students={[makeStudent()]} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: /not hire/i }));
    await user.type(screen.getByLabelText(/what was good/i), 'ok');

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [, payload] = onSubmit.mock.calls[0];
    expect(payload.recommendation).toBe(RecommendationEnum.NotHire);
    expect(payload.englishLevel).toBe(EnglishLevelEnum.Unknown);
    expect(payload.content.suggestions).toBe('');
  });

  it('prefills values from an existing feedback and submits with the existing feedback id', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<FeedbackForm studentId={2} students={[studentWithFeedback]} onSubmit={onSubmit} />);

    // Prefilled comment and suggestions.
    await waitFor(() => {
      expect(screen.getByLabelText(/what was good/i)).toHaveValue('Great work');
    });
    expect(screen.getByLabelText(/what could be improved/i)).toHaveValue('Keep practicing');
    // Prefilled Hire radio is checked.
    expect(screen.getByRole('radio', { name: /^hire$/i })).toBeChecked();
    // Prefilled english level B2 is checked.
    expect(screen.getByRole('radio', { name: 'B2' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [studentId, payload, existingFeedbackId] = onSubmit.mock.calls[0];
    expect(studentId).toBe(2);
    expect(existingFeedbackId).toBe(99);
    // Soft skill values mapped back to enums from the prefilled numeric ratings.
    expect(payload.content.softSkills).toEqual([
      { id: SoftSkillEntryIdEnum.Responsible, value: SoftSkillEntryValueEnum.Excellent },
      { id: SoftSkillEntryIdEnum.TeamPlayer, value: SoftSkillEntryValueEnum.Good },
      { id: SoftSkillEntryIdEnum.Communicable, value: SoftSkillEntryValueEnum.Fair },
    ]);
  });

  it('resets the form and pushes the new studentId to the router when the student changes', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackForm studentId={1} students={[makeStudent(), studentWithFeedback]} onSubmit={onSubmit} />);

    // Type something into the comment, then switch student -> form resets.
    fireEvent.change(screen.getByLabelText(/what was good/i), { target: { value: 'temp text' } });
    expect(screen.getByLabelText(/what was good/i)).toHaveValue('temp text');

    // Switch to the student that HAS feedback -> resets + prefills from their feedback.
    fireEvent.change(screen.getByTestId('user-search'), { target: { value: '2' } });

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith({ pathname: '/feedback', query: { studentId: 2 } }, undefined, {
        shallow: true,
      });
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/what was good/i)).toHaveValue('Great work');
    });
  });

  it('resets to a blank form when switching to a student without existing feedback', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackForm studentId={2} students={[studentWithFeedback, makeStudent()]} onSubmit={onSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/what was good/i)).toHaveValue('Great work');
    });

    // Switch to the student WITHOUT feedback (id 1) -> blank form.
    fireEvent.change(screen.getByTestId('user-search'), { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/what was good/i)).toHaveValue('');
    });
    expect(routerPush).toHaveBeenCalledWith({ pathname: '/feedback', query: { studentId: 1 } }, undefined, {
      shallow: true,
    });
  });

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<FeedbackForm studentId={1} students={[makeStudent()]} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: /^hire$/i }));
    await user.type(screen.getByLabelText(/what was good/i), 'ok');
    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(await screen.findByText(/error occurred while creating feedback/i)).toBeInTheDocument();
  });
});
