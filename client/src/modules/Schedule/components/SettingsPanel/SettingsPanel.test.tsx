import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  onCreateCourseTask: jest.fn(),
  onCopyFromCourse: jest.fn(),
  onCreateCourseEvent: jest.fn(),
  refreshData: jest.fn(),
};

describe('SettingsPanel', () => {
  it.each`
    button
    ${'Event'}
    ${'Task'}
    ${'Settings'}
    ${'More'}
  `('should render "$button" button', ({ button }: { button: string }) => {
    render(<SettingsPanel {...PROPS_MOCK} />);

    const settingsBtn = screen.getByText(button);

    expect(settingsBtn).toBeInTheDocument();
  });

  it.each`
    button
    ${'Event'}
    ${'Task'}
  `('should not render "$button" button when user is not a course manager', ({ button }: { button: string }) => {
    render(<SettingsPanel {...PROPS_MOCK} isCourseManager={false} />);

    const moreBtn = screen.queryByText(button);

    expect(moreBtn).not.toBeInTheDocument();
  });

  it('should not render "More" button when user is not a course manager and calendar token was not provided', () => {
    render(<SettingsPanel {...PROPS_MOCK} isCourseManager={false} calendarToken={''} />);

    const moreBtn = screen.queryByText(SettingsButtons.More);

    expect(moreBtn).not.toBeInTheDocument();
  });

  it.each`
    item                        | prop                 | condition
    ${SettingsButtons.CopyLink} | ${'calendarToken'}   | ${'calendar token was not provided'}
    ${SettingsButtons.Download} | ${'calendarToken'}   | ${'calendar token was not provided'}
    ${SettingsButtons.Export}   | ${'isCourseManager'} | ${'user is not a course manager'}
    ${SettingsButtons.Copy}     | ${'isCourseManager'} | ${'user is not a course manager'}
  `(
    'should not render additional action "$item" when $condition',
    async ({ item, prop }: { item: string; prop: keyof SettingsPanelProps }) => {
      const props = { ...PROPS_MOCK, [prop]: null };
      render(<SettingsPanel {...props} />);

      const moreBtn = screen.getByRole('button', { name: /more/i });
      fireEvent.click(moreBtn);

      await waitFor(() => {
        const menuItem = screen.queryByRole('menuitem', { name: new RegExp(item, 'i') });
        expect(menuItem).not.toBeInTheDocument();
      });
    },
  );
});
