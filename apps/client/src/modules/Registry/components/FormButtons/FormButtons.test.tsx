import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { FormButtons } from './FormButtons';

type Props = {
  onPrevious?: () => void;
  submitTitle?: string;
};

const previousHandler = jest.fn();
const submitHandler = jest.fn();

const renderFormButtons = ({ onPrevious, submitTitle }: Props = {}) =>
  render(
    <Form onFinish={submitHandler}>
      <FormButtons onPrevious={onPrevious} submitTitle={submitTitle} />
    </Form>,
  );

describe('FormButtons', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = userEvent.setup();

  test('should render only Submit button', () => {
    renderFormButtons();

    const submitButton = screen.queryByRole('button', { name: /submit/i });
    const previousButton = screen.queryByRole('button', { name: /previous/i });
    expect(submitButton).toBeInTheDocument();
    expect(previousButton).not.toBeInTheDocument();
  });

  test('should render submit button with custom title', () => {
    const submitTitle = 'Continue';
    renderFormButtons({ submitTitle });

    const submitButton = screen.queryByRole('button', { name: submitTitle });
    expect(submitButton).toBeInTheDocument();
  });

  test('should render both buttons (submit & previous)', () => {
    renderFormButtons({ onPrevious: previousHandler });

    const submitButton = screen.queryByRole('button', { name: /submit/i });
    const previousButton = screen.queryByRole('button', { name: /previous/i });
    expect(submitButton).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();
  });

  test('should call previousHandler', async () => {
    renderFormButtons({ onPrevious: previousHandler });

    const button = await screen.findByRole('button', { name: /previous/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(previousHandler).toHaveBeenCalled();
  });

  test('should call submitHandler', async () => {
    renderFormButtons();

    const button = await screen.findByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(submitHandler).toHaveBeenCalled();
  });
});
