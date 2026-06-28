import { render, screen } from '@testing-library/react';
import { IsGoodCandidateWidget } from './IsGoodCandidateWidget';

describe('IsGoodCandidateWidget', () => {
  it('renders the "Yes" tag when the candidate is good', () => {
    render(<IsGoodCandidateWidget isGoodCandidate={true} />);

    expect(screen.getByText('Good candidate:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders nothing when isGoodCandidate is false', () => {
    const { container } = render(<IsGoodCandidateWidget isGoodCandidate={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when isGoodCandidate is null', () => {
    const { container } = render(<IsGoodCandidateWidget isGoodCandidate={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
