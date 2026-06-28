import { render, screen } from '@testing-library/react';
import { CourseCertificateAlert } from './CourseCertificateAlert';

describe('CourseCertificateAlert', () => {
  test('falls back to "any" discipline when none provided', () => {
    render(<CourseCertificateAlert />);

    expect(
      screen.getByText('To register for this course, you need to already have any RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Complete any course to unlock access.')).toBeInTheDocument();
  });

  test('renders the specific discipline name passed in', () => {
    render(<CourseCertificateAlert certificateDiscipline="JavaScript" />);

    expect(
      screen.getByText('To register for this course, you need to already have JavaScript RS School certificate.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Complete JavaScript course to unlock access.')).toBeInTheDocument();
  });

  test('renders a Back to Home link and the train icon', () => {
    render(<CourseCertificateAlert />);

    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('img', { name: 'train icon' })).toBeInTheDocument();
  });
});
