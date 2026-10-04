import { render, screen } from '@testing-library/react';
import { CourseNoAccess } from './CourseNoAccess';

describe('<CourseNoAccess />', () => {
  it('renders a 403 explanation and home link', () => {
    render(<CourseNoAccess />);
    expect(screen.getByText('You Have No Access to Course Page')).toBeInTheDocument();
    expect(screen.getByText(/Please register or choose another course/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
