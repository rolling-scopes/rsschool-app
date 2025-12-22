import { render, screen } from '@testing-library/react';
import { GratitudeDto } from '@client/api';
import { GratitudeSection } from './index';

jest.mock('./GratitudeList', () => ({
  GratitudeList: () => <div>Mock GratitudeList</div>,
}));

describe('GratitudeSection', () => {
  test('should display nothing if data is empty', () => {
    const { container } = render(<GratitudeSection data={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display nothing if data is not provided', () => {
    const { container } = render(<GratitudeSection data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display gratitudes list if data is provided', () => {
    const mockData = ['Feeback 1', 'Feedback 2', 'Feedback 3'] as unknown as GratitudeDto[];

    render(<GratitudeSection data={mockData} />);

    const totalCount = screen.getByText(`Total count: ${mockData.length}`);
    const gratitudeList = screen.getByText('Mock GratitudeList');

    expect(totalCount).toBeInTheDocument();
    expect(gratitudeList).toBeInTheDocument();
  });
});
