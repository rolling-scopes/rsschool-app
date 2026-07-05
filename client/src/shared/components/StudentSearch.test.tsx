import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentSearch } from './StudentSearch';

// Use vi.hoisted so the mocked class can reference the spy at module-eval time.
const { searchStudents } = vi.hoisted(() => ({ searchStudents: vi.fn() }));

// Boundary: stub the course service so the wrapper's wiring is tested without HTTP.
vi.mock('@client/services/course', () => ({
  CourseService: class {
    searchStudents = searchStudents;
  },
}));

describe('StudentSearch', () => {
  beforeEach(() => {
    searchStudents.mockReset();
    searchStudents.mockResolvedValue([{ id: 1, githubId: 'student-x', name: 'Student X', mentor: null }]);
  });

  it('renders a combobox', () => {
    render(<StudentSearch courseId={7} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('searches students via the course service and renders the results', async () => {
    const user = userEvent.setup();
    render(<StudentSearch courseId={7} />);

    const combobox = screen.getByRole('combobox');
    combobox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await user.type(combobox, 'stu');

    await waitFor(() => expect(searchStudents).toHaveBeenCalledWith('stu', false));
    expect(await screen.findByText(/Student X/)).toBeInTheDocument();
  });

  it('forwards the onlyStudentsWithoutMentorShown flag to the service', async () => {
    const user = userEvent.setup();
    render(<StudentSearch courseId={7} onlyStudentsWithoutMentorShown />);

    const combobox = screen.getByRole('combobox');
    combobox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await user.type(combobox, 'stu');

    await waitFor(() => expect(searchStudents).toHaveBeenCalledWith('stu', true));
  });
});
