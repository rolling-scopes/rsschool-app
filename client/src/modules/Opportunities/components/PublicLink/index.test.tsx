import { fireEvent, render, screen } from '@testing-library/react';
import { PublicLink } from './index';

const mockUrl = 'https://expample.com';

const mockCopyToClipboard = jest.fn();

jest.mock('react-use', () => ({
  useCopyToClipboard: () => [jest.fn(), mockCopyToClipboard],
}));

describe('PublicLink', () => {
  test('should not render anything if url is not provided', () => {
    render(<PublicLink url={null} />);

    const title = screen.queryByText('Public Link');
    const link = screen.queryByRole('link');
    const copyBtn = screen.queryByRole('button');

    expect(title).not.toBeInTheDocument();
    expect(link).not.toBeInTheDocument();
    expect(copyBtn).not.toBeInTheDocument();
  });

  test('should display title and link', () => {
    render(<PublicLink url={mockUrl} />);

    const title = screen.getByText('Public Link');
    const link = screen.getByRole('link', { name: mockUrl });

    expect(title).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', mockUrl);
  });

  test('should copy link', () => {
    render(<PublicLink url={mockUrl} />);

    const copyBtn = screen.getByRole('button');

    fireEvent.click(copyBtn);

    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockUrl);

    const notification = screen.getByText('Copied to clipboard');

    expect(notification).toBeInTheDocument();
  });
});
