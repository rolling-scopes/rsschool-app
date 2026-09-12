import { render, screen } from '@testing-library/react';
import { Rating } from '@client/shared/components/Rating';

describe('Rating', () => {
  it('renders the appropriate label with and without tooltips', () => {
    const tooltips = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

    const { rerender } = render(<Rating rating={3.7} tooltips={tooltips} />);

    expect(screen.getByText('good')).toBeInTheDocument();

    rerender(<Rating rating={4.166} />);

    expect(screen.getByText('4.17')).toBeInTheDocument();
  });
});
