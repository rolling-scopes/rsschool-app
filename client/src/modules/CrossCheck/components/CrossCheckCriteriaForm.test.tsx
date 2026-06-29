import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum, CrossCheckSolutionReviewDto } from '@client/api';
import { CrossCheckCriteriaForm } from './CrossCheckCriteriaForm';

function makeCriteria(): CrossCheckCriteriaDataDto[] {
  return [
    {
      key: 't1',
      text: 'Layout section',
      type: CrossCheckCriteriaDataDtoTypeEnum.Title,
      index: 0,
    } as CrossCheckCriteriaDataDto,
    {
      key: 's1',
      text: 'Implements the header',
      type: CrossCheckCriteriaDataDtoTypeEnum.Subtask,
      max: 10,
      point: 0,
    } as CrossCheckCriteriaDataDto,
    {
      key: 'p1',
      text: 'Broken layout',
      type: CrossCheckCriteriaDataDtoTypeEnum.Penalty,
      max: 5,
      point: 0,
    } as CrossCheckCriteriaDataDto,
  ];
}

// Harness drives the controlled criteriaData/score/isSkipped props the way the
// real parent (the cross-check submission page) does.
function Harness({
  initialCriteria,
  initialData,
  maxScore = 100,
}: {
  initialCriteria: CrossCheckCriteriaDataDto[] | undefined;
  initialData?: CrossCheckSolutionReviewDto;
  // `null` is mapped to an undefined maxScore prop (distinct from the 100 default).
  maxScore?: number | null;
}) {
  const [criteriaData, setCriteriaData] = useState(initialCriteria);
  const [score, setScore] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  return (
    <>
      <div data-testid="score-value">{score}</div>
      <div data-testid="skipped-value">{String(isSkipped)}</div>
      <CrossCheckCriteriaForm
        maxScore={maxScore ?? undefined}
        score={score}
        setScore={setScore}
        criteriaData={criteriaData}
        setCriteriaData={setCriteriaData}
        initialData={initialData}
        setIsSkipped={setIsSkipped}
        isSkipped={isSkipped}
      />
    </>
  );
}

describe('<CrossCheckCriteriaForm />', () => {
  it('renders criteria, penalty sections and the max-score label', () => {
    render(<Harness initialCriteria={makeCriteria()} maxScore={100} />);

    expect(screen.getByRole('heading', { name: 'Criteria' })).toBeInTheDocument();
    expect(screen.getByText('Layout section')).toBeInTheDocument();
    expect(screen.getByText('Implements the header')).toBeInTheDocument();
    expect(screen.getByText(/Broken layout/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '(Max 100 points)' })).toBeInTheDocument();
  });

  it('recalculates the total score from the criteria points on mount', () => {
    const criteria = makeCriteria();
    criteria[1].point = 7;
    criteria[2].point = -2;
    render(<Harness initialCriteria={criteria} />);

    // 7 + (-2) = 5
    expect(screen.getByTestId('score-value')).toHaveTextContent('5');
  });

  it('uses the initial review score when criteria match the saved data', () => {
    const criteria = makeCriteria();
    const initialData = {
      score: 42,
      criteria: criteria.map(c => ({ ...c })),
    } as CrossCheckSolutionReviewDto;

    render(<Harness initialCriteria={criteria} initialData={initialData} />);

    expect(screen.getByTestId('score-value')).toHaveTextContent('42');
  });

  it('updates the running score as the reviewer scores a subtask', async () => {
    const user = userEvent.setup();
    render(<Harness initialCriteria={makeCriteria()} />);

    const subtaskInput = screen.getAllByRole('spinbutton')[0];
    await user.clear(subtaskInput);
    await user.type(subtaskInput, '8');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('8');
    });
  });

  it('lets the reviewer override the final score with the score input', async () => {
    const user = userEvent.setup();
    render(<Harness initialCriteria={[]} maxScore={50} />);

    // No criteria -> only the final-score InputNumber is rendered.
    const scoreInput = screen.getByRole('spinbutton');
    await user.clear(scoreInput);
    await user.type(scoreInput, '30');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('30');
    });
  });

  it('skips the form after confirming in the dialog and restores it on toggle', async () => {
    const user = userEvent.setup();
    render(<Harness initialCriteria={makeCriteria()} />);

    await user.click(screen.getByRole('button', { name: /Skip cross check form/ }));

    // Confirmation modal appears.
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Yes, skip form/ }));

    await waitFor(() => {
      expect(screen.getByTestId('skipped-value')).toHaveTextContent('true');
    });
    // Criteria are hidden while skipped.
    expect(screen.queryByText('Implements the header')).not.toBeInTheDocument();

    // Button now shows "Show" and toggles back without a dialog.
    await user.click(screen.getByRole('button', { name: /Show cross check form/ }));

    await waitFor(() => {
      expect(screen.getByTestId('skipped-value')).toHaveTextContent('false');
    });
    expect(screen.getByText('Implements the header')).toBeInTheDocument();
  });

  it('does not render the skip button when there are no criteria', () => {
    render(<Harness initialCriteria={[]} />);

    expect(screen.queryByRole('button', { name: /cross check form/ })).not.toBeInTheDocument();
  });

  it('defaults the max score to 100 when maxScore is undefined', () => {
    render(<Harness initialCriteria={[]} maxScore={null} />);

    // maxScore undefined → `maxScore ?? 100` → label shows the 100 default.
    expect(screen.getByRole('heading', { name: '(Max 100 points)' })).toBeInTheDocument();
  });

  it('renders an empty max-score label when maxScore is 0', () => {
    render(<Harness initialCriteria={[]} maxScore={0} />);

    // maxScoreValue 0 is falsy → the label is an empty string (no "(Max … points)" text).
    expect(screen.queryByText(/Max .* points/)).not.toBeInTheDocument();
  });

  // NOTE: `criteriaData` is typed as a required array; passing `undefined` crashes the
  // useEffect at `[...criteriaData]` (L46), so the `criteriaData?.filter(...) ?? []` guard on
  // L41 is defensive against a contract violation that the component cannot actually survive.
  // unreachable: L41 `?? []` requires undefined criteriaData, which crashes the effect.

  it('falls back to a 0 score when the saved review has no score and criteria match', () => {
    const criteria = makeCriteria();
    // initialData has matching criteria but NO score → `initialData?.score ?? 0` → 0.
    const initialData = {
      criteria: criteria.map(c => ({ ...c })),
    } as CrossCheckSolutionReviewDto;

    render(<Harness initialCriteria={criteria} initialData={initialData} />);

    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
  });

  it('sorts unordered initial and current criteria before comparing them', () => {
    // Provide criteria in descending key order so both sort comparators take the `a.key > b.key`
    // (return 1) branch while still matching after sorting → uses the saved score (35).
    const desc = [...makeCriteria()].reverse();
    const initialData = {
      score: 35,
      criteria: [...makeCriteria()].reverse().map(c => ({ ...c })),
    } as CrossCheckSolutionReviewDto;

    render(<Harness initialCriteria={desc} initialData={initialData} />);

    expect(screen.getByTestId('score-value')).toHaveTextContent('35');
  });
});
