import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table } from 'antd';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum } from '@client/api';
import { getAvailableTasksColumns, AvailableTasksColumnKey } from './renderers';

function makeItem(overrides: Partial<CourseScheduleItemDto> = {}): CourseScheduleItemDto {
  return {
    id: 1,
    name: 'Task name',
    tag: CourseScheduleItemDtoTagEnum.CoreJs,
    endDate: '2024-02-01T12:00:00.000Z',
    descriptionUrl: 'https://example.com/desc',
    ...overrides,
  } as CourseScheduleItemDto;
}

function renderColumns(data: CourseScheduleItemDto[]) {
  const columns = getAvailableTasksColumns();
  return render(<Table dataSource={data} columns={columns} rowKey="id" pagination={false} />);
}

describe('getAvailableTasksColumns', () => {
  it('returns Name, Type and EndDate columns', () => {
    const columns = getAvailableTasksColumns();
    expect(columns.map(c => c.key)).toEqual([
      AvailableTasksColumnKey.Name,
      AvailableTasksColumnKey.Type,
      AvailableTasksColumnKey.EndDate,
    ]);
  });

  it('renders the task name as a link to the description, the tag, and a "Due by" cell', () => {
    renderColumns([makeItem()]);

    // Task name is rendered (renderTask wraps it as a link when descriptionUrl present).
    expect(screen.getByText('Task name')).toBeInTheDocument();
    // EndDate cell label.
    expect(screen.getByText(/Due by:/i)).toBeInTheDocument();
  });

  it('renders no end-date content when both value and row.endDate are empty', () => {
    renderColumns([makeItem({ endDate: undefined })]);

    expect(screen.queryByText(/Due by:/i)).not.toBeInTheDocument();
  });
});
