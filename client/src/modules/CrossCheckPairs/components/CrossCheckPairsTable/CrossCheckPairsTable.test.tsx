import { render, screen } from '@testing-library/react';
import { CrossCheckPairDto } from '@client/api';
import { CrossCheckPairsTable } from './CrossCheckPairsTable';

function makePair(overrides: Partial<CrossCheckPairDto> = {}): CrossCheckPairDto {
  return {
    student: { name: 'Stu', githubId: 'student-gh', id: 1 },
    checker: { name: 'Chk', githubId: 'checker-gh', id: 2 },
    task: { name: 'Task 1', id: 3 },
    score: 50,
    id: 100,
    comment: 'a comment',
    url: 'https://github.com/student/solution',
    reviewedDate: '2024-03-02T10:00:00.000Z',
    privateRepository: '',
    submittedDate: '2024-03-01T10:00:00.000Z',
    historicalScores: [],
    messages: [],
    ...overrides,
  } as CrossCheckPairDto;
}

function makeProps(overrides: Partial<React.ComponentProps<typeof CrossCheckPairsTable>> = {}) {
  return {
    loaded: true,
    crossCheckPairs: [makePair()],
    pagination: { current: 1, pageSize: 50 },
    onChange: vi.fn(),
    viewComment: vi.fn(),
    ...overrides,
  };
}

describe('<CrossCheckPairsTable />', () => {
  it('renders nothing until loaded is true', () => {
    const { container } = render(<CrossCheckPairsTable {...makeProps({ loaded: false })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the table header columns once loaded', () => {
    render(<CrossCheckPairsTable {...makeProps()} />);

    expect(screen.getByRole('columnheader', { name: /Task/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Checker/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Student/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Score/ })).toBeInTheDocument();
  });

  it('renders a row for each cross-check pair', () => {
    render(
      <CrossCheckPairsTable
        {...makeProps({
          crossCheckPairs: [
            makePair({ id: 1, task: { name: 'Task A', id: 1 } }),
            makePair({ id: 2, task: { name: 'Task B', id: 2 } }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'student-gh' })).toHaveLength(2);
  });

  it('renders an empty table when there are no pairs', () => {
    render(<CrossCheckPairsTable {...makeProps({ crossCheckPairs: [] })} />);

    expect(screen.getByRole('columnheader', { name: /Task/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'student-gh' })).not.toBeInTheDocument();
  });
});
