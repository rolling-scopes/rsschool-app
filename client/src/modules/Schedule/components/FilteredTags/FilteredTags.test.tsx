import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { FilteredTags } from './FilteredTags';
import { CourseScheduleItemDto, CourseScheduleItemDtoTagEnum as TagsEnum } from 'api';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';

describe('FilteredTags', () => {
  const onTagCloseMock = jest.fn();

  it('should not render when tags were not provided', () => {
    render(<FilteredTags tagFilter={[]} onTagClose={onTagCloseMock} />);

    expect(screen.queryByText(/Tag: /)).not.toBeInTheDocument();
  });

  it.each`
    tag
    ${TagsEnum.Coding}
    ${TagsEnum.CrossCheck}
    ${TagsEnum.Interview}
    ${TagsEnum.Lecture}
    ${TagsEnum.SelfStudy}
    ${TagsEnum.Test}
  `('should render tag "$tag"', ({ tag }: { tag: CourseScheduleItemDto['tag'] }) => {
    render(<FilteredTags tagFilter={[tag]} onTagClose={onTagCloseMock} />);

    expect(screen.getByText(getTagLabel(tag))).toBeInTheDocument();
  });

  it('should render several tags', () => {
    render(
      <FilteredTags
        tagFilter={[TagsEnum.Coding, TagsEnum.CrossCheck, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
      />,
    );

    expect(screen.getAllByText(/Tag: /)).toHaveLength(3);
  });

  it('should remove selected tag when onTagClose was called', () => {
    render(
      <FilteredTags
        tagFilter={[TagsEnum.Coding, TagsEnum.CrossCheck, TagsEnum.Interview]}
        onTagClose={onTagCloseMock}
      />,
    );
    const interviewTag = screen.getByText(getTagLabel(TagsEnum.Interview));
    const interviewCrossIcon = within(interviewTag).getByLabelText('close');

    fireEvent.click(interviewCrossIcon);

    expect(onTagCloseMock).toHaveBeenCalledWith(TagsEnum.Interview);
  });
});

function getTagLabel(tag: CourseScheduleItemDto['tag']) {
  return `Tag: ${TAG_NAME_MAP[tag]}`;
}
