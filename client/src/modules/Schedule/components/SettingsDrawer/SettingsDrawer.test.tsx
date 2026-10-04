/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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
  it('renders, opens, and closes the settings drawer', async () => {
    const user = setupUser();
    render(<SettingsDrawer settings={settings} tags={[TagEnum.Coding]} />);

    expect(screen.getByTestId('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Schedule settings')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('Settings'));

    expect(await screen.findByText('Schedule settings')).toBeInTheDocument();
    expect(screen.getByText('Time zone')).toBeInTheDocument();
    expect(screen.getByText('Table columns')).toBeInTheDocument();
    expect(screen.getByText('Change Tag Colors')).toBeInTheDocument();

    const hiddenWrapper = () => document.querySelector('.ant-drawer-content-wrapper-hidden');
    expect(hiddenWrapper()).toBeNull();

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => expect(hiddenWrapper()).not.toBeNull());
  });
});
