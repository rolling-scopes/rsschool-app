import { render, screen } from '@testing-library/react';
import { SocialNetworks } from './SocialNetworks';

describe('Footer SocialNetworks', () => {
  it('renders all four social links opening in a new tab', () => {
    render(<SocialNetworks />);

    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/rolling-scopes/rsschool-app',
    );
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/c/rollingscopesschool',
    );
    expect(screen.getByRole('link', { name: /Discord/ })).toHaveAttribute('href', 'https://discord.gg/PRADsJB');
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/the-rolling-scopes-school/',
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    links.forEach(link => expect(link).toHaveAttribute('target', '_blank'));
  });
});
