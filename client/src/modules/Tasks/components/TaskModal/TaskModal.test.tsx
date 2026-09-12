import { fireEvent, render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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
  test('should render the edit title, fields, placeholders and settings panels', () => {
    render(<TaskModal {...mockData} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(MODAL_TITLES.edit)).toBeInTheDocument();
    for (const label of [
      LABELS.name,
      LABELS.taskType,
      LABELS.discipline,
      LABELS.tags,
      LABELS.descriptionUrl,
      LABELS.summary,
      LABELS.skills,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    for (const placeholder of [PLACEHOLDERS.name, PLACEHOLDERS.descriptionUrl, PLACEHOLDERS.summary]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    }
    for (const title of [
      LABELS.usedInCourses,
      TASK_SETTINGS_HEADERS.crossCheckCriteria,
      TASK_SETTINGS_HEADERS.github,
      TASK_SETTINGS_HEADERS.jsonAttributes,
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
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
      const user = setupUser();
      render(<TaskModal {...generateData(true)} />);

      for (const placeholder of [
        PLACEHOLDERS.taskType,
        PLACEHOLDERS.discipline,
        PLACEHOLDERS.tags,
        PLACEHOLDERS.skills,
      ]) {
        expect(screen.getByText(placeholder)).toBeInTheDocument();
      }

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
    const user = setupUser();
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
    const user = setupUser();
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
