import { act, render, screen } from '@testing-library/react';
import CopyToClipboardButton from '@client/components/CopyToClipboardButton';
import { useMessage } from 'hooks';
import { useCopyToClipboard } from 'react-use';

jest.mock('hooks', () => ({
  useMessage: jest.fn(),
}));

jest.mock('react-use', () => ({
  useCopyToClipboard: jest.fn(),
}));

const TEST_VALUE = 'test-value';

describe('CopyToClipboardButton', () => {
  const mockSuccess = jest.fn();
  const mockCopyToClipboard = jest.fn();

  beforeEach(() => {
    (useMessage as jest.Mock).mockReturnValue({ message: { success: mockSuccess } });
    (useCopyToClipboard as jest.Mock).mockReturnValue([null, mockCopyToClipboard]);
  });

  it('should render with default style', () => {
    render(<CopyToClipboardButton value={TEST_VALUE} />);
    const button = screen.getByTestId('copy-to-clipboard');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('ant-btn-dashed');
  });

  it('should render button with copy icon', () => {
    render(<CopyToClipboardButton value={TEST_VALUE}/>)
    const icon = screen.getByRole('img')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('anticon anticon-copy')
  })

  it('should copy text to clipboard on click', async () => {
    render(<CopyToClipboardButton value={TEST_VALUE} />);
    const button = screen.getByTestId('copy-to-clipboard');

    act(() => button.click())

    expect(mockCopyToClipboard).toHaveBeenCalledWith(TEST_VALUE);
    expect(mockSuccess).toHaveBeenCalledWith(`Copied ${TEST_VALUE} to clipboard`);
  });

  it('should render with custom button type', () => {
    render(<CopyToClipboardButton value={TEST_VALUE} type="primary" />);
    const button = screen.getByTestId('copy-to-clipboard');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('ant-btn-primary');
  });
});
