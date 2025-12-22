import { render, screen } from '@testing-library/react';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum, CourseScheduleItemDtoTypeEnum } from '@client/api';
import { NextEventCard } from '.';

const NEXT_EVENTS = generateAvailableTasks();

const PROPS_MOCK = {
  nextEvents: NEXT_EVENTS,
  courseAlias: 'course-alias',
};

describe('NextEventCard', () => {
  it.each`
    text
    ${'Available tasks'}
    ${'View all'}
    ${NEXT_EVENTS[0]?.name}
    ${NEXT_EVENTS[0]?.tag}
    ${'Feb 01'}
  `('should render $text', ({ text }: { text: string }) => {
    render(<NextEventCard {...PROPS_MOCK} />);

    const match = new RegExp(text, 'i');
    expect(screen.getByText(match)).toBeInTheDocument();
  });
});

function generateAvailableTasks(count = 3): CourseScheduleItemDto[] {
  return new Array(count).fill({}).map((_, idx) => ({
    id: idx,
    type: CourseScheduleItemDtoTypeEnum.CourseTask,
    name: `Available Task ${idx}`,
    startDate: '1970-01-01T00:00:00.000Z',
    endDate: `1970-02-0${idx + 1}T00:00:00.000Z`,
    crossCheckEndDate: '1970-01-01T00:00:00.000Z',
    maxScore: idx + 100,
    scoreWeight: 0.2,
    organizer: {
      id: idx,
      name: '',
      githubId: `organizer ${idx}`,
    },
    status: 'available',
    score: idx + 20,
    tag: Object.values(CourseScheduleItemDtoTagEnum)[idx] as CourseScheduleItemDtoTagEnum,
    descriptionUrl: 'task-description-url',
  }));
}
