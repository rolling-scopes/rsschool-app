import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdditionalActions, AdditionalActionsProps, MenuItemType } from '.';
import { SettingsButtons } from '../SettingsPanel';
import { buildMenuItem } from '../SettingsPanel/helpers';
import { buildExportLink, buildICalendarLink, setExportLink } from './helpers';

window.prompt = jest.fn();

jest.mock('./helpers', () => ({
  buildExportLink: jest.fn(),
  buildICalendarLink: jest.fn(),
  setExportLink: jest.fn(),
}));

const PROPS_MOCK: AdditionalActionsProps = {
  menuItems: generateMenuItems(),
  courseId: 1,
  timezone: 'Region/Town',
  calendarToken: 'calendar-token',
  courseAlias: 'course-alias',
  onCopyFromCourse: jest.fn(),
};

describe('AdditionalActions', () => {
  it('should render menu items', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);

    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const menuItems = await screen.findAllByRole('menuitem');
    expect(menuItems).toHaveLength(4);
  });

  it('should call onCopyFromCourse when "Copy from" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const copyBtn = await screen.findByRole('menuitem', { name: new RegExp(SettingsButtons.Copy, 'i') });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(PROPS_MOCK.onCopyFromCourse).toHaveBeenCalled();
    });
  });

  it('should call onCalendarCopyLink when "Copy iCal Link" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const calendarBtn = await screen.findByRole('menuitem', { name: new RegExp(SettingsButtons.CopyLink, 'i') });
    fireEvent.click(calendarBtn);

    await waitFor(() => {
      expect(buildICalendarLink).toHaveBeenCalledWith(
        PROPS_MOCK.courseId,
        PROPS_MOCK.calendarToken,
        PROPS_MOCK.timezone,
      );
    });
  });

  it('should call onExport when "Export" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const exportBtn = await screen.findByRole('menuitem', { name: new RegExp(SettingsButtons.Export, 'i') });
    fireEvent.click(exportBtn);

    expect(buildExportLink).toHaveBeenCalledWith(PROPS_MOCK.courseId, PROPS_MOCK.timezone);
    expect(setExportLink).toHaveBeenCalled();
  });
});

function generateMenuItems(): MenuItemType[] {
  return [
    buildMenuItem(SettingsButtons.CopyLink, <></>, true),
    buildMenuItem(SettingsButtons.Download, <></>, true),
    buildMenuItem(SettingsButtons.Export, <></>, true),
    buildMenuItem(SettingsButtons.Copy, <></>, true),
  ];
}
