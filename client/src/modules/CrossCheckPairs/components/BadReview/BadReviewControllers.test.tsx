/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseTaskDetailedDto } from '@client/api';
import { BadReviewControllers, IBadReview } from './BadReviewControllers';

// Mock the CheckService boundary so we can drive the modal data without network.
const { getData } = vi.hoisted(() => ({ getData: vi.fn() }));

vi.mock('@client/services/check', () => ({
  CheckService: class {
    getData = getData;
  },
}));

const courseTasks = [
  { id: 1, name: 'Task One' },
  { id: 2, name: 'Task Two' },
] as CourseTaskDetailedDto[];

const badReviews: IBadReview[] = [
  {
    checkerScore: 5,
    comment: 'too short',
    taskName: 'Task One',
    checkerGithubId: 'checker-gh',
    studentGithubId: 'student-gh',
  },
];

async function selectTask(user: ReturnType<typeof userEvent.setup>, optionName: string) {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByText(optionName, { selector: '.ant-select-item-option-content' }));
}

describe('<BadReviewControllers />', () => {
  beforeEach(() => {
    getData.mockReset();
    getData.mockResolvedValue(badReviews);
  });

  it('disables the action buttons until a task is selected', () => {
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    // antd Button with href renders an <a>; when disabled it has aria-disabled="true".
    const downloadLink = screen.getByText('Download solutions urls').closest('a') as HTMLElement;
    expect(downloadLink).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Bad comment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: "Didn't check" })).toBeDisabled();
  });

  it('lists the course tasks as select options', async () => {
    const user = userEvent.setup();
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Task One', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.getByText('Task Two', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
  });

  it('enables the actions and points the download link to the selected task', async () => {
    const user = userEvent.setup();
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    await selectTask(user, 'Task One');

    expect(screen.getByRole('button', { name: 'Bad comment' })).toBeEnabled();
    const downloadLink = screen.getByText('Download solutions urls').closest('a') as HTMLElement;
    expect(downloadLink).toHaveAttribute('href', '/api/v2/courses/42/cross-checks/1/csv');
  });

  it('opens the "Bad comment" modal and shows the fetched data', async () => {
    const user = userEvent.setup();
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    await selectTask(user, 'Task One');
    await user.click(screen.getByRole('button', { name: 'Bad comment' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Bad checkers in Bad comment')).toBeInTheDocument();

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith(1, 'Bad comment', 42);
    });
    expect(await within(dialog).findByText('too short')).toBeInTheDocument();
  });

  it('opens the "Didn\'t check" modal with the matching check type', async () => {
    const user = userEvent.setup();
    getData.mockResolvedValue([{ ...badReviews[0], studentAvgScore: 8 }]);
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    await selectTask(user, 'Task One');
    await user.click(screen.getByRole('button', { name: "Didn't check" }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Bad checkers in Did not check')).toBeInTheDocument();

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith(1, 'Did not check', 42);
    });
  });

  it('closes the modal via the Cancel button', async () => {
    const user = userEvent.setup();
    render(<BadReviewControllers courseTasks={courseTasks} courseId={42} />);

    await selectTask(user, 'Task One');
    await user.click(screen.getByRole('button', { name: 'Bad comment' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.getByText('Bad checkers in Bad comment')).not.toBeVisible();
    });
  });
});
