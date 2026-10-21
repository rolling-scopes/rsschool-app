import { fireEvent, render, screen } from '@testing-library/react';
import TaskStatusTabs, { Status } from './TaskStatusTabs';
import { SolutionItemStatus, TASKS_STATUSES } from '@client/modules/Mentor/constants';

const PROPS_MOCK = {
  statuses: [],
  onTabChange: vi.fn(),
  activeTab: SolutionItemStatus.InReview,
};

describe('TaskStatusTabs', () => {
  it('renders status counts, handles missing statuses, and reports tab changes', () => {
    const statuses = [
      ...generateStatuses(2, SolutionItemStatus.Done),
      ...generateStatuses(3, SolutionItemStatus.InReview),
      ...generateStatuses(4, SolutionItemStatus.RandomTask),
    ];
    const { rerender } = render(<TaskStatusTabs {...PROPS_MOCK} statuses={statuses} />);

    expect(screen.getAllByRole('tab')).toHaveLength(TASKS_STATUSES.length);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    fireEvent.click(screen.getByText(new RegExp(SolutionItemStatus.Done, 'i')));
    expect(PROPS_MOCK.onTabChange).toHaveBeenCalledWith(SolutionItemStatus.Done);

    rerender(<TaskStatusTabs {...PROPS_MOCK} statuses={[]} />);
    expect(screen.getAllByRole('tab')).toHaveLength(TASKS_STATUSES.length);

    rerender(<TaskStatusTabs {...PROPS_MOCK} statuses={undefined} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(TASKS_STATUSES.length);
    expect(screen.getAllByText('0').length).toBe(TASKS_STATUSES.length);
  });
});

function generateStatuses(count = 3, status = SolutionItemStatus.InReview): Status[] {
  return new Array(count).fill('').map(() => status);
}
