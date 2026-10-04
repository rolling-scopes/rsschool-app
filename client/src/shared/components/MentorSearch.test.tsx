import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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

  it('searches mentors for the given course and renders the results', async () => {
    const user = setupUser();
    render(<MentorSearch courseId={42} />);

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    fireEvent.mouseDown(combobox);
    await user.type(combobox, 'men');

    await waitFor(() => expect(searchMentors).toHaveBeenCalledWith(42, 'men'));
    expect(await screen.findByText(/Mentor X/)).toBeInTheDocument();
  });
});
