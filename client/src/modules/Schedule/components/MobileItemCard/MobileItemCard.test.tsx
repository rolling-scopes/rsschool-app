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
  it('renders item details and their optional variants', () => {
    const { rerender } = render(<MobileItemCard item={makeItem()} timezone="Europe/Moscow" />);

    const link = screen.getByRole('link', { name: 'Intro to JS' });
    expect(link).toHaveAttribute('href', 'https://example.com/task');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(TAG_NAME_MAP[TagEnum.Coding])).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'swap-right' })).toBeInTheDocument();

    rerender(<MobileItemCard item={makeItem({ descriptionUrl: '', endDate: undefined })} timezone="UTC" />);
    const heading = screen.getByRole('heading', { name: 'Intro to JS' });
    // eslint-disable-next-line testing-library/no-node-access -- Empty-href anchors have no link role in DOM queries.
    expect(heading.closest('a')).toHaveAttribute('href', '');
    expect(screen.getByText('(UTC +00:00)')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'swap-right' })).not.toBeInTheDocument();
  });
});
