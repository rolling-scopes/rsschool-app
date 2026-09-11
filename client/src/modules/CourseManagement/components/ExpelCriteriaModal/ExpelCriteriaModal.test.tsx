import { fireEvent, render, screen } from '@testing-library/react';
import { EXPEL_ALERT_MESSAGE, ExpelCriteriaModal, FormValues, hasValidCriteria } from './ExpelCriteriaModal';
import userEvent from '@testing-library/user-event';
import * as ReactUse from 'react-use';

const props = {
  courseId: 1,
  onSubmit: vi.fn(),
  onClose: vi.fn(),
  isModalOpen: true,
};

const renderExpelCriteriaModal = () => {
  render(<ExpelCriteriaModal {...props} />);
};

describe('ExpelCriteriaModal', () => {
  beforeAll(() => {
    // mock CoursesTasksApi call
    vi.spyOn(ReactUse, 'useAsync').mockReturnValue({
      value: [
        {
          name: 'course 1',
          id: 1,
        },
      ],
      loading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should call "onClose" function on "cancel" button click', async () => {
    const user = userEvent.setup();
    renderExpelCriteriaModal();

    const button = await screen.findByRole('button', { name: /cancel/i });
    await user.click(button);

    expect(props.onClose).toHaveBeenCalled();
  });

  test('renders the criteria form, enables submission for valid criteria and requires a reason', async () => {
    const user = userEvent.setup();
    renderExpelCriteriaModal();

    for (const text of [
      'Expel Criteria',
      EXPEL_ALERT_MESSAGE,
      "Didn't Complete Following Tasks",
      'Minimum Total Score',
      'Expel Reason',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /expel students/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Enable "expel students" button
    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    expect(button).toBeEnabled();
    await user.click(button);

    const errorMessage = await screen.findByText('Please provide the expel reason');

    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(errorMessage).toBeInTheDocument();
  });

  test('should call "onSubmit" function on "expel students" button click', async () => {
    const user = userEvent.setup();
    renderExpelCriteriaModal();

    // Enable "expel students" button
    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    // fill in required field
    const reasonTextAreal = await screen.findByLabelText('Expel Reason');
    fireEvent.change(reasonTextAreal, {
      target: {
        value: 'reason',
      },
    });

    const button = await screen.findByRole('button', { name: /expel students/i });
    await user.click(button);

    expect(props.onSubmit).toHaveBeenCalled();
  });
});

describe('hasValidCriteria', () => {
  test('should return "false" on empty values', () => {
    expect(hasValidCriteria({} as FormValues)).toBe(false);
  });

  test('should return "false" on minScore = 0', () => {
    const values = {
      minScore: 0,
    } as FormValues;

    expect(hasValidCriteria(values)).toBe(false);
  });

  test('should return "true" on minScore > 0', () => {
    const values = {
      minScore: 5,
    } as FormValues;

    expect(hasValidCriteria(values)).toBe(true);
  });

  test('should return "false" when courseTasksIds array is empty', () => {
    const values = {
      courseTaskIds: [] as number[],
    } as FormValues;

    expect(hasValidCriteria(values)).toBe(false);
  });

  test('should return "true" when courseTasksIds array is not empty', () => {
    const values = {
      courseTaskIds: [1, 2],
    } as FormValues;

    expect(hasValidCriteria(values)).toBe(true);
  });
});
