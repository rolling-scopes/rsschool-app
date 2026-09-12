// The dragging styles live on the <tr> element, reached via closest('tr') — direct node
// access is intentional here since antd Table rows expose no role for style assertions.
/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DragSortTable } from './DragSortTable';

// Boundary: @dnd-kit/sortable's useSortable drives the row's drag state. Control it so we
// can render both the dragging and non-dragging row styles.
const { useSortable } = vi.hoisted(() => ({ useSortable: vi.fn() }));
vi.mock('@dnd-kit/sortable', () => ({ useSortable }));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => 'none' } } }));

type Row = { key: string; name: string };
const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }];
const data: Row[] = [{ key: 'r1', name: 'Alpha' }];

function renderTable() {
  return render(<DragSortTable<Row> rowKey="key" columns={columns} dataSource={data} pagination={false} />);
}

describe('<DragSortTable />', () => {
  it('applies styles based on the row drag state', () => {
    useSortable.mockReturnValue({
      attributes: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    });
    const { rerender } = renderTable();

    const cell = screen.getByText('Alpha');
    const row = cell.closest('tr')!;
    // Not dragging → no elevated z-index / relative positioning.
    expect(row.style.zIndex).toBe('');
    expect(row.style.position).toBe('');
    useSortable.mockReturnValue({
      attributes: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: true,
    });
    rerender(<DragSortTable<Row> rowKey="key" columns={columns} dataSource={data} pagination={false} />);

    const draggingRow = screen.getByText('Alpha').closest('tr')!;
    expect(draggingRow.style.position).toBe('relative');
    expect(draggingRow.style.zIndex).toBe('9999');
  });
});
