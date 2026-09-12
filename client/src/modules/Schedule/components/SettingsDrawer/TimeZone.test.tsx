/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeZone from './TimeZone';

// TimeZone is wrapped in a SettingsItem (antd Collapse) that starts collapsed,
// so its Select is not rendered until the panel header is expanded.
async function expandPanel() {
  const user = userEvent.setup();
  const header = document.querySelector('.ant-collapse-header') as HTMLElement;
  await user.click(header);
}

// The Select option list is virtualized (only ~a screenful renders). Type into the
// combobox to filter the list down to the wanted option, then return the dropdown
// option node (scoped to the listbox so it can't collide with the selection item).
async function pickFromDropdown(query: string, optionLabel: string) {
  const combobox = screen.getByRole('combobox');
  fireEvent.mouseDown(combobox);
  fireEvent.change(combobox, { target: { value: query } });
  // Scope to the rendered option rows (role="option") so the matcher can't also pick
  // up the same text rendered in the selection item or the search input's title.
  const option = await screen.findByText(
    (_content, el) =>
      el?.classList.contains('ant-select-item-option-content') === true && el.textContent === optionLabel,
  );
  return option;
}

describe('<TimeZone />', () => {
  it('renders the panel and calls setTimezone with the selected value', async () => {
    const setTimezone = vi.fn();
    render(<TimeZone timezone="Europe/Moscow" setTimezone={setTimezone} />);

    await expandPanel();

    expect(screen.getByRole('heading', { name: 'Time zone' })).toBeInTheDocument();
    expect(screen.getByText('Manage region-specific options for the schedule.')).toBeInTheDocument();
    // antd Select renders the chosen value in the selection item.
    expect(screen.getByText('Europe/Moscow')).toBeInTheDocument();

    const option = await pickFromDropdown('utc', 'UTC');
    fireEvent.click(option);
    expect(setTimezone.mock.calls[0]?.[0]).toBe('UTC');
  });

  it('filters case-insensitively and relabels the legacy Kiev zone', async () => {
    render(<TimeZone timezone="UTC" setTimezone={vi.fn()} />);

    await expandPanel();
    // The legacy zone's value is "Europe/Kiev" (so filter by that) but its label is "Europe/Kyiv".
    const option = await pickFromDropdown('KIEV', 'Europe/Kyiv');

    expect(option).toBeInTheDocument();
  });
});
