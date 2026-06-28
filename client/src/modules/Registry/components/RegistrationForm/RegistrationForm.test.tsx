import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Input } from 'antd';
import { FORM_TITLES } from '@client/modules/Registry/constants';
import { RegistrationForm } from './RegistrationForm';

// useFormLayout reads antd's Grid.useBreakpoint (destructured at module-init, so it cannot be
// monkey-patched after import). Mock the hook with a controllable small-screen flag; the hook's
// own breakpoint→layout logic is covered separately in useFormLayout.test.ts.
const { layoutState } = vi.hoisted(() => ({ layoutState: { isSmallScreen: false } }));
vi.mock('@client/modules/Registry/hooks', async () => {
  const actual = (await vi.importActual('@client/modules/Registry/hooks')) as Record<string, unknown>;
  return {
    ...actual,
    useFormLayout: () => ({
      formLayout: layoutState.isSmallScreen ? 'vertical' : 'horizontal',
      isSmallScreen: layoutState.isSmallScreen,
    }),
  };
});

const steps = [
  {
    title: 'general',
    content: <span>general-content</span>,
  },
  {
    title: 'done',
    content: <span>done-content</span>,
  },
];

const FormWrapper = ({ type }: { type?: 'mentor' | 'student' }) => {
  const [form] = Form.useForm();

  return <RegistrationForm form={form} handleSubmit={vi.fn()} steps={steps} currentStep={0} type={type} />;
};

const renderForm = (type?: 'mentor' | 'student') => {
  render(<FormWrapper type={type} />);
};

describe('RegistrationForm', () => {
  test('should render form', async () => {
    renderForm();

    const form = await screen.findByRole('form');
    expect(form).toBeInTheDocument();
  });

  test('should render mentor form title', async () => {
    renderForm();

    const title = await screen.findByText(FORM_TITLES.mentorForm);
    expect(title).toBeInTheDocument();
  });

  test('should render student form title', async () => {
    renderForm('student');

    const title = await screen.findByText(FORM_TITLES.studentForm);
    expect(title).toBeInTheDocument();
  });

  test.each(steps)('should render step title', async ({ title }) => {
    renderForm();

    const stepTitle = await screen.findByText(title);
    expect(stepTitle).toBeInTheDocument();
  });

  test('should render current step content', async () => {
    renderForm();

    const content = await screen.findByText(`${steps[0]?.title}-content`);
    expect(content).toBeInTheDocument();
  });

  test('hides step titles on small screens', async () => {
    // Force the small-screen layout so `isSmallScreen ? null : title` takes the null branch.
    layoutState.isSmallScreen = true;
    try {
      renderForm();

      await screen.findByRole('form');
      // Step titles are replaced with null on small screens, so they are not in the document.
      expect(screen.queryByText('general')).not.toBeInTheDocument();
      expect(screen.queryByText('done')).not.toBeInTheDocument();
    } finally {
      layoutState.isSmallScreen = false;
    }
  });

  test('scrolls to the first invalid field when submit fails validation', async () => {
    const user = userEvent.setup();
    const scrollToField = vi.fn();

    const stepsWithRequired = [
      {
        title: 'general',
        content: (
          <>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
              <Input />
            </Form.Item>
            {/* A submit-type button inside the form triggers onFinish / onFinishFailed. */}
            <button type="submit">submit-step</button>
          </>
        ),
      },
    ];

    const Wrapper = () => {
      const [form] = Form.useForm();
      form.scrollToField = scrollToField;
      return <RegistrationForm form={form} handleSubmit={vi.fn()} steps={stepsWithRequired} currentStep={0} />;
    };

    render(<Wrapper />);

    await user.click(screen.getByRole('button', { name: 'submit-step' }));

    // Validation fails → onFinishFailed runs → scrollToField is called with the field name array.
    await waitFor(() => expect(scrollToField).toHaveBeenCalledWith(['email']));
  });
});
