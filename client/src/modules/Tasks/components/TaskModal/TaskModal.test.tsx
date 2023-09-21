import { generateTasksData } from 'modules/Tasks/utils/test-utils';
import { ModalProps, TaskModal } from './TaskModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { ModalData } from 'modules/Tasks/types';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';

describe('TaskModal', () => {
  test('should render modal', () => {
    render(<TaskModal {...generateData()} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  test.each`
    label
    ${LABELS.name}
    ${LABELS.taskType}
    ${LABELS.discipline}
    ${LABELS.tags}
    ${LABELS.descriptionUrl}
    ${LABELS.summary}
    ${LABELS.skills}
  `('should render field with "$label" label', async ({ label }) => {
    render(<TaskModal {...generateData()} />);

    const field = await screen.findByLabelText(label);
    expect(field).toBeInTheDocument();
  });

  test('should render "Used in courses" card', async () => {
    render(<TaskModal {...generateData()} />);

    const card = await screen.findByText(LABELS.usedInCourses);
    expect(card).toBeInTheDocument();
  });

  // Inputs
  test.each`
    placeholder
    ${PLACEHOLDERS.name}
    ${PLACEHOLDERS.descriptionUrl}
    ${PLACEHOLDERS.summary}
  `('should render field with "$placeholder" placeholder', async ({ placeholder }) => {
    render(<TaskModal {...generateData()} />);

    const field = await screen.findByPlaceholderText(placeholder);
    expect(field).toBeInTheDocument();
  });

  // Selects
  test.each`
    placeholder
    ${PLACEHOLDERS.taskType}
    ${PLACEHOLDERS.discipline}
    ${PLACEHOLDERS.tags}
    ${PLACEHOLDERS.skills}
  `('should render field with "$placeholder" placeholder', async ({ placeholder }) => {
    render(<TaskModal {...generateData(true)} />);

    const select = await screen.findByText(placeholder);
    expect(select).toBeInTheDocument();
  });

  describe('incorrect input handling', () => {
    test('should render error message on invalid description URL input', async () => {
      render(<TaskModal {...generateData()} />);

      const input = await screen.findByPlaceholderText(PLACEHOLDERS.descriptionUrl);
      expect(input).toBeInTheDocument();

      const value = 'not url';

      fireEvent.change(input, {
        target: {
          value,
        },
      });

      expect(input).toHaveValue(value);

      const errorMessage = await screen.findByText(ERROR_MESSAGES.validUrl);
      expect(errorMessage).toBeInTheDocument();
    });

    test('should render all error messages on required fields', async () => {
      render(<TaskModal {...generateData(true)} />);

      const save = await screen.findByRole('button', { name: /save/i });
      expect(save).toBeInTheDocument();

      fireEvent.click(save);

      const errors = await screen.findAllByRole('alert');
      expect(errors).toHaveLength(4);
    });

    test.each`
      message
      ${ERROR_MESSAGES.name}
      ${ERROR_MESSAGES.taskType}
      ${ERROR_MESSAGES.discipline}
      ${ERROR_MESSAGES.descriptionUrl}
    `('should render "$message" error message', async ({ message }: { message: string }) => {
      render(<TaskModal {...generateData(true)} />);

      const save = await screen.findByRole('button', { name: /save/i });
      expect(save).toBeInTheDocument();

      fireEvent.click(save);

      const error = await screen.findByText(message);
      expect(error).toBeInTheDocument();
    });
  });

  test.each`
    header
    ${TASK_SETTINGS_HEADERS.crossCheckCriteria}
    ${TASK_SETTINGS_HEADERS.github}
    ${TASK_SETTINGS_HEADERS.jsonAttributes}
  `('should render task setting panel $header', async ({ header }) => {
    render(<TaskModal {...generateData()} />);

    const panel = await screen.findByText(header);
    expect(panel).toBeInTheDocument();
  });
});

function generateData(isEmpty = false): ModalProps {
  const tasks = generateTasksData();
  const modalData: ModalData = {
    ...tasks[0],
    attributes: undefined,
  };

  if (isEmpty) {
    modalData.name = undefined;
    modalData.type = undefined;
    modalData.discipline = undefined;
    modalData.descriptionUrl = undefined;
    modalData.tags = undefined;
    modalData.skills = undefined;
  }

  return {
    tasks,
    dataCriteria: [],
    modalData,
    modalLoading: false,
    disciplines: [],
    setDataCriteria: jest.fn(),
    handleModalSubmit: jest.fn(),
    setModalData: jest.fn(),
    setModalValues: jest.fn(),
  };
}
