import { fireEvent, render, screen } from '@testing-library/react';
import WelcomeCard from './WelcomeCard';

describe('WelcomeCard', () => {
  it('renders and handles manager and non-manager states', () => {
    const handleCreateTeamDistribution = vi.fn();
    const { rerender } = render(
      <WelcomeCard isManager={true} handleCreateTeamDistribution={handleCreateTeamDistribution} />,
    );
    expect(screen.getByText('Create student teams to solve group tasks!')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /add a new distribution/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleCreateTeamDistribution).toHaveBeenCalled();

    rerender(<WelcomeCard isManager={false} handleCreateTeamDistribution={handleCreateTeamDistribution} />);
    expect(screen.getByText('Become a member of the team!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add a new distribution/i })).not.toBeInTheDocument();
  });
});
