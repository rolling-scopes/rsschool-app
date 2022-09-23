import { render, screen } from '@testing-library/react';
import TableView, { TableViewProps } from './TableView';
import * as ReactUse from 'react-use';
import { ALL_TAB_KEY, ColumnKey } from 'modules/Schedule/constants';
import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum } from 'api';

const StatusEnum = CourseScheduleItemDtoStatusEnum;

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
  statusFilter: 'all',
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
    it('by selected tag', () => {
      jest
        .spyOn(ReactUse, 'useLocalStorage')
        // Mock useLocalStorage for tagFilter
        .mockReturnValueOnce([['coding'], jest.fn, jest.fn]);

      render(<TableView {...PROPS_MOCK} />);

      expect(screen.getByText('Coding')).toBeInTheDocument();
    });

    it.each`
      initialStatus
      ${ALL_TAB_KEY}
      ${[]}
    `('by "all" status when initial status is $initialStatus', ({ initialStatus }: { initialStatus: string }) => {
      const data = generateCourseData();
      render(<TableView {...PROPS_MOCK} data={data} statusFilter={initialStatus} />);

      const items = screen.getAllByText(/Course Item/i);
      expect(items).toHaveLength(data.length);
    });

    it.each`
      status
      ${StatusEnum.Missed}
      ${StatusEnum.Done}
      ${StatusEnum.Available}
      ${StatusEnum.Archived}
      ${StatusEnum.Future}
      ${StatusEnum.Review}
    `('by "$status" status', ({ status }: { status: CourseScheduleItemDtoStatusEnum }) => {
      const courseItemCount = 2;
      const data = generateCourseData(courseItemCount, [status, status]);
      render(<TableView {...PROPS_MOCK} data={data} statusFilter={status} />);

      const items = screen.getAllByText(new RegExp(status, 'i'));
      expect(items).toHaveLength(courseItemCount);
    });
  });

  describe('should hide data', () => {
    it.each`
      selectedStatus          | hiddenStatus
      ${StatusEnum.Missed}    | ${StatusEnum.Done}
      ${StatusEnum.Done}      | ${StatusEnum.Available}
      ${StatusEnum.Available} | ${StatusEnum.Archived}
      ${StatusEnum.Archived}  | ${StatusEnum.Future}
      ${StatusEnum.Future}    | ${StatusEnum.Review}
      ${StatusEnum.Review}    | ${StatusEnum.Missed}
    `(
      'when "$selectedStatus" was selected and "$hiddenStatus" was filtered',
      ({
        selectedStatus,
        hiddenStatus,
      }: {
        selectedStatus: CourseScheduleItemDtoStatusEnum;
        hiddenStatus: CourseScheduleItemDtoStatusEnum;
      }) => {
        const data = generateCourseData(2, [selectedStatus, hiddenStatus]);
        render(<TableView {...PROPS_MOCK} data={data} statusFilter={selectedStatus} />);

        const filteredItem = screen.queryByText(new RegExp(hiddenStatus, 'i'));
        expect(filteredItem).not.toBeInTheDocument();
      },
    );
  });
});

function generateCourseData(
  count = 3,
  statusMock: CourseScheduleItemDtoStatusEnum[] = [StatusEnum.Missed, StatusEnum.Archived, StatusEnum.Done],
): CourseScheduleItemDto[] {
  return new Array(count).fill({}).map((_, idx) => {
    return {
      name: `Course Item ${idx}`,
      startDate: '2020-02-01T21:00:00.000Z',
      endDate: '2020-03-15T20:59:00.000Z',
      maxScore: idx * 100,
      scoreWeight: 0.2,
      organizer: null,
      status: statusMock[idx],
      score: idx * 20,
      tag: 'test',
      descriptionUrl: '',
    };
  });
}
