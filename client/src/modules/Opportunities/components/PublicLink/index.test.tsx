import { fireEvent, render, screen } from '@testing-library/react';
import { PublicLink } from './index';

const mockUrl = 'https://expample.com';

const mockCopyToClipboard = vi.fn();

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [vi.fn(), mockCopyToClipboard],
}));

describe('PublicLink', () => {
  test('renders empty and populated states and copies the public URL', async () => {
    const { rerender } = render(<PublicLink url={null} />);

    const title = screen.queryByText('Public Link');
    const link = screen.queryByRole('link');
    const copyBtn = screen.queryByRole('button');

    expect(title).not.toBeInTheDocument();
    expect(link).not.toBeInTheDocument();
    expect(copyBtn).not.toBeInTheDocument();

    rerender(<PublicLink url={mockUrl} />);

    const renderedTitle = screen.getByText('Public Link');
    const renderedLink = screen.getByRole('link', { name: mockUrl });

    expect(renderedTitle).toBeInTheDocument();
    expect(renderedLink).toBeInTheDocument();
    expect(renderedLink).toHaveAttribute('href', mockUrl);

    fireEvent.click(screen.getByRole('button'));

    const notification = await screen.findByText('Copied to clipboard');
    expect(notification).toBeInTheDocument();

    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockUrl);
  });
});
