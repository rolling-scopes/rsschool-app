import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsButtons, SettingsPanel, SettingsPanelProps } from '.';

const PROPS_MOCK: SettingsPanelProps = {
  isCourseManager: true,
  courseId: 1,
  courseAlias: 'course-alias',
  settings: {
    timezone: 'Region/Town',
  } as SettingsPanelProps['settings'],
  calendarToken: 'calendar-token',
  tags: [],
  onCreateCourseTask: vi.fn(),
  onCopyFromCourse: vi.fn(),
  onCreateCourseEvent: vi.fn(),
  refreshData: vi.fn(),
};

describe('SettingsPanel', () => {
  it('renders the manager action buttons', () => {
    render(<SettingsPanel {...PROPS_MOCK} />);

    for (const button of ['Event', 'Task', 'Settings', 'More']) {
      expect(screen.getByTestId(button)).toBeInTheDocument();
    }
  });

  it('does not render Event or Task buttons for a non-manager', () => {
    render(<SettingsPanel {...PROPS_MOCK} isCourseManager={false} />);

    expect(screen.queryByText('Event')).not.toBeInTheDocument();
    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('should not render "More" button when user is not a course manager and calendar token was not provided', () => {
    render(<SettingsPanel {...PROPS_MOCK} isCourseManager={false} calendarToken={''} />);

    const moreBtn = screen.queryByText(SettingsButtons.More);

    expect(moreBtn).not.toBeInTheDocument();
  });

  it.each`
    item                                                    | prop                 | condition
    ${[SettingsButtons.CopyLink, SettingsButtons.Download]} | ${'calendarToken'}   | ${'calendar token was not provided'}
    ${[SettingsButtons.Export, SettingsButtons.Copy]}       | ${'isCourseManager'} | ${'user is not a course manager'}
  `(
    'should not render additional action "$item" when $condition',
    async ({ item, prop }: { item: string[]; prop: keyof SettingsPanelProps }) => {
      const props = { ...PROPS_MOCK, [prop]: null };
      render(<SettingsPanel {...props} />);

      const moreBtn = screen.getByRole('button', { name: /more/i });
      fireEvent.click(moreBtn);

      await screen.findByRole('menu');
      for (const action of item) {
        expect(screen.queryByRole('menuitem', { name: new RegExp(action, 'i') })).not.toBeInTheDocument();
      }
    },
  );
});
