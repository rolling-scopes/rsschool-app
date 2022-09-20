import { render, screen } from '@testing-library/react';
import TableView, { TableViewProps } from './TableView';
import * as ReactUse from 'react-use';
import { ColumnKey } from 'modules/Schedule/constants';

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
      maxScore: 100,
      scoreWeight: 0.2,
      organizer: null,
      status: 'missed',
      score: 80,
      tag: 'test',
      descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars-stage-1.md',
    },
    {
      name: 'Codewars stage 2',
      startDate: '2020-03-01T21:00:00.000Z',
      endDate: '2020-04-15T20:59:00.000Z',
      maxScore: 0,
      scoreWeight: 0,
      organizer: null,
      status: 'archived',
      score: 0,
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
  `('should render column "$label"', ({ label }: { label: string }) => {
    render(<TableView {...PROPS_MOCK} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each`
    value
    ${'Codewars stage 1'}
    ${'2020-02-02 00:00'}
    ${'2020-03-15 23:59'}
    ${'×0.2'}
    ${'80 / 100'}
    ${'Missed'}
    ${'Test'}
  `('should render data field "$value"', ({ value }: { value: string }) => {
    render(<TableView {...PROPS_MOCK} />);

    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it('should not render hidden columns', () => {
    const propsWithHiddenColumn: TableViewProps = {
      ...PROPS_MOCK,
      settings: {
        ...PROPS_MOCK.settings,
        columnsHidden: [ColumnKey.Tag],
      },
    };
    render(<TableView {...propsWithHiddenColumn} />);

    expect(screen.queryByText('Tag')).not.toBeInTheDocument();
  });

  describe('should show data', () => {
    it('by selected status', () => {
      jest
        .spyOn(ReactUse, 'useLocalStorage')
        // Mock useLocalStorage for statusFilter
        .mockReturnValueOnce([['missed'], jest.fn, jest.fn]);

      render(<TableView {...PROPS_MOCK} />);

      expect(screen.queryByText('Coding')).not.toBeInTheDocument();
    });

    it('by selected tag', () => {
      jest
        .spyOn(ReactUse, 'useLocalStorage')
        // Mock useLocalStorage for statusFilter
        .mockReturnValueOnce([[], jest.fn, jest.fn])
        // Mock useLocalStorage for tagFilter
        .mockReturnValueOnce([['coding'], jest.fn, jest.fn]);

      render(<TableView {...PROPS_MOCK} />);

      expect(screen.queryByText('Missed')).not.toBeInTheDocument();
    });
  });
});
