/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { Rating } from './Rating';

describe('Rating', () => {
  it('renders the rate widget and numeric and tooltip labels', () => {
    const { container, rerender } = render(<Rating rating={3.456} />);

    expect(screen.getByText('3.46')).toBeInTheDocument();
    expect(container.querySelector('.ant-rate')).toBeInTheDocument();

    const tooltips = ['Terrible', 'Bad', 'Ok', 'Good', 'Great'];
    rerender(<Rating rating={4} tooltips={tooltips} />);

    // Math.round(4) - 1 === index 3 -> "Good"
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.queryByText('4.00')).not.toBeInTheDocument();

    rerender(<Rating rating={2.4} tooltips={['One', 'Two', 'Three']} />);

    // Math.round(2.4) - 1 === index 1 -> "Two"
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
