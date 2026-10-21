import { render, screen } from '@testing-library/react';
import { CrossCheckCriteriaDataDto, CrossCheckCriteriaDataDtoTypeEnum } from '@client/api';
import { CrossCheckCriteria } from './CrossCheckCriteria';

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    theme: {
      ...actual.theme,
      useToken: () => ({ token: { colorBorder: '#ddd', colorBgLayout: '#fff', red3: '#f00', green3: '#0f0' } }),
    },
    Typography: {
      ...actual.Typography,
      Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      Title: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
    },
  };
});

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
  it('renders empty, subtask, comment, points, penalty, and title states', () => {
    const { container, rerender } = render(<CrossCheckCriteria criteria={null} />);

    expect(container).toBeEmptyDOMElement();

    rerender(<CrossCheckCriteria criteria={[]} />);

    expect(container).toBeEmptyDOMElement();

    rerender(
      <CrossCheckCriteria
        criteria={[
          criteria({ key: 's1', text: 'Subtask one', type: 'subtask', point: 6, max: 10 }),
          criteria({
            key: 's2',
            text: 'Subtask with comment',
            type: 'subtask',
            point: 4,
            max: 10,
            textComment: 'line one\nline two',
          }),
          criteria({ key: 's3', text: 'No points', type: 'subtask', max: 5 }),
          criteria({ key: 'p1', text: 'Penalty for X', type: 'penalty', point: -3, max: 3 }),
          criteria({ key: 'p2', text: 'Unused penalty', type: 'penalty', point: 0, max: 3 }),
          criteria({ key: 't1', text: 'A title', type: 'title' }),
        ]}
      />,
    );

    expect(screen.getByText('Subtask one')).toBeInTheDocument();
    expect(screen.getByText('Points for criteria: 6/10')).toBeInTheDocument();
    expect(screen.getByText('Comment:')).toBeInTheDocument();
    expect(screen.getByText('line one')).toBeInTheDocument();
    expect(screen.getByText('line two')).toBeInTheDocument();
    expect(screen.getByText('Points for criteria: 0/5')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Penalty' })).toBeInTheDocument();
    expect(screen.getByText(/Penalty for X/)).toBeInTheDocument();
    expect(screen.queryByText('A title')).not.toBeInTheDocument();

    rerender(
      <CrossCheckCriteria criteria={[criteria({ key: 'p1', text: 'Penalty', type: 'penalty', point: 0, max: 3 })]} />,
    );

    expect(screen.queryByRole('heading', { name: 'Penalty' })).not.toBeInTheDocument();
  });
});
