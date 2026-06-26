import { Table } from 'antd';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckPairDto } from '@client/api';
import { getCrossCheckPairsColumns } from './getCrossCheckPairsColumns';

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
    privateRepository: 'https://github.com/student/private',
    submittedDate: '2024-03-01T10:00:00.000Z',
    historicalScores: [{ comment: 'hist', dateTime: '2024-03-02T10:00:00.000Z' }],
    messages: [],
    ...overrides,
  } as CrossCheckPairDto;
}

function renderTable(data: CrossCheckPairDto[], viewComment = vi.fn()) {
  render(<Table<CrossCheckPairDto> columns={getCrossCheckPairsColumns(viewComment)} dataSource={data} rowKey="id" />);
  return { viewComment };
}

describe('getCrossCheckPairsColumns', () => {
  it('renders the github links for checker and student', () => {
    renderTable([makePair()]);

    const checkerLink = screen.getByRole('link', { name: 'checker-gh' });
    const studentLink = screen.getByRole('link', { name: 'student-gh' });
    expect(checkerLink).toHaveAttribute('href', 'https://github.com/checker-gh');
    expect(studentLink).toHaveAttribute('href', 'https://github.com/student-gh');
  });

  it('renders the task name and solution url', () => {
    renderTable([makePair()]);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/student/solution')).toBeInTheDocument();
  });

  it('renders a private-repository link when present', () => {
    renderTable([makePair()]);

    const privateLink = screen.getByRole('link', { name: /Private Repository/ });
    expect(privateLink).toHaveAttribute('href', 'https://github.com/student/private');
  });

  it('omits the private-repository link when not present', () => {
    renderTable([makePair({ privateRepository: '' })]);

    expect(screen.queryByRole('link', { name: /Private Repository/ })).not.toBeInTheDocument();
  });

  it('renders the score value', () => {
    renderTable([makePair({ score: 42 })]);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders "(Empty)" when the score is missing', () => {
    renderTable([makePair({ score: undefined as unknown as number })]);

    expect(screen.getByText('(Empty)')).toBeInTheDocument();
  });

  it('enables the comment button when historical scores exist and calls viewComment', async () => {
    const user = userEvent.setup();
    const pair = makePair();
    const { viewComment } = renderTable([pair]);

    const showButton = screen.getByRole('button', { name: 'Show' });
    expect(showButton).toBeEnabled();

    await user.click(showButton);

    expect(viewComment).toHaveBeenCalledWith(expect.objectContaining({ id: 100 }));
  });

  it('disables the comment button when historicalScores is absent', () => {
    // NOTE: the component checks `!record.historicalScores` (truthiness of the
    // array reference), so an empty array still ENABLES the button — only a
    // null/undefined value disables it.
    renderTable([makePair({ historicalScores: undefined as unknown as CrossCheckPairDto['historicalScores'] })]);

    expect(screen.getByRole('button', { name: 'Show' })).toBeDisabled();
  });

  it('keeps the comment button enabled even when historicalScores is an empty array', () => {
    renderTable([makePair({ historicalScores: [] })]);

    expect(screen.getByRole('button', { name: 'Show' })).toBeEnabled();
  });
});
