import { render, screen } from '@testing-library/react';
import { UpdateAlert } from './UpdateAlert';

describe('<UpdateAlert />', () => {
  it('renders the daily-update notice text', () => {
    render(<UpdateAlert />);

    expect(
      screen.getAllByText(/Total score and position is updated every day at 04:00 GMT\+3/i).length,
    ).toBeGreaterThan(0);
  });

  it('exposes the notice as a tooltip trigger (question icon)', () => {
    const { container } = render(<UpdateAlert />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.anticon-question-circle')).toBeInTheDocument();
  });
});
