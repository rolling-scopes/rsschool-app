/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
import CopyToClipboardButton from './CopyToClipboardButton';

const copyToClipboard = vi.fn();

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined, error: undefined, noUserInteraction: true }, copyToClipboard],
}));

describe('CopyToClipboardButton', () => {
  beforeEach(() => {
    copyToClipboard.mockClear();
  });

  it('renders, copies the value, and applies a custom button type', () => {
    const { container, rerender } = render(<CopyToClipboardButton value="hello@rs.school" />);

    expect(screen.getByTestId('copy-to-clipboard')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('copy-to-clipboard'));

    expect(copyToClipboard).toHaveBeenCalledWith('hello@rs.school');

    rerender(<CopyToClipboardButton value="x" type="primary" />);

    expect(container.querySelector('.ant-btn-primary')).toBeInTheDocument();
  });
});
