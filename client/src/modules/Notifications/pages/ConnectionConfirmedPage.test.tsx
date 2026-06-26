import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { ConnectionConfirmed } from './ConnectionConfirmedPage';

// PageLayout / FooterLayout pull in session + router heavy deps; replace with passthroughs.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/components/Footer', () => ({
  FooterLayout: () => <footer>footer</footer>,
}));

function setSearch(search: string) {
  window.history.pushState({}, '', `/${search}`);
}

describe('ConnectionConfirmed', () => {
  it('renders a success alert naming the connection type from the URL', () => {
    setSearch('?connectionType=telegram');
    render(<ConnectionConfirmed />);

    expect(screen.getByText(/successfully connected your telegram/i)).toBeInTheDocument();
  });

  it('links to the notifications settings page', () => {
    setSearch('?connectionType=discord');
    render(<ConnectionConfirmed />);

    const link = screen.getByRole('link', { name: /notifications/i });
    expect(link).toHaveAttribute('href', '/profile/notifications');
  });

  it('renders the page title and footer', () => {
    setSearch('?connectionType=email');
    render(<ConnectionConfirmed />);

    expect(screen.getByRole('heading', { name: /connection confirmed/i })).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
