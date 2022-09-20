import { render, screen } from '@testing-library/react';
import TableView, { TableViewProps } from './TableView';

const PROPS_MOCK: TableViewProps = {
  settings: {
    timezone: 'Europe/Moscow',
    setTimezone: jest.fn,
    tagColors: {
      coding: '#722ed1',
      'cross-check': '#13c2c2',
    },
    setTagColors: jest.fn,
    columnsHidden: [],
    setColumnsHidden: jest.fn,
    tagsHidden: [],
    setTagsHidden: jest.fn,
  },
  data: [
    {
      name: 'Codewars stage 1',
      startDate: '2020-02-01T21:00:00.000Z',
      endDate: '2020-03-15T20:59:00.000Z',
      maxScore: 60,
      scoreWeight: 0.2,
      organizer: null,
      status: 'missed',
      score: 80,
      tag: 'coding',
      descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars-stage-1.md',
    },
  ],
};

describe('TableView', () => {
  it.each`
    label
    ${'Status'}
    ${'Task / Event'}
    ${'Tag'}
    ${'Organizer'}
    ${'Weight'}
    ${'Score / Max'}
    ${'End Date (UTC +03:00)'}
    ${'Start Date (UTC +03:00)'}
  `('should render header "$label"', ({ label }: { label: string }) => {
    render(<TableView {...PROPS_MOCK} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
