import { render, screen } from '@testing-library/react';
import { NextEventCard } from '.';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum } from 'api';

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
    ${NEXT_EVENTS[0].name}
    ${NEXT_EVENTS[0].tag}
    ${'Feb 01 03:00'}
  `('should render $text', ({ text }: { text: string }) => {
    render(<NextEventCard {...PROPS_MOCK} />);

    const match = new RegExp(text, 'i');
    expect(screen.getByText(match)).toBeInTheDocument();
  });
});

function generateAvailableTasks(count = 3): CourseScheduleItemDto[] {
  return new Array(count).fill({}).map((_, idx) => ({
    id: idx,
    name: `Available Task ${idx}`,
    startDate: '1970-01-01T00:00:00Z',
    endDate: `1970-02-0${idx + 1}T00:00:00Z`,
    crossCheckEndDate: '1970-01-01T00:00:00Z',
    maxScore: idx + 100,
    scoreWeight: 0.2,
    organizer: {
      id: idx,
      name: '',
      githubId: `organizer ${idx}`,
    },
    status: 'available',
    score: idx + 20,
    tag: Object.values(CourseScheduleItemDtoTagEnum)[idx],
    descriptionUrl: 'task-description-url',
  }));
}
