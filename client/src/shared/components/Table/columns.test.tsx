/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
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
  it('uses the label or dataIndex in the search placeholder', () => {
    const { unmount } = renderDropdown({}, ['name', 'Full Name']);

    expect(screen.getByPlaceholderText('Search Full Name')).toBeInTheDocument();
    unmount();
    renderDropdown({}, ['githubId']);

    expect(screen.getByPlaceholderText('Search githubId')).toBeInTheDocument();
  });

  it('handles dropdown actions, filtering, icons, and focus', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    const { setSelectedKeys, confirm, clearFilters, config } = renderDropdown();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'a' } });
    expect(setSelectedKeys).toHaveBeenCalledWith(['a']);
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    fireEvent.keyDown(input, { key: 'Escape', keyCode: 27 });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(clearFilters).toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledTimes(3);

    const { container } = render(
      <>
        {config.filterIcon?.(true, {} as never)}
        {config.filterIcon?.(false, {} as never)}
      </>,
    );
    expect(container.querySelectorAll('.anticon-search')).toHaveLength(2);
    expect(config.onFilter?.('a', {} as never)).toBe(false);
    expect(config.onFilter?.('AL', { name: 'Alice' } as never)).toBe(true);
    expect(config.onFilter?.('zz', { name: 'Alice' } as never)).toBe(false);
    expect(config.onFilter?.(null as never, { name: 'Alice' } as never)).toBe(false);
    expect(
      getColumnSearchProps(['name', 'githubId']).onFilter?.('octo', {
        name: 'Alice',
        githubId: 'octocat',
      } as never),
    ).toBe(true);

    const selectSpy = vi.spyOn(input, 'select');
    config.filterDropdownProps?.onOpenChange?.(true);
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockClear();
    config.filterDropdownProps?.onOpenChange?.(false);
    expect(selectSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
