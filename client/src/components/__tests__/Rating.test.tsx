import { render, screen } from '@testing-library/react';
import { Rating } from '@client/shared/components/Rating';

describe('Rating', () => {
  it('renders tooltip label based on rounded integer value when tooltips provided', () => {
    const tooltips = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

    render(<Rating rating={3.7} tooltips={tooltips} />);

    expect(screen.getByText('good')).toBeInTheDocument();
  });

  it('renders numeric value with two decimals when tooltips are not provided', () => {
    render(<Rating rating={4.166} />);

    expect(screen.getByText('4.17')).toBeInTheDocument();
  });
});
