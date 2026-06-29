import { render, screen } from '@testing-library/react';
import { LegacyFeedback } from '@common/models/profile';
import { LegacyScreeningFeedback } from './LegacyScreeningFeedback';

function makeFeedback(overrides: Partial<LegacyFeedback> = {}): LegacyFeedback {
  return {
    comment: 'Great candidate',
    skills: { htmlCss: 5, dataStructures: 4, common: 3 },
    programmingTask: { task: 'sum two numbers', resolved: 1, comment: 'clean code', codeWritingLevel: 4 },
    english: 5,
    ...overrides,
  };
}

describe('LegacyScreeningFeedback', () => {
  it('renders the comment when present', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ comment: 'Great candidate' })} />);
    expect(screen.getByText('Comment:')).toBeInTheDocument();
    expect(screen.getByText('Great candidate')).toBeInTheDocument();
  });

  it('does not render the comment block when comment is empty', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ comment: '' })} />);
    expect(screen.queryByText('Comment:')).not.toBeInTheDocument();
  });

  it('renders the programming task and coding comment', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback()} />);
    expect(screen.getByText('sum two numbers')).toBeInTheDocument();
    expect(screen.getByText(/clean code/)).toBeInTheDocument();
  });

  it('renders "Yes" tag when resolved === 1', () => {
    render(
      <LegacyScreeningFeedback
        feedback={makeFeedback({ programmingTask: { task: 't', resolved: 1, comment: 'c', codeWritingLevel: 3 } })}
      />,
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders "Yes (with tips)" tag when resolved === 2', () => {
    render(
      <LegacyScreeningFeedback
        feedback={makeFeedback({ programmingTask: { task: 't', resolved: 2, comment: 'c', codeWritingLevel: 3 } })}
      />,
    );
    expect(screen.getByText('Yes (with tips)')).toBeInTheDocument();
  });

  it('renders "No" tag when resolved is neither 1 nor 2', () => {
    render(
      <LegacyScreeningFeedback
        feedback={makeFeedback({ programmingTask: { task: 't', resolved: 0, comment: 'c', codeWritingLevel: 3 } })}
      />,
    );
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('maps a numeric english level via ENGLISH_LEVELS', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ english: 5 })} />);
    // ENGLISH_LEVELS[5] === 'B1' -> uppercased
    expect(screen.getByText(/Estimated English level: B1/)).toBeInTheDocument();
  });

  it('renders a string english level as-is (uppercased)', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ english: 'b2' })} />);
    expect(screen.getByText(/Estimated English level: B2/)).toBeInTheDocument();
  });

  it('renders the skills table rows', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback()} />);
    expect(screen.getByText('HTML/CSS')).toBeInTheDocument();
    expect(screen.getByText('Data structures')).toBeInTheDocument();
    expect(screen.getByText('Common of CS / Programming')).toBeInTheDocument();
    expect(screen.getByText('Code writing level')).toBeInTheDocument();
  });
});
