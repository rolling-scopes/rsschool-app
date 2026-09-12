import { render, screen } from '@testing-library/react';
import { Help } from './Help';

describe('Footer Help', () => {
  it('renders the section title and support links', () => {
    render(<Help />);

    expect(screen.getByText('Help')).toBeInTheDocument();
    const docs = screen.getByRole('link', { name: /Docs/ });
    expect(docs).toHaveAttribute('href', 'https://rs.school/docs');
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
