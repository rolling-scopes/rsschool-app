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
  it('renders the connection type, settings link, title, and footer', () => {
    setSearch('?connectionType=telegram');
    render(<ConnectionConfirmed />);

    expect(screen.getByText(/successfully connected your telegram/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /notifications/i });
    expect(link).toHaveAttribute('href', '/profile/notifications');

    expect(screen.getByRole('heading', { name: /connection confirmed/i })).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
