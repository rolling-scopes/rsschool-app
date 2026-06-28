import { fireEvent, render, screen } from '@testing-library/react';
import TaskStatusTabs, { Status } from './TaskStatusTabs';
import { SolutionItemStatus, TASKS_STATUSES } from '@client/modules/Mentor/constants';

const PROPS_MOCK = {
  statuses: [],
  onTabChange: vi.fn(),
  activeTab: SolutionItemStatus.InReview,
};

describe('TaskStatusTabs', () => {
  it('should render status tabs', () => {
    const statuses = generateStatuses();

    render(<TaskStatusTabs {...PROPS_MOCK} statuses={statuses} />);

    expect(screen.getAllByRole('tab')).toHaveLength(TASKS_STATUSES.length);
  });

  it('should render status tabs when statuses were not provided', () => {
    render(<TaskStatusTabs {...PROPS_MOCK} statuses={[]} />);

    expect(screen.getAllByRole('tab')).toHaveLength(TASKS_STATUSES.length);
  });

  it('should render zero-count badges when statuses is undefined', () => {
    // statuses={undefined} drives the `statuses?.filter(...).length ?? 0` nullish
    // fallback in tabsRenderer so every tab shows a 0 count.
    render(<TaskStatusTabs {...PROPS_MOCK} statuses={undefined} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(TASKS_STATUSES.length);
    // every tab badge renders a "0" count (showZero)
    expect(screen.getAllByText('0').length).toBe(TASKS_STATUSES.length);
  });

  it.each`
    status                           | count
    ${SolutionItemStatus.Done}       | ${2}
    ${SolutionItemStatus.InReview}   | ${3}
    ${SolutionItemStatus.RandomTask} | ${4}
  `(
    'should render badge with count of $count for "$status" tab',
    ({ status, count }: { status: SolutionItemStatus; count: number }) => {
      const statuses = generateStatuses(count, status);

      render(<TaskStatusTabs {...PROPS_MOCK} statuses={statuses} />);

      expect(screen.getByText(count)).toBeInTheDocument();
    },
  );

  describe('when active tab was changed', () => {
    it('should call onTabChange with tab name "Done"', () => {
      const tabName = SolutionItemStatus.Done;
      const statuses = generateStatuses();
      render(<TaskStatusTabs {...PROPS_MOCK} statuses={statuses} />);

      const selectedTab = screen.getByText(new RegExp(tabName, 'i'));
      fireEvent.click(selectedTab);

      expect(PROPS_MOCK.onTabChange).toHaveBeenCalledWith(tabName);
    });
  });
});

function generateStatuses(count = 3, status = SolutionItemStatus.InReview): Status[] {
  return new Array(count).fill('').map(() => status);
}
