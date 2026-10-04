import { fireEvent, render, screen } from '@testing-library/react';
import CopyToClipboardButton from '@client/shared/components/CopyToClipboardButton';
import { useCopyToClipboard } from 'react-use';

vi.mock('@client/hooks', () => ({
  useMessage: () => ({
    message: { success: mockSuccess },
  }),
}));

vi.mock('react-use', () => ({
  useCopyToClipboard: vi.fn(),
}));

const TEST_VALUE = 'test-value';

const mockSuccess = vi.fn();
const mockCopyToClipboard = vi.fn();

describe('CopyToClipboardButton', () => {
  beforeEach(() => {
    vi.mocked(useCopyToClipboard).mockReturnValue([{ noUserInteraction: true }, mockCopyToClipboard]);
  });

  it('should render, copy, and apply default and custom button types', () => {
    const { rerender } = render(<CopyToClipboardButton value={TEST_VALUE} />);
    const button = screen.getByTestId('copy-to-clipboard');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('ant-btn-dashed');
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('anticon anticon-copy');

    fireEvent.click(button);

    expect(mockCopyToClipboard).toHaveBeenCalledWith(TEST_VALUE);

    rerender(<CopyToClipboardButton value={TEST_VALUE} type="primary" />);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('ant-btn-primary');
  });
});
