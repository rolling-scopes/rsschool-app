import { render, screen } from '@testing-library/react';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { TitleCriteria } from './TitleCriteria';

const titleData: CrossCheckCriteriaDataDto = {
  key: 'title-1',
  text: 'Section: Layout',
  type: CrossCheckCriteriaDataDtoTypeEnum.Title,
  index: 0,
} as CrossCheckCriteriaDataDto;

describe('<TitleCriteria />', () => {
  it('renders the title text', () => {
    render(<TitleCriteria titleData={titleData} />);

    expect(screen.getByText('Section: Layout')).toBeInTheDocument();
  });
});
