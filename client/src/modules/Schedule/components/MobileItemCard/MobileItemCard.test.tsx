import { render, screen } from '@testing-library/react';
import { MobileItemCard } from './MobileItemCard';
import {
  CourseScheduleItemDto,
  CourseScheduleItemDtoStatusEnum as StatusEnum,
  CourseScheduleItemDtoTagEnum as TagEnum,
  CourseScheduleItemDtoTypeEnum,
} from '@client/api';
import { TAG_NAME_MAP } from '../../constants';

function makeItem(overrides: Partial<CourseScheduleItemDto> = {}): CourseScheduleItemDto {
  return {
    id: 1,
    type: CourseScheduleItemDtoTypeEnum.CourseTask,
    name: 'Intro to JS',
    startDate: '2020-02-01T21:00:00.000Z',
    endDate: '2020-03-15T20:59:00.000Z',
    maxScore: 100,
    scoreWeight: 0.5,
    organizer: { id: 1, name: '', githubId: 'organizer-1' },
    status: StatusEnum.Done,
    score: 80,
    tag: TagEnum.Coding,
    descriptionUrl: 'https://example.com/task',
    crossCheckEndDate: '2020-02-01T21:00:00.000Z',
    ...overrides,
  } as CourseScheduleItemDto;
}

describe('<MobileItemCard />', () => {
  it('renders the item name linking to its description URL', () => {
    render(<MobileItemCard item={makeItem()} timezone="Europe/Moscow" />);

    const link = screen.getByRole('link', { name: 'Intro to JS' });
    expect(link).toHaveAttribute('href', 'https://example.com/task');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('falls back to an empty href when the item has no description URL', () => {
    render(<MobileItemCard item={makeItem({ descriptionUrl: '' })} timezone="Europe/Moscow" />);

    const link = screen.getByRole('link', { name: 'Intro to JS' });
    expect(link).toHaveAttribute('href', '');
  });

  it('renders the tag label and the capitalized status', () => {
    render(<MobileItemCard item={makeItem()} timezone="Europe/Moscow" />);

    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Coding])).toBeInTheDocument();
    // statusRenderer capitalizes the enum value.
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders the timezone offset for the supplied timezone', () => {
    render(<MobileItemCard item={makeItem()} timezone="UTC" />);

    // UTC offset is +00:00.
    expect(screen.getByText('(UTC +00:00)')).toBeInTheDocument();
  });

  it('renders both start and end dates with a separator when an end date exists', () => {
    render(<MobileItemCard item={makeItem()} timezone="Europe/Moscow" />);

    // The SwapRightOutlined icon renders as an accessible image labelled "swap-right".
    expect(screen.getByRole('img', { name: 'swap-right' })).toBeInTheDocument();
  });

  it('omits the end date and separator when the item has no end date', () => {
    render(<MobileItemCard item={makeItem({ endDate: undefined })} timezone="Europe/Moscow" />);

    expect(screen.queryByRole('img', { name: 'swap-right' })).not.toBeInTheDocument();
  });
});
