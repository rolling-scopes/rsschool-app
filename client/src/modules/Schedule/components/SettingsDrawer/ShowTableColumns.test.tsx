/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import ShowTableColumns from './ShowTableColumns';
import { COLUMNS, CONFIGURABLE_COLUMNS, ColumnKey, ColumnName } from '../../constants';

const AVAILABLE = COLUMNS.filter(c => CONFIGURABLE_COLUMNS.includes(c.key));

// ShowTableColumns is wrapped in a SettingsItem (antd Collapse) that starts collapsed,
// so the checkboxes only render once the panel header is expanded.
async function expandPanel(user: ReturnType<typeof setupUser>) {
  await user.click(document.querySelector('.ant-collapse-header') as HTMLElement);
}

describe('<ShowTableColumns />', () => {
  it('renders every column and shows a hidden column when checked', async () => {
    const user = setupUser();
    const setColumnsHidden = vi.fn();
    render(
      <ShowTableColumns columnsHidden={[ColumnKey.Type, ColumnKey.Organizer]} setColumnsHidden={setColumnsHidden} />,
    );
    await expandPanel(user);

    expect(screen.getByText('Visible Columns')).toBeInTheDocument();
    AVAILABLE.forEach(({ name }) => {
      expect(screen.getByRole('checkbox', { name })).toBeInTheDocument();
    });
    expect(screen.getByRole('checkbox', { name: ColumnName.Type })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: ColumnName.Organizer })).not.toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: ColumnName.Type }));
    expect(setColumnsHidden).toHaveBeenCalledWith([ColumnKey.Organizer]);
  });

  it('hides a visible column (adds its key) when its checkbox is unchecked', async () => {
    const setColumnsHidden = vi.fn();
    const user = setupUser();
    render(<ShowTableColumns columnsHidden={[]} setColumnsHidden={setColumnsHidden} />);
    await expandPanel(user);

    await user.click(screen.getByRole('checkbox', { name: ColumnName.Type }));

    expect(setColumnsHidden).toHaveBeenCalledWith([ColumnKey.Type]);
  });
});
