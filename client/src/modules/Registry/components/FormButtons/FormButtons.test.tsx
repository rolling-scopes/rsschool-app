import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { FormButtons } from './FormButtons';

type Props = {
  onPrevious?: () => void;
  submitTitle?: string;
};

const previousHandler = vi.fn();
const submitHandler = vi.fn();

const renderFormButtons = ({ onPrevious, submitTitle }: Props = {}) =>
  render(
    <Form onFinish={submitHandler}>
      <FormButtons onPrevious={onPrevious} submitTitle={submitTitle} />
    </Form>,
  );

describe('FormButtons', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render submit button with custom title', () => {
    const submitTitle = 'Continue';
    renderFormButtons({ submitTitle });

    const submitButton = screen.queryByRole('button', { name: submitTitle });
    expect(submitButton).toBeInTheDocument();
  });

  test('should render both buttons and call previousHandler', async () => {
    const user = userEvent.setup();
    renderFormButtons({ onPrevious: previousHandler });

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /previous/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(previousHandler).toHaveBeenCalled();
  });

  test('should render only Submit and call submitHandler', async () => {
    const user = userEvent.setup();
    renderFormButtons();

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(submitHandler).toHaveBeenCalled();
  });
});
