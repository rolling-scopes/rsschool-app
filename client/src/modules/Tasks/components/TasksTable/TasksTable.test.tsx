import { fireEvent, render, screen, within } from '@testing-library/react';
import { TaskDto } from 'api';
import { TasksTable } from './TasksTable';
import { ColumnName } from 'modules/Tasks/types';
import { TASK_TYPES } from 'data/taskTypes';
import { COURSE_NAME_MOCK, generateTasksData } from 'modules/Tasks/utils/test-utils';
import assert from 'assert';

const renderTasksTable = (data: TaskDto[] = generateTasksData(1), handleEditItem = jest.fn()) => {
  render(<TasksTable data={data} handleEditItem={handleEditItem} />);
};

describe('TasksTable', () => {
  const [mockData] = generateTasksData(1);

  test.each`
    label
    ${ColumnName.Id}
    ${ColumnName.Name}
    ${ColumnName.Discipline}
    ${ColumnName.Tags}
    ${ColumnName.Skills}
    ${ColumnName.Type}
    ${ColumnName.UsedInCourses}
    ${ColumnName.DescriptionURL}
    ${ColumnName.PRRequired}
    ${ColumnName.RepoName}
    ${ColumnName.Actions}
  `('should render column "$label"', ({ label }: { label: ColumnName }) => {
    renderTasksTable();

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test.each`
    value
    ${mockData?.id}
    ${mockData?.name}
    ${mockData?.discipline.name}
    ${mockData?.tags[0]}
    ${mockData?.tags[1]}
    ${mockData?.skills[0]}
    ${mockData?.skills[1]}
    ${mockData?.type}
    ${mockData?.githubRepoName}
    ${mockData?.courses[0]?.name}
  `('should render data field "$value"', ({ value }) => {
    renderTasksTable();

    const [dataField] = screen.getAllByText(value ?? '');
    expect(dataField).toBeInTheDocument();
  });

  test('should render description link fields', () => {
    const data = generateTasksData();

    renderTasksTable(data);

    const links = screen.getAllByRole('link', { name: /link/i });
    expect(links).toHaveLength(data.length);

    data.forEach((task, i) => {
      expect(links[i]).toHaveAttribute('href', task.descriptionUrl);
    });
  });

  test('should render "Edit" link fields', () => {
    const data = generateTasksData();

    renderTasksTable(data);

    const links = screen.getAllByText(/edit/i);
    expect(links).toHaveLength(data.length);
  });

  test('should call handleEditItem on "Edit" click with proper record', () => {
    const handleEditItem = jest.fn();
    const data = generateTasksData();

    renderTasksTable(data, handleEditItem);

    const links = screen.getAllByText('Edit');

    data.forEach((task, i) => {
      const link = links[i];
      assert(link);
      fireEvent.click(link);
      expect(handleEditItem).toHaveBeenCalledWith(task);
    });
  });

  test('should render PR Required fields with proper mark', () => {
    const data = generateTasksData();
    const notRequiredPRs = data.filter(elem => !elem.githubPrRequired);
    const requiredPRs = data.filter(elem => elem.githubPrRequired);

    renderTasksTable(data);

    const minusMarks = screen.getAllByLabelText('minus-circle');
    expect(minusMarks).toHaveLength(notRequiredPRs.length);

    const checkMarks = screen.getAllByLabelText('check-circle');
    expect(checkMarks).toHaveLength(requiredPRs.length);
  });

  describe('filter & search data', () => {
    test('should check filter in dropdown when tag is selected', async () => {
      const tag = TASK_TYPES[0]?.name ?? '';
      const data = generateTasksData();
      renderTasksTable(data);

      const columnHeader = screen.getByLabelText(/type/i);

      const tagFilterBtn = within(columnHeader).getByRole('button', { name: /filter/i });
      fireEvent.click(tagFilterBtn);

      const filtersDropdown = await screen.findByRole('menu');
      const menuItem = within(filtersDropdown).getByRole('menuitem', { name: new RegExp(tag, 'i') });
      fireEvent.click(menuItem);

      const checkbox = within(menuItem).getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    test('should reset filter on Reset click', async () => {
      const tag = TASK_TYPES[0]?.name ?? '';
      const data = generateTasksData();
      renderTasksTable(data);

      const columnHeader = screen.getByLabelText(/type/i);

      const tagFilterBtn = within(columnHeader).getByRole('button', { name: /filter/i });
      fireEvent.click(tagFilterBtn);

      const filtersDropdown = await screen.findByRole('menu');
      const menuItem = within(filtersDropdown).getByRole('menuitem', { name: new RegExp(tag, 'i') });
      fireEvent.click(menuItem);

      const checkbox = within(menuItem).getByRole('checkbox');
      expect(checkbox).toBeChecked();

      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);

      expect(checkbox).not.toBeChecked();
    });

    test('should render only filtered by Type data', async () => {
      const data = generateTasksData();
      const selectedTag = TASK_TYPES[0];
      const notSelectedTags = data.filter(elem => elem.type !== selectedTag?.id).map(task => task.type);
      renderTasksTable(data);

      // find and click filter button for Type column
      const columnHeader = screen.getByLabelText(/type/i);
      const tagFilterBtn = within(columnHeader).getByRole('button', { name: /filter/i });
      fireEvent.click(tagFilterBtn);

      // find and click selected Type tag
      const filtersDropdown = await screen.findByRole('menu');
      const menuItem = within(filtersDropdown).getByRole('menuitem', {
        name: new RegExp(selectedTag?.name ?? '', 'i'),
      });
      fireEvent.click(menuItem);

      // submit filter
      const okBtn = screen.getByRole('button', { name: /ok/i });
      fireEvent.click(okBtn);

      // find filtered in rows
      const filteredInRow = screen.getByText(selectedTag?.id ?? '');
      expect(filteredInRow).toBeInTheDocument();

      // check that other data rows aren't rendered
      notSelectedTags.forEach(notSelectedTag => {
        const filteredOutRow = screen.queryByText(notSelectedTag);
        expect(filteredOutRow).not.toBeInTheDocument();
      });
    });

    test('should render only filtered by Course data', async () => {
      const data = generateTasksData();
      renderTasksTable(data);

      // find and click filter button for Used in Courses column
      const [, tagFilterBtn] = screen.getAllByRole('button', { name: /filter/i });
      expect(tagFilterBtn).toBeInTheDocument();
      if (tagFilterBtn) {
        fireEvent.click(tagFilterBtn);
      }

      // find and click selected course tag
      const filtersDropdown = await screen.findByRole('menu');
      const menuItem = within(filtersDropdown).getByRole('menuitem', { name: COURSE_NAME_MOCK });
      fireEvent.click(menuItem);

      // submit filter
      const okBtn = screen.getByRole('button', { name: /ok/i });
      fireEvent.click(okBtn);

      // find filtered in rows
      const table = screen.getByRole('table');
      const filteredInRow = within(table).getByText(COURSE_NAME_MOCK);
      expect(filteredInRow).toBeInTheDocument();

      // count all rows by Action column("Edit"), since every row has it
      const rows = within(table).getAllByText(/edit/i);
      expect(rows.length).not.toBe(data.length);
    });

    test('should render only data with "Not assigned" course', async () => {
      const data = generateTasksData();
      renderTasksTable(data);

      // find and click filter button for Used in Courses column
      const [, tagFilterBtn] = screen.getAllByRole('button', { name: /filter/i });
      expect(tagFilterBtn).toBeInTheDocument();
      if (tagFilterBtn) {
        fireEvent.click(tagFilterBtn);
      }

      // find and click selected tag
      const filtersDropdown = await screen.findByRole('menu');
      const menuItem = within(filtersDropdown).getByRole('menuitem', { name: /not assigned/i });
      fireEvent.click(menuItem);

      // submit filter
      const okBtn = screen.getByRole('button', { name: /ok/i });
      fireEvent.click(okBtn);

      // find filtered in rows
      const table = screen.getByRole('table');
      const filteredInRow = within(table).queryByText(COURSE_NAME_MOCK);
      expect(filteredInRow).not.toBeInTheDocument();

      // count all rows by Action column("Edit"), since every row has it
      const rows = within(table).getAllByText(/edit/i);
      const notAssignedCount = data.filter(task => !task.courses.length).length;
      expect(rows).toHaveLength(notAssignedCount);
    });

    test('should render only data filtered by Name column search', async () => {
      const data = generateTasksData();
      const searchQuery = TASK_TYPES[0]?.id ?? '';
      renderTasksTable(data);

      // Check that all items rendered
      const table = screen.getByRole('table');
      const rows = within(table).getAllByText(/edit/i);
      expect(rows).toHaveLength(data.length);

      // Find and click search button for column
      const searchButton = screen.getByRole('button', { name: /search/i });
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
      const secondTaskName = data[1]?.name ?? 'non-existent';
      expect(screen.queryByText(secondTaskName)).not.toBeInTheDocument();
    });

    test('should render all data when search query is cleared', async () => {
      const data = generateTasksData();
      const searchQuery = TASK_TYPES[0]?.id ?? '';
      renderTasksTable(data);

      // Find and click search button for column
      const searchButton = screen.getByRole('button', { name: /search/i });
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
      const secondTaskName = data[1]?.name ?? 'non-existent';
      expect(screen.queryByText(secondTaskName)).not.toBeInTheDocument();

      // Reset search
      const inputResetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(inputResetBtn);

      // Check that all items rendered
      const table = screen.getByRole('table');
      const rows = within(table).getAllByText(/edit/i);
      expect(rows).toHaveLength(data.length);
    });
  });
});
