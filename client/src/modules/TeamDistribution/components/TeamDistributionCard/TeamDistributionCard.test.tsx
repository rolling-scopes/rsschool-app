import { render, screen, fireEvent } from '@testing-library/react';
import { TeamDistributionDto } from 'api';
import TeamDistributionCard from './TeamDistributionCard';

const distribution = {
  id: 1,
  name: 'Team Distribution 1',
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  description: 'This is the first team distribution.',
} as TeamDistributionDto;

const mockOnDelete = jest.fn(() => Promise.resolve());
const mockOnEdit = jest.fn();

describe('TeamDistributionCard', () => {
  it('should render the distribution name and description', () => {
    render(
      <TeamDistributionCard
        distribution={distribution}
        isManager={false}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText(distribution.name)).toBeInTheDocument();
    expect(screen.getByText(distribution.description)).toBeInTheDocument();
  });

  it('should render the distribution period', () => {
    render(
      <TeamDistributionCard
        distribution={distribution}
        isManager={false}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText(/2022-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2022-01-31/)).toBeInTheDocument();
  });

  it('should render the edit and delete buttons for managers', () => {
    render(
      <TeamDistributionCard distribution={distribution} isManager={true} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should not render the edit and delete buttons for non-managers', () => {
    render(
      <TeamDistributionCard
        distribution={distribution}
        isManager={false}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should call the onDelete function when the delete button is clicked', () => {
    render(
      <TeamDistributionCard distribution={distribution} isManager={true} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockOnDelete).toHaveBeenCalledWith(distribution.id);
  });

  it('should call the onEdit function when the edit button is clicked', () => {
    render(
      <TeamDistributionCard distribution={distribution} isManager={true} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockOnEdit).toHaveBeenCalledWith(distribution);
  });
});
