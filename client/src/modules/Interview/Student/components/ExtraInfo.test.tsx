import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExtraInfo } from './ExtraInfo';

// Real antd Button/Tag + real isRegistrationNotStarted domain helper.

const FUTURE = '2999-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';

describe('<ExtraInfo />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders an enabled "Register" button when registration is open and the user is not registered', () => {
    const onRegister = vi.fn();
    render(<ExtraInfo id={42} registrationStart={PAST} isRegistered={false} onRegister={onRegister} />);

    const button = screen.getByRole('button', { name: /^register$/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onRegister).toHaveBeenCalledWith('42');
  });

  it('renders a disabled "Registered" button (with check icon) and does not fire onRegister when already registered', () => {
    const onRegister = vi.fn();
    render(<ExtraInfo id={42} registrationStart={PAST} isRegistered={true} onRegister={onRegister} />);

    const button = screen.getByRole('button', { name: /registered/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onRegister).not.toHaveBeenCalled();
  });

  it('renders a "Registration starts on" tag (no button) when registration has not started', () => {
    render(<ExtraInfo id={42} registrationStart={FUTURE} isRegistered={false} onRegister={vi.fn()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/registration starts on/i)).toBeInTheDocument();
  });
});
