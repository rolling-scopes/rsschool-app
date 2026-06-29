import { render, screen } from '@testing-library/react';
import { StudentBasic } from '@client/services/models';
import { AssignmentLink, CrossCheckAssignmentLink } from './CrossCheckAssignmentLink';

const assignment: AssignmentLink = {
  student: {
    discord: { id: '123', username: 'octocat', discriminator: '0' },
  } as StudentBasic,
  url: 'https://github.com/student/task',
};

describe('<CrossCheckAssignmentLink />', () => {
  it('renders nothing when there is no assignment', () => {
    const { container } = render(<CrossCheckAssignmentLink assignment={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the student discord and the solution link', () => {
    render(<CrossCheckAssignmentLink assignment={assignment} />);

    expect(screen.getByText('Student Discord:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('@octocat')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: assignment.url });
    expect(link).toHaveAttribute('href', assignment.url);
  });

  it('renders "unknown" discord when the student has no discord', () => {
    render(
      <CrossCheckAssignmentLink
        assignment={{ student: { discord: null } as StudentBasic, url: 'https://example.com' }}
      />,
    );

    expect(screen.getByText(/unknown/)).toBeInTheDocument();
  });
});
