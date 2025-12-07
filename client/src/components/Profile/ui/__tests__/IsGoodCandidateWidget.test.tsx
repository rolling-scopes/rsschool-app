import { render, screen } from '@testing-library/react';
import { IsGoodCandidateWidget } from '@client/components/Profile/ui';

describe('IsGoodCandidateWidget', () => {
  it('renders Yes tag when isGoodCandidate is true', () => {
    render(<IsGoodCandidateWidget isGoodCandidate={true} />);

    expect(screen.getByText('Good candidate:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders nothing when isGoodCandidate is false', () => {
    render(<IsGoodCandidateWidget isGoodCandidate={false} />);
    expect(screen.queryByText(/Good candidate:/i)).not.toBeInTheDocument();
  });

  it('renders nothing when isGoodCandidate is null', () => {
    render(<IsGoodCandidateWidget isGoodCandidate={null} />);
    expect(screen.queryByText(/Good candidate:/i)).not.toBeInTheDocument();
  });
});
