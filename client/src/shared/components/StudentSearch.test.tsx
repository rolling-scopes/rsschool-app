import { act, render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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
    vi.useFakeTimers();
    searchStudents.mockReset();
    searchStudents.mockResolvedValue([{ id: 1, githubId: 'student-x', name: 'Student X', mentor: null }]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('searches students via the course service and renders the results', async () => {
    const user = setupUser({ advanceTimers: vi.advanceTimersByTimeAsync });
    render(<StudentSearch courseId={7} />);

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    await user.type(combobox, 'stu');

    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(searchStudents).toHaveBeenCalledWith('stu', false);
    expect(screen.getByText(/Student X/)).toBeInTheDocument();
  });

  it('forwards the onlyStudentsWithoutMentorShown flag to the service', async () => {
    const user = setupUser({ advanceTimers: vi.advanceTimersByTimeAsync });
    render(<StudentSearch courseId={7} onlyStudentsWithoutMentorShown />);

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'stu');

    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(searchStudents).toHaveBeenCalledWith('stu', true);
  });
});
