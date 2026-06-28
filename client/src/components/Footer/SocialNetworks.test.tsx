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

  it('opens every link in a new tab (the only reachable newTab branch)', () => {
    render(<SocialNetworks />);

    // `socialLinks` is a private module constant whose entries all set `newTab: true`,
    // and `SocialNetworks` accepts no props, so only the `_blank` side of the
    // `linkInfo.newTab ? '_blank' : '_self'` ternary (SocialNetworks.tsx:47) is reachable.
    // unreachable: the `_self` branch requires an entry with `newTab: false`, which the
    // hardcoded, non-exported, non-parameterized `socialLinks` array never provides.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
