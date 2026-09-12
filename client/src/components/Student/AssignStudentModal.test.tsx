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

  it('renders and handles guard, success, error, and cancel paths', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    updateStudent.mockResolvedValueOnce(undefined);
    render(<AssignStudentModal {...baseProps} onClose={onClose} />);

    expect(screen.getByText('Assign Student to')).toBeInTheDocument();
    expect(screen.getByText('mentor-1')).toBeInTheDocument();
    expect(screen.getByTestId('pick-student')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(updateStudent).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('pick-student'));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(updateStudent).toHaveBeenCalledWith('student-1', { mentorGithuId: 'mentor-1' }));
    expect(onClose).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith('Student has been added to mentor');

    updateStudent.mockRejectedValueOnce(new Error('failed'));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(error).toHaveBeenCalledWith('Error: failed'));

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
