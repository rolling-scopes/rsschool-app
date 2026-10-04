import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NoCourses } from './NoCourses';

vi.mock('@ant-design/icons', () => ({ MehTwoTone: () => null }));
vi.mock('antd', () => ({
  Button: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  Result: ({ title, subTitle, extra }: Record<'title' | 'subTitle' | 'extra', ReactNode>) => (
    <main>
      <h1>{title}</h1>
      <p>{subTitle}</p>
      {extra}
    </main>
  ),
}));

describe('NoCourses', () => {
  test('renders the empty state and home link', () => {
    render(<NoCourses />);

    expect(screen.getByText('There are no available courses.')).toBeInTheDocument();
    expect(screen.getByText('Please come back later.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/');
  });
});
