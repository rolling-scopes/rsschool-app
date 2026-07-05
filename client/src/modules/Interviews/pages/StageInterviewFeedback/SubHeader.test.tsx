// The back arrow is an antd icon with no accessible name/role, so the click target is found
// by its icon class via the container — direct node access is intentional here.
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { SubHeader } from './SubHeader';

// next/router is aliased to the shared mock by vitest config.
const back = (useRouter() as unknown as { back: ReturnType<typeof vi.fn> }).back;

describe('<SubHeader />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the "Completed" green tag when isCompleted is true', () => {
    render(<SubHeader isCompleted />);

    expect(screen.getByText('Feedback form')).toBeInTheDocument();
    const tag = screen.getByText('Completed');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass('ant-tag-green');
  });

  it('shows the "Uncompleted" tag (no green) when isCompleted is false', () => {
    render(<SubHeader isCompleted={false} />);

    const tag = screen.getByText('Uncompleted');
    expect(tag).toBeInTheDocument();
    expect(tag).not.toHaveClass('ant-tag-green');
  });

  it('navigates back when the back arrow is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<SubHeader isCompleted={false} />);

    const arrow = container.querySelector('.anticon-arrow-left');
    expect(arrow).toBeTruthy();
    await user.click(arrow as Element);

    expect(back).toHaveBeenCalledTimes(1);
  });
});
