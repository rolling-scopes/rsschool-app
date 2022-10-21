import { fireEvent, render, screen } from '@testing-library/react';
import { AdditionalActions, AdditionalActionsProps, AdditionalItems } from '.';
import { buildExportLink, buildICalendarLink } from './helpers';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  buildExportLink: jest.fn(),
  buildICalendarLink: jest.fn(),
}));

const PROPS_MOCK: AdditionalActionsProps = {
  isCourseManager: true,
  courseId: 1,
  timezone: 'Region/Town',
  calendarToken: 'calendar-token',
  courseAlias: 'course-alias',
  onCopyFromCourse: jest.fn(),
};

describe('AdditionalActions', () => {
  it.each`
    item
    ${AdditionalItems.Calendar}
    ${AdditionalItems.Export}
    ${AdditionalItems.Copy}
  `('should render action "$item"', async ({ item }: { item: string }) => {
    render(<AdditionalActions {...PROPS_MOCK} />);

    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const menuItem = await screen.findByRole('menuitem', { name: new RegExp(item, 'i') });
    expect(menuItem).toBeInTheDocument();
  });

  it.each`
    item                        | prop
    ${AdditionalItems.Calendar} | ${'calendarToken'}
    ${AdditionalItems.Export}   | ${'isCourseManager'}
    ${AdditionalItems.Copy}     | ${'isCourseManager'}
  `(
    'should not render action "$item" when $prop was not provided',
    ({ item, prop }: { item: string; prop: keyof AdditionalActionsProps }) => {
      const props = { ...PROPS_MOCK, [prop]: null };
      render(<AdditionalActions {...props} />);

      const moreBtn = screen.getByRole('button', { name: /more/i });
      fireEvent.click(moreBtn);

      const menuItem = screen.queryByRole('menuitem', { name: new RegExp(item, 'i') });
      expect(menuItem).not.toBeInTheDocument();
    },
  );

  it('should not render "More" button when props was not provided', () => {
    render(<AdditionalActions {...PROPS_MOCK} isCourseManager={false} calendarToken={''} />);

    const moreBtn = screen.queryByRole('button', { name: /more/i });

    expect(moreBtn).not.toBeInTheDocument();
  });

  it('should call onCopyFromCourse when "Copy from" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const copyBtn = await screen.findByRole('menuitem', { name: new RegExp(AdditionalItems.Copy, 'i') });
    fireEvent.click(copyBtn);

    expect(PROPS_MOCK.onCopyFromCourse).toHaveBeenCalled();
  });

  it('should call onCalendarDownload when "iCal Link" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const calendarBtn = await screen.findByRole('menuitem', { name: new RegExp(AdditionalItems.Calendar, 'i') });
    fireEvent.click(calendarBtn);

    expect(buildICalendarLink).toHaveBeenCalledWith(PROPS_MOCK.courseId, PROPS_MOCK.calendarToken, PROPS_MOCK.timezone);
  });

  it('should call onExport when "Export" action was clicked', async () => {
    render(<AdditionalActions {...PROPS_MOCK} />);
    const moreBtn = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreBtn);

    const exportBtn = await screen.findByRole('menuitem', { name: new RegExp(AdditionalItems.Export, 'i') });
    fireEvent.click(exportBtn);

    expect(buildExportLink).toHaveBeenCalledWith(PROPS_MOCK.courseId, PROPS_MOCK.timezone);
  });
});
