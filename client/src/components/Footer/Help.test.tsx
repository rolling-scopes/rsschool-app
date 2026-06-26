import { render, screen } from '@testing-library/react';
import { Help } from './Help';

describe('Footer Help', () => {
  it('renders the Help section title', () => {
    render(<Help />);
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('renders the documentation and bug report links', () => {
    render(<Help />);

    const docs = screen.getByRole('link', { name: /Docs/ });
    expect(docs).toHaveAttribute('href', 'https://docs.rs.school');
    expect(docs).toHaveAttribute('target', '_blank');

    expect(screen.getByRole('link', { name: /Report a bug/ })).toHaveAttribute(
      'href',
      expect.stringContaining('bug-report.md'),
    );
    expect(screen.getByRole('link', { name: /Report a data issue/ })).toHaveAttribute(
      'href',
      expect.stringContaining('data-issue-report.md'),
    );
  });
});
