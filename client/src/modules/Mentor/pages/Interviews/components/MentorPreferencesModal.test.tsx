import { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormInstance } from 'antd';
import { Form } from 'antd';
import type { Session, CourseInfo } from '@client/components/withSession';
import { MentorOptionsProvider, MentorOptionsContext } from './MentorPreferencesModal';

const { getMentorOptions, createMentor } = vi.hoisted(() => ({
  getMentorOptions: vi.fn(),
  createMentor: vi.fn(),
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    MentorsApi: class {
      getMentorOptions = getMentorOptions;
    },
  };
});

vi.mock('@client/services/course', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/services/course')>();
  return {
    ...actual,
    CourseService: class {
      createMentor = createMentor;
    },
  };
});

// MentorOptions wraps StudentSearch (remote) + several selects. Stub it to a
// minimal form bound to the provided FormInstance and register all three fields
// so that the modal's form.validateFields() returns the values it forwards to
// createMentor.
vi.mock('@client/components/MentorOptions', () => ({
  MentorOptions: ({ form }: { form: FormInstance }) => (
    <Form
      form={form}
      initialValues={{ maxStudentsLimit: 3, preferedStudentsLocation: 'any', students: [{ value: 5 }] }}
    >
      <Form.Item name="maxStudentsLimit" label="Max students">
        <input aria-label="max-students" />
      </Form.Item>
      <Form.Item name="preferedStudentsLocation" hidden>
        <input aria-label="prefered-location" />
      </Form.Item>
      <Form.Item name="students" hidden>
        <input aria-label="students" />
      </Form.Item>
    </Form>
  ),
}));

const SESSION = {
  id: 1,
  githubId: 'mentor-gh',
  courses: { 400: { mentorId: 17, roles: ['mentor'] } as CourseInfo },
} as unknown as Session;

const COURSE = { id: 400, name: 'RS 2025' };

// A small consumer to drive the context open button.
function OpenButton() {
  const { showMentorOptions } = useContext(MentorOptionsContext);
  return <button onClick={showMentorOptions}>open-options</button>;
}

function renderProvider(session: Session = SESSION) {
  render(
    <MentorOptionsProvider course={COURSE} session={session}>
      <OpenButton />
    </MentorOptionsProvider>,
  );
}

describe('MentorPreferencesModal', () => {
  beforeEach(() => {
    getMentorOptions.mockReset().mockResolvedValue({
      data: {
        students: [{ id: 5, githubId: 'stud', name: 'Stud' }],
        maxStudentsLimit: 3,
        preferedStudentsLocation: 'any',
      },
    });
    createMentor.mockReset().mockResolvedValue({});
  });

  it('should not render the modal until showMentorOptions is invoked', () => {
    renderProvider();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open the modal and load mentor options when triggered', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'open-options' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('RS 2025')).toBeInTheDocument();
    await waitFor(() => expect(getMentorOptions).toHaveBeenCalledWith(17, 400));
  });

  it('should close the modal on cancel', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'open-options' }));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: /Cancel/ }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should submit the preferences via createMentor and close on confirm', async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'open-options' }));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: /Confirm/ }));

    await waitFor(() =>
      expect(createMentor).toHaveBeenCalledWith('mentor-gh', {
        maxStudentsLimit: 3,
        preferedStudentsLocation: 'any',
        students: [5],
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should not call getMentorOptions when the session has no mentorId for the course', async () => {
    const user = userEvent.setup();
    renderProvider({
      ...SESSION,
      courses: { 400: { roles: ['mentor'] } as CourseInfo },
    } as Session);

    await user.click(screen.getByRole('button', { name: 'open-options' }));
    await screen.findByRole('dialog');

    expect(getMentorOptions).not.toHaveBeenCalled();
  });
});
