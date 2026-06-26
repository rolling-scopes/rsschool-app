import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CriteriaDto, CriteriaDtoTypeEnum } from '@client/api';
import { EditableTable } from './EditableTableForCrossCheck';

// --- Brittle-widget policy -------------------------------------------------
// @dnd-kit drag-and-drop is unusable in jsdom (needs pointer/layout). Stub the
// dnd primitives so the table renders and the non-dnd controls (Edit/Save/
// Cancel/Delete/type-select) can be driven like a user. Drag reordering itself
// is exercised by asserting `onDragEnd` via the stubbed DndContext below.
const dragEndHandlers: Array<(e: unknown) => void> = [];
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => {
    dragEndHandlers[0] = onDragEnd;
    return <>{children}</>;
  },
}));
vi.mock('@dnd-kit/modifiers', () => ({ restrictToVerticalAxis: {} }));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    setActivatorNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }));

function makeCriteria(): CriteriaDto[] {
  return [
    { key: 'k1', index: 0, type: CriteriaDtoTypeEnum.Subtask, max: 10, text: 'First criteria' },
    { key: 'k2', index: 1, type: CriteriaDtoTypeEnum.Title, text: 'A title row' } as CriteriaDto,
  ];
}

// Stateful host so setDataCriteria actually re-renders the table like in the page.
function Host({ initial = makeCriteria() }: { initial?: CriteriaDto[] }) {
  const [data, setData] = useState<CriteriaDto[]>(initial);
  return (
    <>
      <div data-testid="count">{data.length}</div>
      <div data-testid="dump">{JSON.stringify(data)}</div>
      <EditableTable dataCriteria={data} setDataCriteria={setData} />
    </>
  );
}

function getRow(text: string) {
  return screen.getByText(text).closest('tr') as HTMLElement;
}

describe('<EditableTable /> (CrossCheck editable criteria)', () => {
  it('renders a row per criteria with Type/Max/Text and Edit/Delete actions', () => {
    render(<Host />);

    expect(screen.getByText('First criteria')).toBeInTheDocument();
    expect(screen.getByText('A title row')).toBeInTheDocument();
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  it('enters edit mode for a row and shows Save/Cancel plus editable inputs', async () => {
    const user = userEvent.setup();
    render(<Host />);

    const row = getRow('First criteria');
    await user.click(within(row).getByText('Edit'));

    // Save/Cancel replace Edit/Delete for the editing row.
    expect(within(row).getByText('Save')).toBeInTheDocument();
    expect(within(row).getByText('Cancel')).toBeInTheDocument();
    // Editable Text becomes a textarea and Max becomes a spinbutton.
    expect(within(row).getByRole('textbox')).toBeInTheDocument();
    expect(within(row).getByRole('spinbutton')).toBeInTheDocument();
  });

  it('saves an edited Text value back into the data', async () => {
    const user = userEvent.setup();
    render(<Host />);

    const row = getRow('First criteria');
    await user.click(within(row).getByText('Edit'));

    const textarea = within(row).getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Edited criteria');
    await user.click(within(getRow('Edited criteria')).getByText('Save'));

    expect(await screen.findByText('Edited criteria')).toBeInTheDocument();
    expect(screen.getByTestId('dump').textContent).toContain('Edited criteria');
    // Back to read mode: Edit visible again.
    expect(screen.getAllByText('Edit')).toHaveLength(2);
  });

  it('cancels an edit and restores the original value', async () => {
    const user = userEvent.setup();
    render(<Host />);

    const row = getRow('First criteria');
    await user.click(within(row).getByText('Edit'));

    const textarea = within(row).getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Throwaway');
    await user.click(within(getRow('Throwaway')).getByText('Cancel'));

    expect(await screen.findByText('First criteria')).toBeInTheDocument();
    expect(screen.queryByText('Throwaway')).not.toBeInTheDocument();
  });

  it('deletes a row through the Delete confirmation popconfirm', async () => {
    const user = userEvent.setup();
    render(<Host />);

    expect(screen.getByTestId('count').textContent).toBe('2');

    const row = getRow('First criteria');
    await user.click(within(row).getByText('Delete'));

    // Popconfirm confirm button.
    const confirmBtn = await screen.findByRole('button', { name: 'Delete' });
    await user.click(confirmBtn);

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    expect(screen.queryByText('First criteria')).not.toBeInTheDocument();
  });

  it('changes a row type via the type selector and clears Max when Title is chosen', async () => {
    const user = userEvent.setup();
    render(<Host />);

    const row = getRow('First criteria');
    await user.click(within(row).getByText('Edit'));

    // Open the in-cell type Select and choose Title.
    const combobox = within(row).getByRole('combobox');
    fireEvent.mouseDown(combobox);
    fireEvent.click(await within(document.body).findByText('Title'));

    // changeTaskType sets max to undefined for Title rows.
    await waitFor(() => {
      const dump = JSON.parse(screen.getByTestId('dump').textContent || '[]');
      const edited = dump.find((c: CriteriaDto) => c.key === 'k1');
      expect(edited.type).toBe('title');
      expect(edited.max).toBeUndefined();
    });
  });

  it('keeps the existing max when a row type changes to a non-Title type', async () => {
    const user = userEvent.setup();
    // A subtask row keeps its max when re-typed to Penalty.
    render(<Host initial={[{ key: 'k1', index: 0, type: CriteriaDtoTypeEnum.Subtask, max: 7, text: 'Keep max' }]} />);

    await user.click(within(getRow('Keep max')).getByText('Edit'));

    const combobox = within(getRow('Keep max')).getByRole('combobox');
    fireEvent.mouseDown(combobox);
    fireEvent.click(await within(document.body).findByText('Penalty'));

    await waitFor(() => {
      const dump = JSON.parse(screen.getByTestId('dump').textContent || '[]');
      const edited = dump.find((c: CriteriaDto) => c.key === 'k1');
      expect(edited.type).toBe('penalty');
      expect(edited.max).toBe(7);
    });
  });

  it('disables Edit/Delete on other rows while one row is being edited', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(within(getRow('First criteria')).getByText('Edit'));

    // The other row's Edit link is disabled (antd marks it with a disabled class).
    const otherRow = getRow('A title row');
    const otherEdit = within(otherRow).getByText('Edit');
    expect(otherEdit).toHaveClass('ant-typography-disabled');
  });

  it('reorders rows when a drag-end event fires (dnd handler wiring)', async () => {
    render(<Host />);

    expect(dragEndHandlers[0]).toBeTypeOf('function');
    // Simulate dropping row k1 onto k2's position.
    dragEndHandlers[0]({ active: { id: 'k1' }, over: { id: 'k2' } });

    await waitFor(() => {
      const dump = JSON.parse(screen.getByTestId('dump').textContent || '[]');
      expect(dump[0].key).toBe('k2');
      expect(dump[1].key).toBe('k1');
    });
  });

  it('keeps order unchanged when a row is dropped onto itself', async () => {
    render(<Host />);

    dragEndHandlers[0]({ active: { id: 'k1' }, over: { id: 'k1' } });

    const dump = JSON.parse(screen.getByTestId('dump').textContent || '[]');
    expect(dump[0].key).toBe('k1');
    expect(dump[1].key).toBe('k2');
  });
});
