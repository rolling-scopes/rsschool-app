import { render, screen } from '@testing-library/react';
import { DoneSection } from './DoneSection';

const renderDoneSection = (courseName?: string) => {
  render(<DoneSection courseName={courseName} />);
};

const courseName = 'test-course';

describe('DoneSection', () => {
  test('should render Continue link on student form', async () => {
    renderDoneSection(courseName);

    const link = await screen.findByRole('link', { name: /continue/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  test('should not render Continue link on mentor form', async () => {
    renderDoneSection();

    const link = screen.queryByRole('link', { name: /continue/i });
    expect(link).not.toBeInTheDocument();
  });
});
