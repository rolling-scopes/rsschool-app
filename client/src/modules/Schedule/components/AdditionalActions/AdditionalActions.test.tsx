import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdditionalActions, AdditionalActionsProps, MenuItemType } from '.';
import { SettingsButtons } from '../SettingsPanel';
import { buildMenuItem } from '../SettingsPanel/helpers';
import { buildExportLink, buildICalendarLink, setExportLink } from './helpers';

window.prompt = vi.fn();

vi.mock('./helpers', () => ({
  buildExportLink: vi.fn(),
  buildICalendarLink: vi.fn(),
  setExportLink: vi.fn(),
}));

const PROPS_MOCK: AdditionalActionsProps = {
  menuItems: generateMenuItems(),
  courseId: 1,
  timezone: 'Region/Town',
  calendarToken: 'calendar-token',
  courseAlias: 'course-alias',
  onCopyFromCourse: vi.fn(),
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

  it('downloads the iCal file when "Download" is clicked and a token exists', async () => {
    vi.mocked(buildICalendarLink).mockReturnValue('/api/v2/courses/1/icalendar/calendar-token?timezone=Region_Town');
    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    // Stub the created anchor so .click() is observable and does not navigate jsdom.
    const realCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag) as HTMLElement;
      if (tag === 'a') {
        (el as HTMLAnchorElement).click = clickSpy;
      }
      return el;
    });

    render(<AdditionalActions {...PROPS_MOCK} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    const downloadBtn = await screen.findByRole('menuitem', { name: new RegExp(SettingsButtons.Download, 'i') });
    fireEvent.click(downloadBtn);

    await waitFor(() =>
      expect(buildICalendarLink).toHaveBeenCalledWith(
        PROPS_MOCK.courseId,
        PROPS_MOCK.calendarToken,
        PROPS_MOCK.timezone,
      ),
    );
    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();

    createSpy.mockRestore();
    appendSpy.mockRestore();
  });

  it('does nothing on "Download" when there is no calendar token', async () => {
    const clickSpy = vi.fn();
    const realCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag) as HTMLElement;
      if (tag === 'a') (el as HTMLAnchorElement).click = clickSpy;
      return el;
    });

    render(<AdditionalActions {...PROPS_MOCK} calendarToken="" />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    const downloadBtn = await screen.findByRole('menuitem', { name: new RegExp(SettingsButtons.Download, 'i') });
    fireEvent.click(downloadBtn);

    // The `if (calendarToken)` guard is false → no anchor is clicked.
    await waitFor(() => expect(downloadBtn).toBeInTheDocument());
    expect(clickSpy).not.toHaveBeenCalled();

    createSpy.mockRestore();
  });

  it('ignores a menu item whose key matches no known action (default branch)', async () => {
    const onCopyFromCourse = vi.fn();
    const menuItems = [...generateMenuItems(), buildMenuItem('unknown-key' as never, <></>, true)];
    render(<AdditionalActions {...PROPS_MOCK} onCopyFromCourse={onCopyFromCourse} menuItems={menuItems} />);
    fireEvent.click(screen.getByRole('button', { name: /more/i }));

    const items = await screen.findAllByRole('menuitem');
    // Click the last (unknown) item → handleMenuItemClick hits the default no-op branch.
    fireEvent.click(items[items.length - 1]);

    // No action handler fires for the unknown key.
    expect(onCopyFromCourse).not.toHaveBeenCalled();
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
