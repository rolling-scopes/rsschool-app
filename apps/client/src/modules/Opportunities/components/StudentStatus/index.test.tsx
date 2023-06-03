import { render, screen } from '@testing-library/react';
import { StudentStatus } from './index';

const mockId = '12345';

describe('StudentStatus', () => {
  test('should display certificate link if certificateId is provided', () => {
    render(<StudentStatus certificateId={mockId} isCourseCompleted={true} />);

    const certificateLink = screen.getByRole('link', { name: /certificate/i });

    expect(certificateLink).toBeInTheDocument();
    expect(certificateLink).toHaveAttribute('href', `/certificate/${mockId}`);
  });

  test.each`
    isCourseCompleted | expectedText
    ${true}           | ${'Completed'}
    ${false}          | ${'In Progress'}
  `(
    'should display "$expectedText" if isCourseCompleted is $isCourseCompleted',
    ({ isCourseCompleted, expectedText }) => {
      render(<StudentStatus certificateId={null} isCourseCompleted={isCourseCompleted} />);
      const status = screen.getByText(expectedText);

      expect(status).toBeInTheDocument();
    },
  );
});
