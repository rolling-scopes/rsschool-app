import { render, screen } from '@testing-library/react';
import StatusTabs, { Status } from './StatusTabs';
import { ALL_TAB_KEY, SCHEDULE_STATUSES } from 'modules/Schedule/constants';
import { CourseScheduleItemDtoStatusEnum } from 'api';

const StatusEnum = CourseScheduleItemDtoStatusEnum;

describe('StatusTabs', () => {
  const onTabChangeMock = jest.fn;

  it('should render status tabs', () => {
    const statuses = generateStatuses();

    render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

    const expectedStatusCount = SCHEDULE_STATUSES.length + 1; // +1 is for 'All' tab
    expect(screen.getAllByRole('tab')).toHaveLength(expectedStatusCount);
  });

  it('should order tabs', () => {
    const statuses = generateStatuses();

    render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

    const [all, available, review, future, missed, done, archived] = screen.getAllByRole('tab');
    expect(all).toHaveTextContent(new RegExp(ALL_TAB_KEY, 'i'));
    expect(available).toHaveTextContent(new RegExp(StatusEnum.Available, 'i'));
    expect(review).toHaveTextContent(new RegExp(StatusEnum.Review, 'i'));
    expect(future).toHaveTextContent(new RegExp(StatusEnum.Future, 'i'));
    expect(missed).toHaveTextContent(new RegExp(StatusEnum.Missed, 'i'));
    expect(done).toHaveTextContent(new RegExp(StatusEnum.Done, 'i'));
    expect(archived).toHaveTextContent(new RegExp(StatusEnum.Archived, 'i'));
  });

  it.each`
    status                  | count
    ${StatusEnum.Done}      | ${2}
    ${StatusEnum.Available} | ${3}
    ${StatusEnum.Archived}  | ${4}
    ${StatusEnum.Future}    | ${5}
    ${StatusEnum.Review}    | ${6}
  `(
    'should render badge with count of $count for "$status" tab',
    ({ status, count }: { status: string; count: number }) => {
      const missedCount = 1;
      const statuses = generateStatuses(undefined, { [StatusEnum.Missed]: missedCount, [status]: count });

      render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

      expect(screen.getByText(missedCount)).toBeInTheDocument();
      expect(screen.getByText(count)).toBeInTheDocument();
    },
  );

  it('should render badge with total count for "all" tab', () => {
    const missedCount = 1;
    const doneCount = 2;
    const reviewCount = 3;
    const statuses = generateStatuses(undefined, {
      missed: missedCount,
      done: doneCount,
      review: reviewCount,
    });

    render(<StatusTabs statuses={statuses} onTabChange={onTabChangeMock} />);

    const totalCount = missedCount + doneCount + reviewCount;
    expect(screen.getByText(totalCount)).toBeInTheDocument();
  });
});

function generateStatuses(count = 3, statusTypeAndCount: Record<string, number> | null = null): Status[] {
  if (statusTypeAndCount) {
    const statuses: Status[] = [];

    for (const statusType in statusTypeAndCount) {
      if (Object.prototype.hasOwnProperty.call(statusTypeAndCount, statusType)) {
        const statusCount = statusTypeAndCount[statusType];
        statuses.push(...new Array(statusCount).fill(statusType));
      }
    }

    return statuses;
  }

  return new Array(count).fill('').map(() => StatusEnum.Missed);
}
