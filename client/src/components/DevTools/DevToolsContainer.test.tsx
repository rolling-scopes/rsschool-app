/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DevToolsContainer } from './DevToolsContainer';

// The two tab panes are covered by their own specs; stub them so the container
// test focuses on visibility toggling and tab switching.
vi.mock('./DevToolsUsers', () => ({ default: () => <div data-testid="users-pane">users-pane</div> }));
vi.mock('./DevToolsCurrentUser', () => ({
  default: () => <div data-testid="current-user-pane">current-user-pane</div>,
}));

describe('DevToolsContainer', () => {
  it('renders children and the collapsed float button by default', () => {
    render(
      <DevToolsContainer>
        <div data-testid="app">app content</div>
      </DevToolsContainer>,
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    // FloatButton is shown, card is not
    expect(screen.queryByText('Dev tools')).not.toBeInTheDocument();
    expect(screen.queryByTestId('users-pane')).not.toBeInTheDocument();
  });

  it('opens the dev tools card on float button click showing the users tab', async () => {
    const user = userEvent.setup();
    render(<DevToolsContainer />);

    await user.click(document.querySelector('.ant-float-btn') as HTMLElement);

    expect(screen.getByText('Dev tools')).toBeInTheDocument();
    expect(screen.getByTestId('users-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('current-user-pane')).not.toBeInTheDocument();
  });

  it('switches to the current user session tab', async () => {
    const user = userEvent.setup();
    render(<DevToolsContainer />);
    await user.click(document.querySelector('.ant-float-btn') as HTMLElement);

    await user.click(screen.getByText('Current user session'));

    expect(screen.getByTestId('current-user-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('users-pane')).not.toBeInTheDocument();
  });

  it('closes the card via the close button', async () => {
    const user = userEvent.setup();
    render(<DevToolsContainer />);
    await user.click(document.querySelector('.ant-float-btn') as HTMLElement);
    expect(screen.getByText('Dev tools')).toBeInTheDocument();

    // the close (icon-only) button lives in the card extra slot
    const closeButton = document.querySelector('.ant-card-extra .ant-btn') as HTMLElement;
    await user.click(closeButton);

    expect(screen.queryByText('Dev tools')).not.toBeInTheDocument();
  });
});
