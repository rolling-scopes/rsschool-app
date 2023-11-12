import { generateTasksData } from 'modules/Tasks/utils/test-utils';
import { ModalProps, TaskModal } from './TaskModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { ModalData } from 'modules/Tasks/types';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';

const mockData = generateData();

describe('TaskModal', () => {
  test('should render modal', () => {
    render(<TaskModal {...mockData} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  test('should render labels', () => {
    render(<TaskModal {...mockData} />);

    const name = screen.getByLabelText(LABELS.name);
    const taskType = screen.getByLabelText(LABELS.taskType);
    const discipline = screen.getByLabelText(LABELS.discipline);
    const tags = screen.getByLabelText(LABELS.tags);
    const descriptionUrl = screen.getByLabelText(LABELS.descriptionUrl);
    const summary = screen.getByLabelText(LABELS.summary);
    const skills = screen.getByLabelText(LABELS.skills);

    expect(name).toBeInTheDocument();
    expect(taskType).toBeInTheDocument();
    expect(discipline).toBeInTheDocument();
    expect(tags).toBeInTheDocument();
    expect(descriptionUrl).toBeInTheDocument();
    expect(summary).toBeInTheDocument();
    expect(skills).toBeInTheDocument();
  });

  test('should render "Used in courses" card', () => {
    render(<TaskModal {...mockData} />);

    const card = screen.getByText(LABELS.usedInCourses);
    expect(card).toBeInTheDocument();
  });

  // Inputs
  test('should render input placeholders', () => {
    render(<TaskModal {...mockData} />);

    const name = screen.getByPlaceholderText(PLACEHOLDERS.name);
    const descriptionUrl = screen.getByPlaceholderText(PLACEHOLDERS.descriptionUrl);
    const summary = screen.getByPlaceholderText(PLACEHOLDERS.summary);

    expect(name).toBeInTheDocument();
    expect(descriptionUrl).toBeInTheDocument();
    expect(summary).toBeInTheDocument();
  });

  // Selects
  test('should render select placeholders', () => {
    render(<TaskModal {...generateData(true)} />);
    const taskType = screen.getByText(PLACEHOLDERS.taskType);
    const discipline = screen.getByText(PLACEHOLDERS.discipline);
    const tags = screen.getByText(PLACEHOLDERS.tags);
    const skills = screen.getByText(PLACEHOLDERS.skills);

    expect(taskType).toBeInTheDocument();
    expect(discipline).toBeInTheDocument();
    expect(tags).toBeInTheDocument();
    expect(skills).toBeInTheDocument();
  });

  describe('incorrect input handling', () => {
    test('should render error message on invalid description URL input', async () => {
      render(<TaskModal {...mockData} />);

      const input = screen.getByPlaceholderText(PLACEHOLDERS.descriptionUrl);
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

    test('should render error messages on required fields', async () => {
      render(<TaskModal {...generateData(true)} />);

      const save = screen.getByRole('button', { name: /save/i });
      expect(save).toBeInTheDocument();

      fireEvent.click(save);

      const errors = await Promise.all([
        screen.findByText(ERROR_MESSAGES.name),
        screen.findByText(ERROR_MESSAGES.taskType),
        screen.findByText(ERROR_MESSAGES.discipline),
        screen.findByText(ERROR_MESSAGES.descriptionUrl),
      ]);

      expect(errors).toHaveLength(4);

      errors.forEach(error => {
        expect(error).toBeInTheDocument();
      });
    });
  });

  test('should render task setting panel headers', () => {
    render(<TaskModal {...mockData} />);

    const crossCheckCriteria = screen.getByText(TASK_SETTINGS_HEADERS.crossCheckCriteria);
    const github = screen.getByText(TASK_SETTINGS_HEADERS.github);
    const jsonAttributes = screen.getByText(TASK_SETTINGS_HEADERS.jsonAttributes);

    expect(crossCheckCriteria).toBeInTheDocument();
    expect(github).toBeInTheDocument();
    expect(jsonAttributes).toBeInTheDocument();
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
