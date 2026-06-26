import { render, screen } from '@testing-library/react';
import { SocialNetworks } from './SocialNetworks';

describe('Footer SocialNetworks', () => {
  it('renders all four social links opening in a new tab', () => {
    render(<SocialNetworks />);

    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(github).toHaveAttribute('href', 'https://github.com/rolling-scopes/rsschool-app');
    expect(github).toHaveAttribute('target', '_blank');

    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/c/rollingscopesschool',
    );
    expect(screen.getByRole('link', { name: /Discord/ })).toHaveAttribute('href', 'https://discord.gg/PRADsJB');
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/the-rolling-scopes-school/',
    );
  });

  it('renders exactly four links', () => {
    render(<SocialNetworks />);
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });
});
