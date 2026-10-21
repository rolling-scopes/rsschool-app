import { fireEvent, render, screen, within } from '@testing-library/react';
import { FilteredTags } from './FilteredTags';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum as TagsEnum } from '@client/api';
import { TAG_NAME_MAP } from '@client/modules/Schedule/constants';

describe('FilteredTags', () => {
  it('renders all tags and handles close, clear, and empty states', () => {
    const onTagClose = vi.fn();
    const onClearAllButtonClick = vi.fn();
    const tags = [
      TagsEnum.Coding,
      TagsEnum.CrossCheckReview,
      TagsEnum.CrossCheckSubmit,
      TagsEnum.Interview,
      TagsEnum.Lecture,
      TagsEnum.SelfStudy,
      TagsEnum.Test,
    ];
    const { rerender } = render(
      <FilteredTags tagFilters={tags} onTagClose={onTagClose} onClearAllButtonClick={onClearAllButtonClick} />,
    );

    for (const tag of tags) expect(screen.getByText(getTagLabel(tag))).toBeInTheDocument();
    const interviewTag = screen.getByText(getTagLabel(TagsEnum.Interview));
    fireEvent.click(within(interviewTag).getByRole('img', { name: 'Close' }));
    expect(onTagClose).toHaveBeenCalledWith(TagsEnum.Interview);

    fireEvent.click(screen.getByText(/Clear all/));
    expect(onClearAllButtonClick).toHaveBeenCalled();

    rerender(<FilteredTags tagFilters={[]} onTagClose={onTagClose} onClearAllButtonClick={onClearAllButtonClick} />);
    expect(screen.queryByText(/Type /)).not.toBeInTheDocument();
  });
});

function getTagLabel(tag: CourseScheduleItemDto['tag']) {
  return TAG_NAME_MAP[tag];
}
