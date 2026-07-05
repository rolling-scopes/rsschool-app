import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ColumnType } from 'antd/es/table';
import { ScoreStudentDto } from '@client/api';
import { getColumns } from './getColumns';

// GithubAvatar pulls in remote image logic; stub it to a marker.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: ({ githubId }: { githubId?: string }) => <span data-testid="avatar">{githubId}</span>,
}));
// next/link → simple anchor passthrough.
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

type Col = ColumnType<ScoreStudentDto> & {
  render?: (value: unknown, record: ScoreStudentDto) => React.ReactNode;
};

const findCol = (cols: Col[], key: string) =>
  cols.find(
    c => c.key === key || c.dataIndex === key || JSON.stringify(c.dataIndex) === JSON.stringify(key.split('.')),
  );

describe('getColumns', () => {
  it('renders "New" for the placeholder max rank and the raw number otherwise', () => {
    const cols = getColumns({ taskColumns: [] }) as Col[];
    const rank = cols.find(c => c.key === 'rank')!;

    expect(rank.render!(999999, {} as ScoreStudentDto)).toBe('New');
    expect(rank.render!(5, {} as ScoreStudentDto)).toBe(5);
  });

  it('wraps array filter values as-is and scalar values into a single-element array', () => {
    const arrayProps = getColumns({
      taskColumns: [],
      githubId: ['a', 'b'],
      name: ['n1'],
      cityName: ['c1'],
      mentor: ['m1'],
    }) as Col[];
    expect(findCol(arrayProps, 'githubId')!.defaultFilteredValue).toEqual(['a', 'b']);
    expect(findCol(arrayProps, 'name')!.defaultFilteredValue).toEqual(['n1']);
    expect(findCol(arrayProps, 'cityName')!.defaultFilteredValue).toEqual(['c1']);
    // Mentor column uses a nested dataIndex ['mentor','githubId'].
    const mentorCol = arrayProps.find(c => JSON.stringify(c.dataIndex) === JSON.stringify(['mentor', 'githubId']))!;
    expect(mentorCol.defaultFilteredValue).toEqual(['m1']);

    const scalarProps = getColumns({
      taskColumns: [],
      githubId: 'solo',
      name: 'nm',
      cityName: 'ct',
      mentor: 'mn',
    }) as Col[];
    expect(findCol(scalarProps, 'githubId')!.defaultFilteredValue).toEqual(['solo']);
    expect(findCol(scalarProps, 'name')!.defaultFilteredValue).toEqual(['nm']);
  });

  it('leaves filter values undefined when no filter prop is supplied', () => {
    const cols = getColumns({ taskColumns: [] }) as Col[];
    expect(findCol(cols, 'githubId')!.defaultFilteredValue).toBeUndefined();
  });

  it('renders the GitHub cell with an avatar and a profile link', () => {
    const cols = getColumns({ taskColumns: [] }) as Col[];
    const githubCol = findCol(cols, 'githubId')!;
    render(<>{githubCol.render!('octocat', {} as ScoreStudentDto)}</>);

    expect(screen.getByTestId('avatar')).toHaveTextContent('octocat');
    expect(screen.getByRole('link', { name: 'octocat' })).toHaveAttribute('href', 'https://github.com/octocat');
  });

  it('appends the provided task columns', () => {
    const taskColumns = [{ title: 'Task X', key: 'task-x' }];
    const cols = getColumns({ taskColumns }) as Col[];
    expect(cols.some(c => c.key === 'task-x')).toBe(true);
  });
});
