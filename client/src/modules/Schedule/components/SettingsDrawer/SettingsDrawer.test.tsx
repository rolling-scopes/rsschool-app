/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsDrawer from './SettingsDrawer';
import { CourseScheduleItemDtoTagEnum as TagEnum } from '@client/api';
import { ScheduleSettings } from '@client/modules/Schedule/hooks/useScheduleSettings';

// ChangeTagColors (rendered inside the drawer) mounts antd ColorPicker — stub it to a
// lightweight input so the drawer renders quickly in jsdom.
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  const ColorPicker = (props: { defaultValue?: string }) => (
    <input data-testid="color-picker" defaultValue={props.defaultValue} readOnly />
  );
  return { ...actual, ColorPicker };
});

const settings: ScheduleSettings = {
  timezone: 'Europe/Moscow',
  setTimezone: vi.fn(),
  tagColors: { [TagEnum.Coding]: '#722ed1' },
  setTagColors: vi.fn(),
  columnsHidden: [],
  setColumnsHidden: vi.fn(),
  tagsHidden: [],
  setTagsHidden: vi.fn(),
};

describe('<SettingsDrawer />', () => {
  it('renders the trigger button but keeps the drawer closed initially', () => {
    render(<SettingsDrawer settings={settings} tags={[TagEnum.Coding]} />);

    expect(screen.getByTestId('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Schedule settings')).not.toBeInTheDocument();
  });

  it('opens the drawer with all three settings sections when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsDrawer settings={settings} tags={[TagEnum.Coding]} />);

    await user.click(screen.getByTestId('Settings'));

    expect(await screen.findByText('Schedule settings')).toBeInTheDocument();
    // Collapsible section headers from the three child panels.
    expect(screen.getByText('Time zone')).toBeInTheDocument();
    expect(screen.getByText('Table columns')).toBeInTheDocument();
    expect(screen.getByText('Change Tag Colors')).toBeInTheDocument();
  });

  it('closes the drawer when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsDrawer settings={settings} tags={[TagEnum.Coding]} />);

    await user.click(screen.getByTestId('Settings'));
    expect(await screen.findByText('Schedule settings')).toBeInTheDocument();
    // While open, the drawer content wrapper is not hidden.
    const hiddenWrapper = () => document.querySelector('.ant-drawer-content-wrapper-hidden');
    expect(hiddenWrapper()).toBeNull();

    await user.click(screen.getByRole('button', { name: /close/i }));

    // antd keeps the Drawer mounted but applies the `-hidden` class on close.
    await waitFor(() => expect(hiddenWrapper()).not.toBeNull());
  });
});
