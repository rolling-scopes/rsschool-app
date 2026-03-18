import { render, screen } from '@testing-library/react';
import WelcomeCard from './WelcomeCard';

describe('WelcomeCard', () => {
  it('should display correct title for managers', () => {
    render(<WelcomeCard isManager={true} handleCreateTeamDistribution={vi.fn()} />);
    const title = screen.getByText('Create student teams to solve group tasks!');
    expect(title).toBeInTheDocument();
  });

  it('should display correct title for non-managers', () => {
    render(<WelcomeCard isManager={false} handleCreateTeamDistribution={vi.fn()} />);
    const title = screen.getByText('Become a member of the team!');
    expect(title).toBeInTheDocument();
  });

  it('should display the create team distribution button for managers', () => {
    render(<WelcomeCard isManager={true} handleCreateTeamDistribution={vi.fn()} />);
    const button = screen.getByRole('button', { name: /add a new distribution/i });
    expect(button).toBeInTheDocument();
  });

  it('should not display the create team distribution button for non-managers', () => {
    render(<WelcomeCard isManager={false} handleCreateTeamDistribution={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /add a new distribution/i })).not.toBeInTheDocument();
  });

  it('should call the handleCreateTeamDistribution function when the create team distribution button is clicked', () => {
    const handleCreateTeamDistribution = vi.fn();
    render(<WelcomeCard isManager={true} handleCreateTeamDistribution={handleCreateTeamDistribution} />);
    const button = screen.getByRole('button', { name: /add a new distribution/i });
    button.click();
    expect(handleCreateTeamDistribution).toHaveBeenCalled();
  });
});
