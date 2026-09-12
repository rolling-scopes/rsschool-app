import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExtraInfo } from './ExtraInfo';

// Real antd Button/Tag + real isRegistrationNotStarted domain helper.

const FUTURE = '2999-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';

describe('<ExtraInfo />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and handles open, registered, and not-started states', () => {
    const onRegister = vi.fn();
    const { rerender } = render(
      <ExtraInfo id={42} registrationStart={PAST} isRegistered={false} onRegister={onRegister} />,
    );

    const button = screen.getByRole('button', { name: /^register$/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onRegister).toHaveBeenCalledWith('42');

    onRegister.mockClear();
    rerender(<ExtraInfo id={42} registrationStart={PAST} isRegistered={true} onRegister={onRegister} />);

    const registeredButton = screen.getByRole('button', { name: /registered/i });
    expect(registeredButton).toBeDisabled();

    fireEvent.click(registeredButton);
    expect(onRegister).not.toHaveBeenCalled();

    rerender(<ExtraInfo id={42} registrationStart={FUTURE} isRegistered={false} onRegister={onRegister} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/registration starts on/i)).toBeInTheDocument();
  });
});
