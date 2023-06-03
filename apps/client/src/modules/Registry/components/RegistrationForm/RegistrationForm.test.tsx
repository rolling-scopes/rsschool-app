import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { FORM_TITLES } from 'modules/Registry/constants';
import { RegistrationForm } from './RegistrationForm';

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

  return <RegistrationForm form={form} handleSubmit={jest.fn()} steps={steps} currentStep={0} type={type} />;
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

    const content = await screen.findByText(`${steps[0].title}-content`);
    expect(content).toBeInTheDocument();
  });
});
