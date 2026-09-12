import { render, screen } from '@testing-library/react';
import { RegistryBanner } from './';

describe('<RegistryBanner />', () => {
  it('invites the user to register and forwards alert props', () => {
    const { rerender } = render(<RegistryBanner />);
    expect(screen.getByText(/looking for mentors/i)).toBeInTheDocument();
    // antd renders Button with href as an anchor (role="link").
    const link = screen.getByRole('link', { name: /register as mentor/i });
    expect(link).toHaveAttribute('href', '/registry/mentor');

    rerender(<RegistryBanner type="success" />);

    expect(screen.getByRole('alert')).toHaveClass('ant-alert-success');
  });
});
