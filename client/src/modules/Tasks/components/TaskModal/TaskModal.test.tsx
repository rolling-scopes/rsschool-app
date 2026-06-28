import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTasksData } from '@client/modules/Tasks/utils/test-utils';
import { FormValues } from '@client/modules/Tasks/types';
import {
  ERROR_MESSAGES,
  LABELS,
  MODAL_TITLES,
  PLACEHOLDERS,
  TASK_SETTINGS_HEADERS,
} from '@client/modules/Tasks/constants';
import { ModalProps, TaskModal } from './TaskModal';

const mockData = generateData();

describe('TaskModal', () => {
  test('should render modal with proper title', () => {
    render(<TaskModal {...mockData} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    const title = screen.getByText(MODAL_TITLES.edit);
    expect(title).toBeInTheDocument();
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
      const user = userEvent.setup();
      render(<TaskModal {...generateData(true)} />);

      const save = screen.getByRole('button', { name: /save/i });
      expect(save).toBeInTheDocument();

      await user.click(save);

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

  test('renders an empty courses card when the task is not used in any course', () => {
    // formData without courses → the `courses?.length ? … : <Empty>` Empty branch; tasks with
    // no tags/skills → the `task.tags || []` / `task.skills || []` fallbacks.
    const props = generateData();
    props.tasks = [{ ...props.tasks[0], tags: undefined, skills: undefined }] as never;
    props.formData = { ...props.formData!, courses: [] };

    render(<TaskModal {...props} />);

    // No courses → the antd Empty placeholder (with its "No data" description) is rendered.
    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  test('renders an uncoloured tag for an inactive course', () => {
    const props = generateData();
    props.formData = {
      ...props.formData!,
      courses: [{ name: 'Archived Course', isActive: false }],
    };

    render(<TaskModal {...props} />);

    const tag = screen.getByText('Archived Course');
    // isActive false → `isActive ? 'blue' : ''` → no blue color class.
    // eslint-disable-next-line testing-library/no-node-access
    expect(tag.closest('.ant-tag')).not.toHaveClass('ant-tag-blue');
  });

  test('renders with an empty form when formData is undefined', () => {
    const props = generateData();
    props.formData = undefined; // `formData ?? {}` fallback.

    render(<TaskModal {...props} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // No courses → the Empty placeholder is shown.
    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  test('resets dependent settings when the task type changes', async () => {
    const user = userEvent.setup();
    const setDataCriteria = vi.fn();
    const props = generateData(true);
    props.setDataCriteria = setDataCriteria;

    render(<TaskModal {...props} />);

    // Open the task-type select and pick the first option → handleTypeChange runs.
    await user.click(screen.getByLabelText(LABELS.taskType));
    const options = await screen.findAllByText(/./, { selector: '.ant-select-item-option-content' });
    await user.click(options[0]);

    expect(setDataCriteria).toHaveBeenCalledWith([]);
  });

  test('clears criteria and closes the modal on cancel', async () => {
    const user = userEvent.setup();
    const toggleModal = vi.fn();
    const setDataCriteria = vi.fn();
    const props = generateData();
    props.toggleModal = toggleModal;
    props.setDataCriteria = setDataCriteria;

    render(<TaskModal {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(toggleModal).toHaveBeenCalled();
    expect(setDataCriteria).toHaveBeenCalledWith([]);
  });
});

function generateData(isEmpty = false): ModalProps {
  const tasks = generateTasksData();
  const formData: FormValues = {
    ...tasks[0],
    attributes: undefined,
    discipline: tasks[0]?.discipline?.id,
  };

  if (isEmpty) {
    formData.name = undefined;
    formData.type = undefined;
    formData.discipline = undefined;
    formData.descriptionUrl = undefined;
    formData.tags = undefined;
    formData.skills = undefined;
  }

  return {
    tasks,
    dataCriteria: [],
    formData,
    modalLoading: false,
    disciplines: [],
    mode: isEmpty ? 'create' : 'edit',
    setDataCriteria: vi.fn(),
    handleModalSubmit: vi.fn(),
    toggleModal: vi.fn(),
  };
}
