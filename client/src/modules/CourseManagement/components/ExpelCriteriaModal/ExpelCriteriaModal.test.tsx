import { fireEvent, render, screen } from '@testing-library/react';
import { EXPEL_ALERT_MESSAGE, ExpelCriteriaModal, FormValues, hasValidCriteria } from './ExpelCriteriaModal';
import userEvent from '@testing-library/user-event';

const props = {
  courseId: 1,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  isModalOpen: true,
};

const renderExpelCriteriaModal = () => {
  render(<ExpelCriteriaModal {...props} />);
};

describe('ExpelCriteriaModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = userEvent.setup();

  test('should render modal title', async () => {
    renderExpelCriteriaModal();

    const title = await screen.findByText('Expel Criteria');
    expect(title).toBeInTheDocument();
  });

  test('should render alert message', async () => {
    renderExpelCriteriaModal();

    const alert = await screen.findByText(EXPEL_ALERT_MESSAGE);
    expect(alert).toBeInTheDocument();
  });

  test.each`
    label
    ${"Didn't Complete Following Tasks"}
    ${'Minimum Total Score'}
    ${'Expel Reason'}
  `('should render field with $label label', async ({ label }) => {
    renderExpelCriteriaModal();

    const field = await screen.findByText(label);
    expect(field).toBeInTheDocument();
  });

  test('should render checkbox', async () => {
    renderExpelCriteriaModal();

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('should render "cancel" button', async () => {
    renderExpelCriteriaModal();

    const button = await screen.findByRole('button', { name: /cancel/i });
    expect(button).toBeInTheDocument();
  });

  test('should render "expel students" button', async () => {
    renderExpelCriteriaModal();

    const button = await screen.findByRole('button', { name: /expel students/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('should enable "expel students" button on valid criteria', async () => {
    renderExpelCriteriaModal();

    const button = await screen.findByRole('button', { name: /expel students/i });
    expect(button).toBeDisabled();

    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });
    expect(button).toBeEnabled();
  });

  test('should call "onClose" function on "cancel" button click', async () => {
    renderExpelCriteriaModal();

    const button = await screen.findByRole('button', { name: /cancel/i });
    await user.click(button);

    expect(props.onClose).toHaveBeenCalled();
  });

  test('should render error message when expel reason not provided', async () => {
    renderExpelCriteriaModal();

    // Enable "expel students" button
    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    const button = await screen.findByRole('button', { name: /expel students/i });
    await user.click(button);

    const errorMessage = await screen.findByText('Please provide the expel reason');

    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(errorMessage).toBeInTheDocument();
  });

  test('should call "onSubmit" function on "expel students" button click', async () => {
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
