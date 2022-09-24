import { fireEvent, render, screen, within } from '@testing-library/react';
import TableView, { TableViewProps } from './TableView';
import * as ReactUse from 'react-use';
import { ALL_TAB_KEY, ColumnKey, ColumnName } from 'modules/Schedule/constants';
import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum, CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';

const StatusEnum = CourseScheduleItemDtoStatusEnum;
const TagsEnum = CourseScheduleItemDtoTagEnum;

const PROPS_SETTINGS_MOCK: ScheduleSettings = {
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
    render(<TableView settings={PROPS_SETTINGS_MOCK} data={generateCourseData()} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each`
    value
    ${'Course Item 0'}
    ${'2020-02-02 00:00'}
    ${'2020-03-15 23:59'}
    ${'×0.2'}
    ${'20 / 100'}
    ${'Missed'}
    ${'Test'}
  `('should render data field "$value"', ({ value }: { value: string }) => {
    render(<TableView settings={PROPS_SETTINGS_MOCK} data={generateCourseData()} />);

    const [dataField] = screen.getAllByText(value);
    expect(dataField).toBeInTheDocument();
  });

  it('should not render hidden columns', () => {
    const propsWithHiddenColumn: ScheduleSettings = {
      ...PROPS_SETTINGS_MOCK,
      columnsHidden: [ColumnKey.Tag],
    };
    render(<TableView settings={propsWithHiddenColumn} data={generateCourseData()} />);

    expect(screen.queryByText('Tag')).not.toBeInTheDocument();
  });

  describe('should filter data', () => {
    it('by selected tag', () => {
      jest
        .spyOn(ReactUse, 'useLocalStorage')
        // Mock useLocalStorage for tagFilter
        .mockReturnValueOnce([[TagsEnum.Test], jest.fn, jest.fn]);
      const data = generateCourseData();

      render(<TableView settings={PROPS_SETTINGS_MOCK} data={data} />);

      expect(screen.getAllByText('Test')).toHaveLength(data.length);
    });

    it.each`
      initialStatus
      ${ALL_TAB_KEY}
      ${[]}
    `('by "all" status when initial status is $initialStatus', ({ initialStatus }: { initialStatus: string }) => {
      const data = generateCourseData();
      render(<TableView settings={PROPS_SETTINGS_MOCK} data={data} statusFilter={initialStatus} />);

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
      render(<TableView settings={PROPS_SETTINGS_MOCK} data={data} statusFilter={status} />);

      const items = screen.getAllByText(new RegExp(status, 'i'));
      expect(items).toHaveLength(courseItemCount);
    });

    it.each`
      field                   | searchQuery
      ${ColumnName.Name}      | ${'Course Item 0'}
      ${ColumnName.Organizer} | ${'organizer 0'}
    `('by "$field" column search', async ({ field, searchQuery }: { field: string; searchQuery: string }) => {
      const data = generateCourseData();
      render(<TableView settings={PROPS_SETTINGS_MOCK} data={data} />);
      // Check that all items rendered
      expect(screen.getAllByText(/Course Item/)).toHaveLength(data.length);
      // Find and click search button for column
      const columnHeader = screen.getByRole('columnheader', { name: new RegExp(field, 'i') });
      const searchButton = within(columnHeader).getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      // Type search query inside search input
      const searchInput = await screen.findByRole('textbox');
      fireEvent.change(searchInput, { target: { value: searchQuery } });

      // Apply search
      const inputSearchBtn = screen.getByRole('button', { name: /search search/i });
      fireEvent.click(inputSearchBtn);

      // Find the line with search query and no others
      const item = await screen.findByText(searchQuery);
      expect(item).toBeInTheDocument();
      expect(screen.queryByText(data[1].name)).not.toBeInTheDocument();
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
        render(<TableView settings={PROPS_SETTINGS_MOCK} data={data} statusFilter={selectedStatus} />);

        const filteredItem = screen.queryByText(new RegExp(hiddenStatus, 'i'));
        expect(filteredItem).not.toBeInTheDocument();
      },
    );
  });

  it.each`
    tag
    ${TagsEnum.Coding}
    ${TagsEnum.Test}
    ${TagsEnum.Interview}
  `('should check filters in dropdown when tag "$tag" was selected', async ({ tag }: { tag: string }) => {
    jest
      .spyOn(ReactUse, 'useLocalStorage')
      // Mock useLocalStorage for tagFilter
      .mockReturnValueOnce([[TagsEnum.Coding, TagsEnum.Test, TagsEnum.Interview], jest.fn, jest.fn]);
    render(<TableView settings={PROPS_SETTINGS_MOCK} data={generateCourseData()} />);

    const tagFilterBtn = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(tagFilterBtn);

    const filtersDropdown = await screen.findByRole('menu');
    const menuItem = within(filtersDropdown).getByRole('menuitem', { name: new RegExp(tag, 'i') });
    const checkbox = within(menuItem).getByRole('checkbox');
    expect(checkbox).toBeChecked();
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
      maxScore: idx + 100,
      scoreWeight: 0.2,
      organizer: {
        id: idx,
        name: '',
        githubId: `organizer ${idx}`,
      },
      status: statusMock[idx],
      score: idx + 20,
      tag: 'test',
      descriptionUrl: '',
    };
  });
}
