import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders children directly when show is false', () => {
    render(
      <LoadingScreen show={false}>
        <div>Page content</div>
      </LoadingScreen>,
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });

  it('renders the loading overlay when show is true', () => {
    render(
      <LoadingScreen show={true}>
        <div>Page content</div>
      </LoadingScreen>,
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).not.toBeInTheDocument();
  });
});
