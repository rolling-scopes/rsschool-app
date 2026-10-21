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
  it('renders the default comment, task, resolution, English level and skills', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ comment: 'Great candidate' })} />);
    expect(screen.getByText('Comment:')).toBeInTheDocument();
    expect(screen.getByText('Great candidate')).toBeInTheDocument();
    expect(screen.getByText('sum two numbers')).toBeInTheDocument();
    expect(screen.getByText(/clean code/)).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText(/Estimated English level: B1/)).toBeInTheDocument();
    expect(screen.getByText('HTML/CSS')).toBeInTheDocument();
    expect(screen.getByText('Data structures')).toBeInTheDocument();
    expect(screen.getByText('Common of CS / Programming')).toBeInTheDocument();
    expect(screen.getByText('Code writing level')).toBeInTheDocument();
  });

  it('does not render the comment block when comment is empty', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ comment: '' })} />);
    expect(screen.queryByText('Comment:')).not.toBeInTheDocument();
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

  it('renders a string english level as-is (uppercased)', () => {
    render(<LegacyScreeningFeedback feedback={makeFeedback({ english: 'b2' })} />);
    expect(screen.getByText(/Estimated English level: B2/)).toBeInTheDocument();
  });
});
