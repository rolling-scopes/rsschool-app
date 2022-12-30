import { fireEvent, render, screen } from '@testing-library/react';
import TeamDistributionModal from './TeamDistributionModal';

describe('TeamDistributionModal', () => {
  it('should render team size input when strict student count is true', async () => {
    render(
      <TeamDistributionModal
        data={{ strictStudentsCount: true }}
        onCancel={jest.fn()}
        courseId={123}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('spinbutton', {
        name: /team size/i,
      }),
    ).toBeInTheDocument();
  });

  it('should not render min and max student inputs when strict student count is true', async () => {
    render(
      <TeamDistributionModal
        data={{ strictStudentsCount: true }}
        onCancel={jest.fn()}
        courseId={123}
        onSubmit={jest.fn()}
      />,
    );
    const strictStudentsSwitch = screen.getByLabelText(/fixed team size/i);

    expect(
      screen.queryByRole('spinbutton', {
        name: /minimum team size/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', {
        name: /maximum team size/i,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(strictStudentsSwitch);

    expect(
      screen.getByRole('spinbutton', {
        name: /minimum team size/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: /maximum team size/i,
      }),
    ).toBeInTheDocument();
  });
});
