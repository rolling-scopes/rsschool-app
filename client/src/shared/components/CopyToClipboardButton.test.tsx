/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyToClipboardButton from './CopyToClipboardButton';

const copyToClipboard = vi.fn();

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined, error: undefined, noUserInteraction: true }, copyToClipboard],
}));

describe('CopyToClipboardButton', () => {
  beforeEach(() => {
    copyToClipboard.mockClear();
  });

  it('renders a copy button', () => {
    render(<CopyToClipboardButton value="hello@rs.school" />);

    expect(screen.getByTestId('copy-to-clipboard')).toBeInTheDocument();
  });

  it('copies the value to the clipboard on click', async () => {
    const user = userEvent.setup();
    render(<CopyToClipboardButton value="hello@rs.school" />);

    await user.click(screen.getByTestId('copy-to-clipboard'));

    expect(copyToClipboard).toHaveBeenCalledWith('hello@rs.school');
  });

  it('applies the provided button type', () => {
    const { container } = render(<CopyToClipboardButton value="x" type="primary" />);

    expect(container.querySelector('.ant-btn-primary')).toBeInTheDocument();
  });
});
