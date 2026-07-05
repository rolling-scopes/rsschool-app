/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getColumnSearchProps } from './columns';

type DropdownProps = Parameters<NonNullable<ReturnType<typeof getColumnSearchProps>['filterDropdown']>>[0];

function renderDropdown(
  props: Partial<DropdownProps> = {},
  columnArgs: Parameters<typeof getColumnSearchProps> = ['name'],
) {
  const setSelectedKeys = vi.fn();
  const confirm = vi.fn();
  const clearFilters = vi.fn();
  const config = getColumnSearchProps(...columnArgs);
  const dropdown = config.filterDropdown as (p: DropdownProps) => JSX.Element;
  const utils = render(
    dropdown({
      setSelectedKeys,
      selectedKeys: [],
      confirm,
      clearFilters,
      ...props,
    } as DropdownProps),
  );
  return { ...utils, setSelectedKeys, confirm, clearFilters, config };
}

describe('getColumnSearchProps', () => {
  it('renders a search input with a placeholder using the label', () => {
    renderDropdown({}, ['name', 'Full Name']);

    expect(screen.getByPlaceholderText('Search Full Name')).toBeInTheDocument();
  });

  it('falls back to the dataIndex in the placeholder when no label is given', () => {
    renderDropdown({}, ['githubId']);

    expect(screen.getByPlaceholderText('Search githubId')).toBeInTheDocument();
  });

  it('updates selected keys as the user types', async () => {
    const user = userEvent.setup();
    const { setSelectedKeys } = renderDropdown();

    await user.type(screen.getByRole('textbox'), 'a');

    expect(setSelectedKeys).toHaveBeenCalledWith(['a']);
  });

  it('confirms the filter when the search button is clicked', async () => {
    const user = userEvent.setup();
    const { confirm } = renderDropdown();

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(confirm).toHaveBeenCalled();
  });

  it('confirms the filter when Enter is pressed in the input', () => {
    const { confirm } = renderDropdown();

    // The handler checks e.keyCode === 13, so fire a keyDown with an explicit keyCode.
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', keyCode: 13 });

    expect(confirm).toHaveBeenCalled();
  });

  it('clears the filter and confirms on Reset', async () => {
    const user = userEvent.setup();
    const { clearFilters, confirm } = renderDropdown();

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(clearFilters).toHaveBeenCalled();
    expect(confirm).toHaveBeenCalled();
  });

  it('renders a highlighted filter icon when filtered', () => {
    const { config } = renderDropdown();
    const { container } = render(<>{config.filterIcon?.(true, {} as never)}</>);

    expect(container.querySelector('.anticon-search')).toBeInTheDocument();
  });

  it('renders a non-highlighted filter icon when not filtered', () => {
    // filtered=false -> the `filtered ? '#1677ff' : undefined` else branch.
    const { config } = renderDropdown();
    const { container } = render(<>{config.filterIcon?.(false, {} as never)}</>);

    expect(container.querySelector('.anticon-search')).toBeInTheDocument();
  });

  it('onFilter treats a missing field value as an empty string', () => {
    // record lacks the dataIndex field -> `get(record, field) || ''` falls back to ''.
    const { config } = renderDropdown();

    expect(config.onFilter?.('a', {} as never)).toBe(false);
  });

  it('onFilter matches a record on a single dataIndex (case-insensitive)', () => {
    const { config } = renderDropdown();

    expect(config.onFilter?.('AL', { name: 'Alice' } as never)).toBe(true);
    expect(config.onFilter?.('zz', { name: 'Alice' } as never)).toBe(false);
  });

  it('onFilter returns false for null filter values', () => {
    const { config } = renderDropdown();

    expect(config.onFilter?.(null as never, { name: 'Alice' } as never)).toBe(false);
  });

  it('onFilter checks any of multiple dataIndex fields', () => {
    const config = getColumnSearchProps(['name', 'githubId']);

    expect(config.onFilter?.('octo', { name: 'Alice', githubId: 'octocat' } as never)).toBe(true);
  });

  it('focuses and selects the search input when the filter dropdown opens', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    const { config } = renderDropdown();

    // The rendered Input registers its ref; opening should select its text.
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');

    config.filterDropdownProps?.onOpenChange?.(true);
    expect(selectSpy).toHaveBeenCalled();

    // Closing should not attempt to select.
    selectSpy.mockClear();
    config.filterDropdownProps?.onOpenChange?.(false);
    expect(selectSpy).not.toHaveBeenCalled();

    rafSpy.mockRestore();
  });
});
