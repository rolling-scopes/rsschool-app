import { render, screen } from '@testing-library/react';
import { IsGoodCandidateWidget } from '@client/components/Profile/ui';

vi.mock('antd', () => ({
  Tag: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Typography: { Text: ({ children }: React.PropsWithChildren) => <span>{children}</span> },
}));

describe('IsGoodCandidateWidget', () => {
  it('renders only for a true candidate value', () => {
    const { rerender } = render(<IsGoodCandidateWidget isGoodCandidate={true} />);

    expect(screen.getByText('Good candidate:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    rerender(<IsGoodCandidateWidget isGoodCandidate={false} />);
    expect(screen.queryByText(/Good candidate:/i)).not.toBeInTheDocument();

    rerender(<IsGoodCandidateWidget isGoodCandidate={null} />);
    expect(screen.queryByText(/Good candidate:/i)).not.toBeInTheDocument();
  });
});
