import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

vi.mock('antd', () => ({
  theme: { useToken: () => ({ token: { colorBgContainer: '#fff' } }) },
  Spin: ({ description }: { description: React.ReactNode }) => <div>{description}</div>,
}));

describe('LoadingScreen', () => {
  it('switches between page content and the loading overlay', () => {
    const { rerender } = render(
      <LoadingScreen show={false}>
        <div>Page content</div>
      </LoadingScreen>,
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();

    rerender(
      <LoadingScreen show={true}>
        <div>Page content</div>
      </LoadingScreen>,
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).not.toBeInTheDocument();
  });
});
