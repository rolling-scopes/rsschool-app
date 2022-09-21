import { render, screen } from '@testing-library/react';
import StatusTabs, { Status } from './StatusTabs';
import { SCHEDULE_STATUSES } from 'modules/Schedule/constants';

describe('StatusTabs', () => {
  it('should render all status tabs', () => {
    const statuses = generateStatuses();

    render(<StatusTabs statuses={statuses} />);

    const expectedStatusCount = SCHEDULE_STATUSES.length + 1; // +1 is for 'All' tab
    expect(screen.getAllByRole('tab')).toHaveLength(expectedStatusCount);
  });

  it.each`
    status         | count
    ${'done'}      | ${2}
    ${'available'} | ${3}
    ${'archived'}  | ${4}
    ${'future'}    | ${5}
    ${'review'}    | ${6}
  `(
    'should render badge with count of $count for "$status" tab',
    ({ status, count }: { status: string; count: number }) => {
      const missedStatusCount = 1;
      const statuses = generateStatuses(undefined, { missed: missedStatusCount, [status]: count });

      render(<StatusTabs statuses={statuses} />);

      expect(screen.getByText(missedStatusCount)).toBeInTheDocument();
      expect(screen.getByText(count)).toBeInTheDocument();
    },
  );

  it('should render badge with total count for "all" tab', () => {
    const missedStatusCount = 1;
    const doneStatusCount = 2;
    const reviewStatusCount = 3;
    const statuses = generateStatuses(0, {
      missed: missedStatusCount,
      done: doneStatusCount,
      review: reviewStatusCount,
    });

    render(<StatusTabs statuses={statuses} />);

    const totalCount = missedStatusCount + doneStatusCount + reviewStatusCount;
    expect(screen.getByText(totalCount)).toBeInTheDocument();
  });
});

function generateStatuses(count = 3, statusesObj: Record<string, number> | null = null): Status[] {
  if (statusesObj) {
    const result: string[] = [];

    for (const key in statusesObj) {
      if (Object.prototype.hasOwnProperty.call(statusesObj, key)) {
        const count = statusesObj[key];
        const r = new Array(count).fill(key);
        result.push(...r);
      }
    }

    return result;
  }

  return new Array(count).fill('').map(() => 'missed');
}
