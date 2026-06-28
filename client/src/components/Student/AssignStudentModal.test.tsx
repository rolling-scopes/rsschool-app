import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignStudentModal } from './AssignStudentModal';

// --- boundary mocks ---
const { success, error, updateStudent } = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success, error } }),
}));

vi.mock('@client/services/course', () => ({
  CourseService: class {
    constructor(public courseId: number) {}
    updateStudent = updateStudent;
  },
}));

// StudentSearch is a remote-search Select; stub with a button that emits a value.
vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: ({ onChange }: { onChange: (v: string) => void }) => (
    <button data-testid="pick-student" onClick={() => onChange('student-1')}>
      pick student
    </button>
  ),
}));

const baseProps = {
  mentorGithuId: 'mentor-1',
  courseId: 99,
  open: true,
  onClose: vi.fn(),
};

describe('AssignStudentModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the title with the mentor github id and the student search', () => {
    render(<AssignStudentModal {...baseProps} />);

    expect(screen.getByText('Assign Student to')).toBeInTheDocument();
    expect(screen.getByText('mentor-1')).toBeInTheDocument();
    expect(screen.getByTestId('pick-student')).toBeInTheDocument();
  });

  it('does nothing on OK when no student was selected', async () => {
    const user = userEvent.setup();
    render(<AssignStudentModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(updateStudent).not.toHaveBeenCalled();
    expect(baseProps.onClose).not.toHaveBeenCalled();
  });

  it('assigns the selected student and shows a success message', async () => {
    const user = userEvent.setup();
    updateStudent.mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<AssignStudentModal {...baseProps} onClose={onClose} />);

    await user.click(screen.getByTestId('pick-student'));
    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(updateStudent).toHaveBeenCalledWith('student-1', { mentorGithuId: 'mentor-1' }));
    expect(onClose).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith('Student has been added to mentor');
  });

  it('shows an error message when the assignment fails', async () => {
    const user = userEvent.setup();
    updateStudent.mockRejectedValue(new Error('failed'));
    render(<AssignStudentModal {...baseProps} />);

    await user.click(screen.getByTestId('pick-student'));
    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(error).toHaveBeenCalledWith('Error: failed'));
  });

  it('calls onClose when cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AssignStudentModal {...baseProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
