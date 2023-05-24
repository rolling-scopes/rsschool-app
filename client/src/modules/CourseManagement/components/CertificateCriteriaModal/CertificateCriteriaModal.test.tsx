import { render, screen, fireEvent } from '@testing-library/react';
import {
  CERTIFICATE_ALERT_MESSAGE,
  CertificateCriteriaModal,
  FormValues,
  hasValidCriteria,
} from './CertificateCriteriaModal';
import userEvent from '@testing-library/user-event';

const props = {
  courseId: 1,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  isModalOpen: true,
};

const renderCertificateCriteriaModal = () => {
  render(<CertificateCriteriaModal {...props} />);
};

describe('CertificateCriteriaModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = userEvent.setup();

  test('should render modal title', async () => {
    renderCertificateCriteriaModal();

    const title = await screen.findByText('Certificate Criteria');
    expect(title).toBeInTheDocument();
  });

  test('should render alert message', async () => {
    renderCertificateCriteriaModal();

    const alert = await screen.findByText(CERTIFICATE_ALERT_MESSAGE);
    expect(alert).toBeInTheDocument();
  });

  test.each`
    label
    ${'Tasks'}
    ${'Minimum Score Per Task'}
    ${'Minimum Total Score'}
  `('should render field with $label label', async ({ label }) => {
    renderCertificateCriteriaModal();

    const field = await screen.findByText(label);
    expect(field).toBeInTheDocument();
  });

  test('should render "cancel" button', async () => {
    renderCertificateCriteriaModal();

    const button = await screen.findByRole('button', { name: /cancel/i });
    expect(button).toBeInTheDocument();
  });

  test('should render "issue certificates" button', async () => {
    renderCertificateCriteriaModal();

    const button = await screen.findByRole('button', { name: /issue certificates/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
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

    expect(props.onSubmit).toHaveBeenCalled();
  });
});

describe('hasValidCriteria', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return "false" on empty values', () => {
    expect(hasValidCriteria({} as FormValues)).toBe(false);
  });

  describe('tasksCriteriaValid (with minTotalScore > 0)', () => {
    test('should return "true" on empty courseTaskIds array', () => {
      const values = {
        minScore: 0,
        courseTaskIds: [],
        minTotalScore: 5,
      };

      expect(hasValidCriteria(values)).toBe(true);
    });

    test('should return "true" on not empty courseTaskIds array & minScore per task > 0', () => {
      const values = {
        minScore: 5,
        courseTaskIds: [1, 2],
        minTotalScore: 5,
      };

      expect(hasValidCriteria(values)).toBe(true);
    });

    test('should return "false" on not empty courseTaskIds array & minScore per task = 0', () => {
      const values = {
        minScore: 0,
        courseTaskIds: [1, 2],
        minTotalScore: 5,
      };

      expect(hasValidCriteria(values)).toBe(false);
    });
  });

  describe('minTotalScore (with truthy tasksCriteriaValid)', () => {
    test('should return "false" on minTotalScore = 0', () => {
      const values = {
        minScore: 5,
        courseTaskIds: [1, 2],
        minTotalScore: 0,
      };

      expect(hasValidCriteria(values)).toBe(false);
    });

    test('should return "true" on minTotalScore > 0', () => {
      const values = {
        minScore: 5,
        courseTaskIds: [1, 2],
        minTotalScore: 5,
      };

      expect(hasValidCriteria(values)).toBe(true);
    });
  });
});
