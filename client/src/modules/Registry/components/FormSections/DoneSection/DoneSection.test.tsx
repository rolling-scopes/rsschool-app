import { render, screen } from '@testing-library/react';
import { DoneSection } from './DoneSection';

const courseName = 'test-course';

describe('DoneSection', () => {
  test('should render Continue only on the student form', async () => {
    const { rerender } = render(<DoneSection courseName={courseName} />);

    const link = await screen.findByRole('link', { name: /continue/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
    rerender(<DoneSection />);

    expect(screen.queryByRole('link', { name: /continue/i })).not.toBeInTheDocument();
  });
});
