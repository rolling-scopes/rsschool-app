import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorSearch } from './MentorSearch';

// MentorSearch instantiates CourseMentorsApi at module load, so the mocked class
// must reference the spy via vi.hoisted (a plain const is still in its TDZ here).
const { searchMentors } = vi.hoisted(() => ({ searchMentors: vi.fn() }));

// Boundary: stub the generated API client so no real HTTP happens.
vi.mock('@client/api', () => ({
  CourseMentorsApi: class {
    searchMentors = searchMentors;
  },
}));

describe('MentorSearch', () => {
  beforeEach(() => {
    searchMentors.mockReset();
    searchMentors.mockResolvedValue({
      data: [{ id: 1, githubId: 'mentor-x', name: 'Mentor X' }],
    });
  });

  it('renders a combobox', () => {
    render(<MentorSearch courseId={42} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('searches mentors for the given course and renders the results', async () => {
    const user = userEvent.setup();
    render(<MentorSearch courseId={42} />);

    const combobox = screen.getByRole('combobox');
    combobox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await user.type(combobox, 'men');

    await waitFor(() => expect(searchMentors).toHaveBeenCalledWith(42, 'men'));
    expect(await screen.findByText(/Mentor X/)).toBeInTheDocument();
  });
});
