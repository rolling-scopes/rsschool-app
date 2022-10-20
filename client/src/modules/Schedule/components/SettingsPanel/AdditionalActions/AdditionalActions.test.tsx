import { fireEvent, render, screen } from '@testing-library/react';
import { AdditionalActions, AdditionalActionsProps, AdditionalItems } from '.';

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

    const moreBtn = screen.getByRole('button', { name: /more/gi });
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
});
