import assert from 'node:assert';
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
  test('should display nothing if gratitude list is empty', () => {
    const { container } = render(<GratitudeList feedback={[]} showCount={5} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display gratitudes list if provided', () => {
    render(<GratitudeList feedback={mockGratitudes} showCount={mockGratitudes.length} />);

    assert.ok(mockGratitudes.length === 3);

    const gratitudeComment1 = screen.getByText(mockGratitudes[0]!.comment);
    const timeAgo1 = screen.getByText('11 hours ago');
    const gratitudeComment2 = screen.getByText(mockGratitudes[1]!.comment);
    const timeAgo2 = screen.getByText('a day ago');
    const gratitudeComment3 = screen.getByText(mockGratitudes[2]!.comment);
    const timeAgo3 = screen.getByText('3 months ago');

    expect(gratitudeComment1).toBeInTheDocument();
    expect(timeAgo1).toBeInTheDocument();
    expect(gratitudeComment2).toBeInTheDocument();
    expect(timeAgo2).toBeInTheDocument();
    expect(gratitudeComment3).toBeInTheDocument();
    expect(timeAgo3).toBeInTheDocument();
  });

  test('should display number of feedbacks equal to showCount and Show All button if number of feedbacks is greater than showCount', () => {
    const mockShowCount = 1;

    render(<GratitudeList feedback={mockGratitudes} showCount={mockShowCount} />);

    const feedbacksCount = screen.getAllByRole('listitem');
    const showAllButton = screen.getByRole('button', { name: 'Show all' });

    expect(feedbacksCount.length).toBe(mockShowCount);
    expect(showAllButton).toBeInTheDocument();
  });

  test('should display number of feedbacks equal to showCount and not show Show All button if number of feedbacks is not greater than showCount', () => {
    render(<GratitudeList feedback={mockGratitudes} showCount={mockGratitudes.length} />);

    const feedbacksCount = screen.getAllByRole('listitem');
    const showAllButton = screen.queryByRole('button', { name: 'Show all' });

    expect(feedbacksCount).toHaveLength(mockGratitudes.length);
    expect(showAllButton).not.toBeInTheDocument();
  });

  test('should collapse and expand the list of feedbacks correctly', () => {
    const mockShowCount = 1;

    render(<GratitudeList feedback={mockGratitudes} showCount={mockShowCount} />);

    expect(screen.getAllByRole('listitem').length).toBe(mockShowCount);

    fireEvent.click(screen.getByRole('button', { name: 'Show all' }));

    expect(screen.getAllByRole('listitem').length).toBe(mockGratitudes.length);

    fireEvent.click(screen.getByRole('button', { name: 'Show partially' }));

    expect(screen.getAllByRole('listitem').length).toBe(mockShowCount);
  });
});
