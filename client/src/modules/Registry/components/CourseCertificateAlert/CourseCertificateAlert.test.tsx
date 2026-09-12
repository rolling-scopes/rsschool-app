import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CourseCertificateAlert } from './CourseCertificateAlert';

vi.mock('antd', () => ({
  Button: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  Result: ({ icon, title, subTitle, extra }: Record<'icon' | 'title' | 'subTitle' | 'extra', ReactNode>) => (
    <main>
      {icon}
      <h1>{title}</h1>
      <p>{subTitle}</p>
      {extra}
    </main>
  ),
}));

describe('CourseCertificateAlert', () => {
  test('renders the default content and a specified discipline', () => {
    const { rerender } = render(<CourseCertificateAlert />);

    expect(
      screen.getByText('To register for this course, you need to already have any RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Complete any course to unlock access.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('img', { name: 'train icon' })).toBeInTheDocument();

    rerender(<CourseCertificateAlert certificateDiscipline="JavaScript" />);

    expect(
      screen.getByText('To register for this course, you need to already have JavaScript RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Complete JavaScript course to unlock access.')).toBeInTheDocument();
  });
});
