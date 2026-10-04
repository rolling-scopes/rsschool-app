import { render, screen } from '@testing-library/react';
import { Menu } from './Menu';

const data = [
  { icon: <span data-testid="icon-docs">i</span>, name: 'Docs', link: 'https://docs.rs.school', newTab: true },
  { icon: <span data-testid="icon-home">i</span>, name: 'Home', link: '/home', newTab: false },
];

describe('Footer Menu', () => {
  it('renders menu content and its empty variant', () => {
    const { rerender } = render(<Menu title="Help" data={data} />);

    expect(screen.getByText('Help')).toBeInTheDocument();

    const docs = screen.getByRole('link', { name: /Docs/ });
    expect(docs).toHaveAttribute('href', 'https://docs.rs.school');
    expect(docs).toHaveAttribute('target', '_blank');

    const home = screen.getByRole('link', { name: /Home/ });
    expect(home).toHaveAttribute('href', '/home');
    expect(home).toHaveAttribute('target', '_self');
    expect(screen.getByTestId('icon-docs')).toBeInTheDocument();
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();

    rerender(<Menu title="Empty" data={[]} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
