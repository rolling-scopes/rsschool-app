import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentMentorModal } from './StudentMentorModal';

// The search fields are remote-search widgets with their own tests; stub them
// with a button that calls the Form.Item-injected onChange so we can drive the
// modal's submit wiring like a user without antd Select portal timing.
vi.mock('./StudentSearch', () => ({
  StudentSearch: ({ onChange }: { onChange?: (v: string) => void }) => (
    <button type="button" onClick={() => onChange?.('stud-1')}>
      pick student
    </button>
  ),
}));
vi.mock('./MentorSearch', () => ({
  MentorSearch: ({ onChange }: { onChange?: (v: string) => void }) => (
    <button type="button" onClick={() => onChange?.('ment-1')}>
      pick mentor
    </button>
  ),
}));

describe('StudentMentorModal', () => {
  const baseProps = {
    open: true,
    courseId: 1,
    onCancel: vi.fn(),
    onOk: vi.fn(),
  };

  beforeEach(() => {
    baseProps.onCancel.mockClear();
    baseProps.onOk.mockClear();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<StudentMentorModal {...baseProps} open={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the Student and Mentor fields when open', () => {
    render(<StudentMentorModal {...baseProps} />);

    expect(screen.getByText('Student/Mentor')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Mentor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pick student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pick mentor/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting without selections', async () => {
    const user = userEvent.setup();
    render(<StudentMentorModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please select student')).toBeInTheDocument();
    expect(screen.getByText(/Please select\s+mentor/)).toBeInTheDocument();
    expect(baseProps.onOk).not.toHaveBeenCalled();
  });

  it('calls onOk with the selected student and mentor github ids', async () => {
    const user = userEvent.setup();
    render(<StudentMentorModal {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /pick student/i }));
    await user.click(screen.getByRole('button', { name: /pick mentor/i }));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(baseProps.onOk).toHaveBeenCalledWith('stud-1', 'ment-1'));
  });
});
