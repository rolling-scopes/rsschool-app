/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { Rating } from './Rating';

describe('Rating', () => {
  it('renders the numeric rating with two decimals when no tooltips are provided', () => {
    render(<Rating rating={3.456} />);

    expect(screen.getByText('3.46')).toBeInTheDocument();
  });

  it('renders the matching tooltip label instead of a number when tooltips are provided', () => {
    const tooltips = ['Terrible', 'Bad', 'Ok', 'Good', 'Great'];
    render(<Rating rating={4} tooltips={tooltips} />);

    // Math.round(4) - 1 === index 3 -> "Good"
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.queryByText('4.00')).not.toBeInTheDocument();
  });

  it('rounds the rating to the nearest tooltip index', () => {
    const tooltips = ['One', 'Two', 'Three'];
    render(<Rating rating={2.4} tooltips={tooltips} />);

    // Math.round(2.4) - 1 === index 1 -> "Two"
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('renders the antd rate widget', () => {
    const { container } = render(<Rating rating={5} />);

    expect(container.querySelector('.ant-rate')).toBeInTheDocument();
  });
});
