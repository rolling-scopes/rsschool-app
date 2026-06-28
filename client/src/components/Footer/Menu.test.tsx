import { render, screen } from '@testing-library/react';
import { Menu } from './Menu';

const data = [
  { icon: <span data-testid="icon-docs">i</span>, name: 'Docs', link: 'https://docs.rs.school', newTab: true },
  { icon: <span data-testid="icon-home">i</span>, name: 'Home', link: '/home', newTab: false },
];

describe('Footer Menu', () => {
  it('renders the title', () => {
    render(<Menu title="Help" data={data} />);
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('renders a link per data entry with correct href and target', () => {
    render(<Menu title="Help" data={data} />);

    const docs = screen.getByRole('link', { name: /Docs/ });
    expect(docs).toHaveAttribute('href', 'https://docs.rs.school');
    expect(docs).toHaveAttribute('target', '_blank');

    const home = screen.getByRole('link', { name: /Home/ });
    expect(home).toHaveAttribute('href', '/home');
    expect(home).toHaveAttribute('target', '_self');
  });

  it('renders the icons for each entry', () => {
    render(<Menu title="Help" data={data} />);
    expect(screen.getByTestId('icon-docs')).toBeInTheDocument();
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
  });

  it('renders nothing but the title for empty data', () => {
    render(<Menu title="Empty" data={[]} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
