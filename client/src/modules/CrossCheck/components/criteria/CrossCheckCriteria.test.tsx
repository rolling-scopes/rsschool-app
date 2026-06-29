import { render, screen } from '@testing-library/react';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { CrossCheckCriteria } from './CrossCheckCriteria';

function criteria(overrides: Partial<CrossCheckCriteriaDataDto>): CrossCheckCriteriaDataDto {
  return {
    key: 'k',
    text: 'criteria text',
    type: CrossCheckCriteriaDataDtoTypeEnum.Subtask,
    max: 10,
    ...overrides,
  } as CrossCheckCriteriaDataDto;
}

describe('<CrossCheckCriteria />', () => {
  it('renders nothing when criteria is null', () => {
    const { container } = render(<CrossCheckCriteria criteria={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when criteria is an empty array', () => {
    const { container } = render(<CrossCheckCriteria criteria={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a subtask with its points and no comment', () => {
    render(
      <CrossCheckCriteria
        criteria={[criteria({ key: 's1', text: 'Subtask one', type: 'subtask', point: 6, max: 10 })]}
      />,
    );

    expect(screen.getByText('Subtask one')).toBeInTheDocument();
    expect(screen.getByText('Points for criteria: 6/10')).toBeInTheDocument();
    expect(screen.queryByText('Comment:')).not.toBeInTheDocument();
  });

  it('renders a multi-line comment for a subtask split into paragraphs', () => {
    render(
      <CrossCheckCriteria
        criteria={[
          criteria({
            key: 's1',
            text: 'Subtask',
            type: 'subtask',
            point: 4,
            max: 10,
            textComment: 'line one\nline two',
          }),
        ]}
      />,
    );

    expect(screen.getByText('Comment:')).toBeInTheDocument();
    expect(screen.getByText('line one')).toBeInTheDocument();
    expect(screen.getByText('line two')).toBeInTheDocument();
  });

  it('falls back to 0 points when a subtask has no point value', () => {
    render(<CrossCheckCriteria criteria={[criteria({ key: 's1', text: 'No points', type: 'subtask', max: 5 })]} />);

    expect(screen.getByText('Points for criteria: 0/5')).toBeInTheDocument();
  });

  it('renders the penalty section when a penalty with a point is present', () => {
    render(
      <CrossCheckCriteria
        criteria={[
          criteria({ key: 's1', text: 'Subtask', type: 'subtask', point: 5, max: 10 }),
          criteria({ key: 'p1', text: 'Penalty for X', type: 'penalty', point: -3, max: 3 }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Penalty' })).toBeInTheDocument();
    expect(screen.getByText(/Penalty for X/)).toBeInTheDocument();
  });

  it('does not render the penalty section when penalty has no point', () => {
    render(
      <CrossCheckCriteria criteria={[criteria({ key: 'p1', text: 'Penalty', type: 'penalty', point: 0, max: 3 })]} />,
    );

    expect(screen.queryByRole('heading', { name: 'Penalty' })).not.toBeInTheDocument();
  });

  it('ignores title criteria entirely', () => {
    render(<CrossCheckCriteria criteria={[criteria({ key: 't1', text: 'A title', type: 'title' })]} />);

    expect(screen.queryByText('A title')).not.toBeInTheDocument();
  });
});
