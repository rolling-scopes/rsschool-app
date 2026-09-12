import { render, screen, fireEvent } from '@testing-library/react';
import {
  CERTIFICATE_ALERT_MESSAGE,
  CertificateCriteriaModal,
  FormValues,
  hasValidCriteria,
} from './CertificateCriteriaModal';
import { setupUser } from '@client/__tests__/setupUser';
import * as ReactUse from 'react-use';

const props = {
  courseId: 1,
  onSubmit: vi.fn(),
  onClose: vi.fn(),
  isModalOpen: true,
};

const renderCertificateCriteriaModal = () => {
  render(<CertificateCriteriaModal {...props} />);
};

describe('CertificateCriteriaModal', () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    // mock CoursesTasksApi call
    vi.spyOn(ReactUse, 'useAsync').mockReturnValue({
      value: [
        {
          name: 'task 1',
          id: 1,
          maxScore: 100,
        },
      ],
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render the initial form with certificate issuance disabled', async () => {
    renderCertificateCriteriaModal();

    expect(await screen.findByText('Certificate Criteria')).toBeInTheDocument();
    expect(screen.getByText(CERTIFICATE_ALERT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    expect(screen.getByText('Minimum Total Score')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /issue certificates/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('should render task criteria row on "add task" button click', async () => {
    renderCertificateCriteriaModal();

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await user.click(addButton);

    expect(await screen.findByText('Task')).toBeInTheDocument();
    expect(await screen.findByText('Minimum Score')).toBeInTheDocument();
    const removeButton = await screen.findByLabelText('Remove task');
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveRole('button');
    expect(removeButton).toBeVisible();
  });

  test('should remove task criteria row on "remove task" button click', async () => {
    renderCertificateCriteriaModal();

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await user.click(addButton);

    const removeButton = await screen.findByLabelText('Remove task');
    expect(removeButton).toHaveRole('button');
    expect(removeButton).toBeVisible();
    await user.click(removeButton);

    expect(screen.queryByText('Minimum Score')).not.toBeInTheDocument();
  });

  test('should enable "issue certificates" button on valid criteria', async () => {
    renderCertificateCriteriaModal();

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    expect(button).toBeDisabled();

    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });
    expect(button).toBeEnabled();
  });

  test('should enable "issue certificates" button on complete task row without total score', async () => {
    renderCertificateCriteriaModal();

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await user.click(addButton);

    const taskSelect = await screen.findByRole('combobox');
    await user.click(taskSelect);
    await user.click(await screen.findByTitle('task 1 (max 100)'));

    const minScoreInput = await screen.findByPlaceholderText('Min score');
    fireEvent.change(minScoreInput, {
      target: {
        value: 42,
      },
    });

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    expect(button).toBeEnabled();
  });

  test('should keep "issue certificates" button disabled with an incomplete task row', async () => {
    renderCertificateCriteriaModal();

    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await user.click(addButton);

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    expect(button).toBeDisabled();
  });

  test('should call "onClose" function on "cancel" button click', async () => {
    renderCertificateCriteriaModal();

    const button = await screen.findByRole('button', { name: /cancel/i });
    await user.click(button);

    expect(props.onClose).toHaveBeenCalled();
  });

  test('should call "onSubmit" function on "issue certificates" button click', async () => {
    renderCertificateCriteriaModal();

    // Enable "issue certificates" button
    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    await user.click(button);

    expect(props.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ taskCriteria: [], minTotalScore: 5 }));
  });

  test('should submit per-task criteria rows', async () => {
    renderCertificateCriteriaModal();

    const minTotalScoreInput = await screen.findByLabelText('Minimum Total Score');
    fireEvent.change(minTotalScoreInput, {
      target: {
        value: 5,
      },
    });

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await user.click(addButton);

    const taskSelect = await screen.findByRole('combobox');
    await user.click(taskSelect);
    await user.click(await screen.findByTitle('task 1 (max 100)'));

    const minScoreInput = await screen.findByPlaceholderText('Min score');
    fireEvent.change(minScoreInput, {
      target: {
        value: 42,
      },
    });

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    expect(button).toBeEnabled();
    await user.click(button);

    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        taskCriteria: [{ courseTaskId: 1, minScore: 42 }],
        minTotalScore: 5,
      }),
    );
  });
});

describe('hasValidCriteria', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return "false" on empty values', () => {
    expect(hasValidCriteria({} as FormValues)).toBe(false);
  });

  describe('tasksCriteriaValid (with minTotalScore > 0)', () => {
    test('should return "true" on empty taskCriteria array', () => {
      const values = {
        taskCriteria: [],
        minTotalScore: 5,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(true);
    });

    test('should return "true" on complete taskCriteria rows', () => {
      const values = {
        taskCriteria: [
          { courseTaskId: 1, minScore: 5 },
          { courseTaskId: 2, minScore: 350 },
        ],
        minTotalScore: 5,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(true);
    });

    test('should return "false" on a row without a task', () => {
      const values = {
        taskCriteria: [{ minScore: 5 }],
        minTotalScore: 5,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(false);
    });

    test('should return "false" on a row with minScore = 0', () => {
      const values = {
        taskCriteria: [{ courseTaskId: 1, minScore: 0 }],
        minTotalScore: 5,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(false);
    });
  });

  describe('minTotalScore', () => {
    test('should return "true" on complete task rows without minTotalScore', () => {
      const values = {
        taskCriteria: [{ courseTaskId: 1, minScore: 5 }],
        minTotalScore: 0,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(true);
    });

    test('should return "false" on no criteria at all', () => {
      const values = {
        taskCriteria: [],
        minTotalScore: 0,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(false);
    });

    test('should return "true" on minTotalScore > 0', () => {
      const values = {
        taskCriteria: [{ courseTaskId: 1, minScore: 5 }],
        minTotalScore: 5,
      } as unknown as FormValues;

      expect(hasValidCriteria(values)).toBe(true);
    });
  });
});
