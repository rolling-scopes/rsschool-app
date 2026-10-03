import { render, screen } from '@testing-library/react';
import { CouseNoAccessPage } from './';

vi.mock('antd', () => ({
  Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Col: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, href }: React.ComponentProps<'a'>) => <a href={href}>{children}</a>,
  Result: ({
    title,
    subTitle,
    extra,
  }: {
    title: React.ReactNode;
    subTitle: React.ReactNode;
    extra: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{subTitle}</p>
      {extra}
    </main>
  ),
}));

describe('<CouseNoAccessPage />', () => {
  it('renders the no-access course result', () => {
    render(<CouseNoAccessPage />);
    expect(screen.getByText('You Have No Access to Course Page')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
