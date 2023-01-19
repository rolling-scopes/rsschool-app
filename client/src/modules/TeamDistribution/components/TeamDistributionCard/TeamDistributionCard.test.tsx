import { render, screen, fireEvent } from '@testing-library/react';
import { TeamDistributionDto } from 'api';
import TeamDistributionCard from './TeamDistributionCard';

const distribution = {
  id: 1,
  name: 'Team Distribution 1',
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  description: 'This is the first team distribution.',
  descriptionUrl: 'http://example.com',
} as TeamDistributionDto;

const mockOnDelete = jest.fn(() => Promise.resolve());
const mockOnEdit = jest.fn();
const onRegister = jest.fn();
const onDeleteRegister = jest.fn();

function renderCard(distribution: TeamDistributionDto, isManager = false) {
  return render(
    <TeamDistributionCard
      distribution={distribution}
      isManager={isManager}
      onDelete={mockOnDelete}
      onEdit={mockOnEdit}
      deleteRegister={onDeleteRegister}
      register={onRegister}
      courseAlias="Test"
    />,
  );
}

describe('TeamDistributionCard', () => {
  it('should render the distribution name and description', () => {
    renderCard(distribution);
    expect(screen.getByText(distribution.name)).toBeInTheDocument();
    expect(screen.getByText(distribution.description)).toBeInTheDocument();
  });

  it('should render the distribution period', () => {
    renderCard(distribution);

    expect(screen.getByText(/2022-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2022-01-31/)).toBeInTheDocument();
  });

  it('should render the edit and delete buttons for managers', () => {
    renderCard(distribution, true);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should not render the edit and delete buttons for non-managers', () => {
    renderCard(distribution);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should call the onDelete function when the delete button is clicked', () => {
    renderCard(distribution, true);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockOnDelete).toHaveBeenCalledWith(distribution.id);
  });

  it('should call the onEdit function when the edit button is clicked', () => {
    renderCard(distribution, true);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockOnEdit).toHaveBeenCalledWith(distribution);
  });

  it('should render read more link when distribution has descriptionUrl', () => {
    renderCard(distribution);

    expect(screen.getByRole('link', { name: /read more/i })).toBeInTheDocument();
  });

  it('should not render read more link when distribution has not descriptionUrl', () => {
    renderCard({ ...distribution, descriptionUrl: '' });
    expect(screen.queryByRole('link', { name: /read more/i })).not.toBeInTheDocument();
  });
});
