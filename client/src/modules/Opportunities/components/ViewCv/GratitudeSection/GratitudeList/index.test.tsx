import { fireEvent, render, screen } from '@testing-library/react';
import { GratitudeDto } from '@client/api';
import { GratitudeList } from './index';

const mockGratitudes = [
  {
    date: '2022-09-29T13:40:08.254Z',
    comment: 'Gratitude comment 1',
  },
  {
    date: '2022-09-28T13:40:09.260Z',
    comment: 'Gratitude comment 2',
  },
  {
    date: '2022-06-29T13:40:10.262Z',
    comment: 'Gratitude comment 3',
  },
] as GratitudeDto[];

describe('GratitudeList', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(1664499199062);
  });

  afterAll(() => {
    vi.useRealTimers();
  });
  test('renders empty, full, partial, expanded, and collapsed list states', () => {
    const { container, rerender } = render(
      <GratitudeList key="full" feedback={mockGratitudes} showCount={mockGratitudes.length} />,
    );

    expect(screen.getByText(mockGratitudes[0]!.comment)).toBeInTheDocument();
    expect(screen.getByText('11 hours ago')).toBeInTheDocument();
    expect(screen.getByText(mockGratitudes[1]!.comment)).toBeInTheDocument();
    expect(screen.getByText('a day ago')).toBeInTheDocument();
    expect(screen.getByText(mockGratitudes[2]!.comment)).toBeInTheDocument();
    expect(screen.getByText('3 months ago')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(mockGratitudes.length);
    expect(screen.queryByRole('button', { name: 'Show all' })).not.toBeInTheDocument();

    rerender(<GratitudeList key="partial" feedback={mockGratitudes} showCount={1} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(mockGratitudes.length);

    fireEvent.click(screen.getByRole('button', { name: 'Show partially' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    rerender(<GratitudeList key="empty" feedback={[]} showCount={5} />);
    expect(container).toBeEmptyDOMElement();
  });
});
