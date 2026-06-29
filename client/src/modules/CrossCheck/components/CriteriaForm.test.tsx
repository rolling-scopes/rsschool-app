/* eslint-disable testing-library/no-node-access */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckComment, CrossCheckCriteria } from '@client/services/course';
import { CriteriaForm } from './CriteriaForm';

const criteria: CrossCheckCriteria[] = [
  { type: 'title', title: 'Section A', max: 0, criteriaId: 'title-1' },
  { type: 'subtask', text: 'Has tests', max: 5, criteriaId: 'c1' },
  { type: 'subtask', text: 'Has docs', max: 3, criteriaId: 'c2' },
];

const AUTHOR_ID = 99;

function makeProps(overrides: Partial<React.ComponentProps<typeof CriteriaForm>> = {}) {
  return {
    authorId: AUTHOR_ID,
    authorGithubId: 'reviewer-gh',
    comments: [] as CrossCheckComment[],
    reviewComments: [] as CrossCheckComment[],
    criteria,
    onChange: vi.fn(),
    value: [] as { criteriaId: string; percentage: number }[],
    ...overrides,
  };
}

describe('<CriteriaForm />', () => {
  it('renders nothing when there are no criteria', () => {
    const { container } = render(<CriteriaForm {...makeProps({ criteria: [] })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title, criteria texts and max-score avatars', () => {
    render(<CriteriaForm {...makeProps()} />);

    expect(screen.getByRole('heading', { name: 'Section A' })).toBeInTheDocument();
    expect(screen.getByText('Has tests')).toBeInTheDocument();
    expect(screen.getByText('Has docs')).toBeInTheDocument();
    // max-score avatars
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render a Self Review column when no self review is provided', () => {
    render(<CriteriaForm {...makeProps()} />);

    expect(screen.queryByText('Self Review')).not.toBeInTheDocument();
  });

  it('renders a Self Review column when a self review is provided', () => {
    render(<CriteriaForm {...makeProps({ selfReview: [{ criteriaId: 'c1', percentage: 1 }] })} />);

    expect(screen.getAllByText('Self Review').length).toBeGreaterThan(0);
  });

  it('reports a percentage for each non-title criteria when the reviewer rates one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CriteriaForm {...makeProps({ onChange })} />);

    // The first criteria's rate group; pick the third star ("Done" => 100%).
    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    const stars = within(firstCard).getAllByRole('radio');
    await user.click(stars[2]);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ criteriaId: 'c1', percentage: 1 }),
        expect.objectContaining({ criteriaId: 'c2', percentage: 0 }),
      ]),
      [],
    );
  });

  it('emits a partial percentage when the reviewer picks the middle rating', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CriteriaForm {...makeProps({ onChange })} />);

    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    const stars = within(firstCard).getAllByRole('radio');
    await user.click(stars[1]);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ criteriaId: 'c1', percentage: 0.5 })]),
      [],
    );
  });

  it('emits a review comment for the edited criteria', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CriteriaForm {...makeProps({ onChange })} />);

    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    const textarea = within(firstCard).getByRole('textbox');
    await user.type(textarea, 'X');

    expect(onChange).toHaveBeenLastCalledWith(
      [],
      expect.arrayContaining([expect.objectContaining({ criteriaId: 'c1', text: 'X', authorId: AUTHOR_ID })]),
    );
  });

  it('preserves the existing rating of other criteria when rating one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CriteriaForm
        {...makeProps({
          onChange,
          // c1 already has a 50% rating; rating c2 must keep c1's percentage.
          value: [{ criteriaId: 'c1', percentage: 0.5 }],
        })}
      />,
    );

    const secondCard = screen.getByText('Has docs').closest('.ant-card') as HTMLElement;
    const stars = within(secondCard).getAllByRole('radio');
    await user.click(stars[2]);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ criteriaId: 'c1', percentage: 0.5 }),
        expect.objectContaining({ criteriaId: 'c2', percentage: 1 }),
      ]),
      [],
    );
  });

  it('preserves other criteria review comments and reuses their timestamp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const reviewComments: CrossCheckComment[] = [
      { text: 'kept', criteriaId: 'c2', timestamp: 123, authorId: AUTHOR_ID },
    ];
    render(<CriteriaForm {...makeProps({ onChange, reviewComments })} />);

    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    await user.type(within(firstCard).getByRole('textbox'), 'Y');

    expect(onChange).toHaveBeenLastCalledWith(
      [],
      expect.arrayContaining([
        expect.objectContaining({ criteriaId: 'c1', text: 'Y' }),
        expect.objectContaining({ criteriaId: 'c2', text: 'kept', timestamp: 123 }),
      ]),
    );
  });

  it('renders existing comments for a criteria', () => {
    const comments: CrossCheckComment[] = [
      { text: 'Looks good', criteriaId: 'c1', timestamp: 1700000000000, authorGithubId: 'someone' },
    ];
    render(<CriteriaForm {...makeProps({ comments })} />);

    expect(screen.getByText('Looks good')).toBeInTheDocument();
  });

  it('renders a dash for an existing comment with empty text', () => {
    const comments: CrossCheckComment[] = [
      { text: '', criteriaId: 'c1', timestamp: 1700000000000, authorGithubId: 'someone' },
    ];
    render(<CriteriaForm {...makeProps({ comments })} />);

    // Empty comment text → the `c.text || '-'` fallback renders a dash.
    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    expect(within(firstCard).getByText('-')).toBeInTheDocument();
  });

  it('emits a zero percentage when the reviewer picks the lowest rating', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start with a non-zero rating so re-selecting the first star is a real change to 0.
    render(<CriteriaForm {...makeProps({ onChange, value: [{ criteriaId: 'c1', percentage: 1 }] })} />);

    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    const stars = within(firstCard).getAllByRole('radio');
    // First star → value 1 → convertValueToPercentage returns 0.
    await user.click(stars[0]);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ criteriaId: 'c1', percentage: 0 })]),
      [],
    );
  });

  it('emits comments with an empty review value when no value prop is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // value is omitted → `value ?? []` falls back to [] in onReviewCommentChange.
    render(<CriteriaForm {...makeProps({ onChange, value: undefined })} />);

    const firstCard = screen.getByText('Has tests').closest('.ant-card') as HTMLElement;
    await user.type(within(firstCard).getByRole('textbox'), 'Z');

    expect(onChange).toHaveBeenLastCalledWith(
      [],
      expect.arrayContaining([expect.objectContaining({ criteriaId: 'c1', text: 'Z' })]),
    );
  });
});
