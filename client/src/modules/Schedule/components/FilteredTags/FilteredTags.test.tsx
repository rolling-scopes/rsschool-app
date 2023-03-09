import { fireEvent, render, screen, within } from '@testing-library/react';
import { FilteredTags } from './FilteredTags';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum as TagsEnum } from 'api';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';

describe('FilteredTags', () => {
  const onTagCloseMock = jest.fn();
  const onClearAllButtonClick = jest.fn();

  it('should not render when tags were not provided', () => {
    render(<FilteredTags tagFilters={[]} onTagClose={onTagCloseMock} onClearAllButtonClick={onClearAllButtonClick} />);

    expect(screen.queryByText(/Type /)).not.toBeInTheDocument();
  });

  it.each`
    tag
    ${TagsEnum.Coding}
    ${TagsEnum.CrossCheckReview}
    ${TagsEnum.CrossCheckSubmit}
    ${TagsEnum.Interview}
    ${TagsEnum.Lecture}
    ${TagsEnum.SelfStudy}
    ${TagsEnum.Test}
  `('should render tag "$tag"', ({ tag }: { tag: CourseScheduleItemDto['tag'] }) => {
    render(
      <FilteredTags tagFilters={[tag]} onTagClose={onTagCloseMock} onClearAllButtonClick={onClearAllButtonClick} />,
    );

    expect(screen.getByText(getTagLabel(tag))).toBeInTheDocument();
  });

  it('should render several tags', () => {
    render(
      <FilteredTags
        tagFilters={[TagsEnum.Coding, TagsEnum.CrossCheckReview, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );

    expect(screen.getAllByText(/Type: /)).toHaveLength(3);
  });

  it('should render "Clear all" button', () => {
    render(
      <FilteredTags
        tagFilters={[TagsEnum.Coding, TagsEnum.CrossCheckReview, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );

    expect(screen.getByText(/Clear all/)).toBeInTheDocument();
  });

  it('should remove selected tag when onTagClose was called', () => {
    render(
      <FilteredTags
        tagFilters={[TagsEnum.Coding, TagsEnum.CrossCheckReview, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );
    const interviewTag = screen.getByText(getTagLabel(TagsEnum.Interview));
    const interviewCrossIcon = within(interviewTag).getByLabelText('close');

    fireEvent.click(interviewCrossIcon);

    expect(onTagCloseMock).toHaveBeenCalledWith(TagsEnum.Interview);
  });

  it('should clear all tags when onClearAllButtonClick was called', () => {
    render(
      <FilteredTags
        tagFilters={[TagsEnum.Coding, TagsEnum.CrossCheckReview, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );

    const clearAllBtn = screen.getByText(/Clear all/);
    fireEvent.click(clearAllBtn);

    expect(onClearAllButtonClick).toHaveBeenCalled();
  });
});

function getTagLabel(tag: CourseScheduleItemDto['tag']) {
  return TAG_NAME_MAP[tag];
}
