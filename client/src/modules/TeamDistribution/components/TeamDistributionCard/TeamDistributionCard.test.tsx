import { render, screen, fireEvent } from '@testing-library/react';
import { TeamDistributionDto } from '@client/api';
import TeamDistributionCard from './TeamDistributionCard';

const distribution = {
  id: 1,
  name: 'Team Distribution 1',
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  description: 'This is the first team distribution.',
  descriptionUrl: 'http://example.com',
} as TeamDistributionDto;

const mockOnDelete = vi.fn(() => Promise.resolve());
const mockOnEdit = vi.fn();
const onRegister = vi.fn();
const onDeleteRegister = vi.fn();
const onOpenSubmitScoreModal = vi.fn();

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
      isCourseDementor={false}
      onOpenSubmitScoreModal={onOpenSubmitScoreModal}
    />,
  );
}

describe('TeamDistributionCard', () => {
  it('should render distribution details and read-more link without manager controls', () => {
    renderCard(distribution);
    expect(screen.getByText(distribution.name)).toBeInTheDocument();
    expect(screen.getByText(distribution.description)).toBeInTheDocument();
    expect(screen.getByText(/2022-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2022-01-31/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toBeInTheDocument();
  });

  it('should render manager controls and call their handlers', () => {
    renderCard(distribution, true);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(deleteButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(distribution.id);
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(distribution);
  });

  it('should not render read more link when distribution has not descriptionUrl', () => {
    renderCard({ ...distribution, descriptionUrl: '' });
    expect(screen.queryByRole('link', { name: /read more/i })).not.toBeInTheDocument();
  });
});
