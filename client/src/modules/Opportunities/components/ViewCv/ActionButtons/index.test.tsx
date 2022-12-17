import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActionButtons } from './index';

const mockUrl = 'https://example.com';

const mockSwitchView = jest.fn();
const mockCopyToClipboard = jest.fn();
const mockOnRemoveConsent = jest.fn();

jest.mock('react-use', () => ({
  useCopyToClipboard: () => [jest.fn(), mockCopyToClipboard],
}));

describe('ActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have Edit, Share, Delete buttons', () => {
    render(<ActionButtons isExpired={false} />);

    const editButton = screen.getByRole('button', { name: /edit cv/i });
    const shareButton = screen.getByRole('button', { name: /share/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(editButton).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  test('should switch view by click on Edit button', () => {
    render(<ActionButtons isExpired={false} switchView={mockSwitchView} />);

    const editButton = screen.getByRole('button', { name: /edit cv/i });

    fireEvent.click(editButton);

    expect(mockSwitchView).toHaveBeenCalled();
  });

  test('should copy to clipboard by click on Share button if url is provided', () => {
    render(<ActionButtons url={mockUrl} isExpired={false} switchView={mockSwitchView} />);

    const shareButton = screen.getByRole('button', { name: /share/i });

    fireEvent.click(shareButton);

    // const successNotification = screen.getByText('Copied to clipboard');

    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockUrl);
    // expect(successNotification).toBeInTheDocument();
  });

  test('should not to clipboard by click on Share button if url is not provided', () => {
    render(<ActionButtons isExpired={false} switchView={mockSwitchView} />);

    const shareButton = screen.getByRole('button', { name: /share/i });

    fireEvent.click(shareButton);

    // const successNotification = screen.queryByText('Copied to clipboard');

    expect(mockCopyToClipboard).not.toHaveBeenCalled();
    // expect(successNotification).toBeInTheDocument();
  });

  test('should disable Share button should if CV is expired', () => {
    render(<ActionButtons isExpired={true} />);
    const shareButton = screen.getByRole('button', { name: /share/i });

    expect(shareButton).toBeDisabled();
  });

  test('should show and hide delete confirmation modal correctly', async () => {
    render(<ActionButtons isExpired={true} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    fireEvent.click(deleteButton);

    const modalTitle = await screen.findByText('Delete your CV');
    const modalBodyFragment = await screen.findByText(/are you sure you want to delete your cv/i);
    const modalConfirmButton = await screen.findByRole('button', { name: /delete cv/i });
    const modalCancelButton = await screen.findByRole('button', { name: /cancel/i });

    expect(modalTitle).toBeInTheDocument();
    expect(modalBodyFragment).toBeInTheDocument();
    expect(modalConfirmButton).toBeInTheDocument();
    expect(modalCancelButton).toBeInTheDocument();

    fireEvent.click(modalCancelButton);

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());
    await waitFor(() => expect(modalBodyFragment).not.toBeInTheDocument());
    await waitFor(() => expect(modalConfirmButton).not.toBeInTheDocument());
    await waitFor(() => expect(modalCancelButton).not.toBeInTheDocument());
  });

  test('should delete CV after confirmation', async () => {
    render(<ActionButtons isExpired={true} onRemoveConsent={mockOnRemoveConsent} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    fireEvent.click(deleteButton);

    const modalConfirmButton = await screen.findByRole('button', { name: /delete cv/i });

    expect(modalConfirmButton).toBeInTheDocument();

    fireEvent.click(modalConfirmButton);

    expect(mockOnRemoveConsent).toHaveBeenCalled();
  });
});
