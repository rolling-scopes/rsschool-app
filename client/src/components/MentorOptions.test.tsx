import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { MentorDetailsDtoStudentsPreferenceEnum } from '@client/api';
import { MentorOptions, Options } from './MentorOptions';

// StudentSearch is a remote-search Select (CourseService backed). Stub it.
vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: ({ courseId }: { courseId: number }) => (
    <div data-testid="student-search">student-search-{courseId}</div>
  ),
}));

const course = { id: 7, name: 'RS 2024', minStudentsPerMentor: 2 };

function Wrapper({
  mentorData = null,
  handleSubmit,
  showSubmitButton,
}: {
  mentorData?: Options | null;
  handleSubmit?: (values: Options) => Promise<void>;
  showSubmitButton?: boolean;
}) {
  const [form] = Form.useForm();
  return (
    <MentorOptions
      course={course}
      form={form}
      mentorData={mentorData}
      handleSubmit={handleSubmit}
      showSubmitButton={showSubmitButton}
    />
  );
}

describe('MentorOptions', () => {
  it('renders the labels and the stubbed student search', () => {
    render(<Wrapper />);

    expect(screen.getByText('How many students are you ready to mentor per course?')).toBeInTheDocument();
    expect(screen.getByText('Preferred students location')).toBeInTheDocument();
    expect(screen.getByText('Predefined students (if any)')).toBeInTheDocument();
    expect(screen.getByTestId('student-search')).toHaveTextContent('student-search-7');
  });

  it('renders student-count options offset by the course minimum', () => {
    render(<Wrapper />);

    fireEvent.mouseDown(screen.getByText('Students count...'));
    // first option = 0 + minStudentsPerMentor(2), last = 6 + 2 = 8
    expect(screen.getByTitle('2')).toBeInTheDocument();
    expect(screen.getByTitle('8')).toBeInTheDocument();
  });

  it('renders the location options', () => {
    render(<Wrapper />);

    fireEvent.mouseDown(screen.getByText('Select a prefered option...'));
    expect(screen.getByTitle('Any city or country')).toBeInTheDocument();
    expect(screen.getByTitle('My country only')).toBeInTheDocument();
    expect(screen.getByTitle('My city only')).toBeInTheDocument();
  });

  it('shows the confirm button by default and hides it when disabled', () => {
    const { rerender } = render(<Wrapper />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    rerender(<Wrapper showSubmitButton={false} />);
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('prefills the form from mentorData', () => {
    render(
      <Wrapper
        mentorData={{
          maxStudentsLimit: 5,
          preferedStudentsLocation: MentorDetailsDtoStudentsPreferenceEnum.City,
        }}
      />,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('My city only')).toBeInTheDocument();
  });

  it('validates required fields and blocks submit when empty', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Wrapper handleSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Please select students count')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits the selected values', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Wrapper handleSubmit={handleSubmit} />);

    fireEvent.mouseDown(screen.getByText('Students count...'));
    fireEvent.click(screen.getByTitle('2'));

    fireEvent.mouseDown(screen.getByText('Select a prefered option...'));
    fireEvent.click(screen.getByTitle('My country only'));

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ maxStudentsLimit: 2, preferedStudentsLocation: 'country' }),
      );
    });
  });
});
