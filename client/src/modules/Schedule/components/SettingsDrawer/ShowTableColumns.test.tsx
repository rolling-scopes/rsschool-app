/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowTableColumns from './ShowTableColumns';
import { COLUMNS, CONFIGURABLE_COLUMNS, ColumnKey, ColumnName } from '../../constants';

const AVAILABLE = COLUMNS.filter(c => CONFIGURABLE_COLUMNS.includes(c.key));

// ShowTableColumns is wrapped in a SettingsItem (antd Collapse) that starts collapsed,
// so the checkboxes only render once the panel header is expanded.
async function expandPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(document.querySelector('.ant-collapse-header') as HTMLElement);
}

describe('<ShowTableColumns />', () => {
  it('renders a checkbox for every configurable column', async () => {
    const user = userEvent.setup();
    render(<ShowTableColumns columnsHidden={[]} setColumnsHidden={vi.fn()} />);
    await expandPanel(user);

    expect(screen.getByText('Visible Columns')).toBeInTheDocument();
    AVAILABLE.forEach(({ name }) => {
      expect(screen.getByRole('checkbox', { name })).toBeInTheDocument();
    });
  });

  it('marks a column as unchecked when it is in columnsHidden', async () => {
    const user = userEvent.setup();
    render(<ShowTableColumns columnsHidden={[ColumnKey.Type]} setColumnsHidden={vi.fn()} />);
    await expandPanel(user);

    expect(screen.getByRole('checkbox', { name: ColumnName.Type })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: ColumnName.Organizer })).toBeChecked();
  });

  it('hides a visible column (adds its key) when its checkbox is unchecked', async () => {
    const setColumnsHidden = vi.fn();
    const user = userEvent.setup();
    render(<ShowTableColumns columnsHidden={[]} setColumnsHidden={setColumnsHidden} />);
    await expandPanel(user);

    await user.click(screen.getByRole('checkbox', { name: ColumnName.Type }));

    expect(setColumnsHidden).toHaveBeenCalledWith([ColumnKey.Type]);
  });

  it('shows a hidden column (removes its key) when its checkbox is re-checked', async () => {
    const setColumnsHidden = vi.fn();
    const user = userEvent.setup();
    render(
      <ShowTableColumns columnsHidden={[ColumnKey.Type, ColumnKey.Organizer]} setColumnsHidden={setColumnsHidden} />,
    );
    await expandPanel(user);

    await user.click(screen.getByRole('checkbox', { name: ColumnName.Type }));

    expect(setColumnsHidden).toHaveBeenCalledWith([ColumnKey.Organizer]);
  });
});
