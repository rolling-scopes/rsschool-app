import { render, screen } from '@testing-library/react';
import { Warning } from './index';

// next/image renders an <img>; stub to a plain img to avoid loader/config concerns.
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// PageLayout pulls in session/header machinery; reduce to a passthrough that
// still surfaces the `loading` branch for assertion.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, loading }: { children: React.ReactNode; loading?: boolean }) => (
    <div data-testid="page-layout" data-loading={String(!!loading)}>
      {children}
    </div>
  ),
}));

describe('Warning', () => {
  it('renders the image (prefixed with /static) and a text message', () => {
    render(<Warning imagePath="/svg/sloth.svg" imageName="Sad sloth" textMessage="Page not found" />);

    const img = screen.getByRole('img', { name: 'Sad sloth' });
    expect(img).toHaveAttribute('src', '/static/svg/sloth.svg');
    expect(img).toHaveAttribute('width', '175');
    expect(img).toHaveAttribute('height', '175');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('renders a JSX text message', () => {
    render(
      <Warning
        imagePath="/svg/x.svg"
        imageName="img"
        textMessage={<span data-testid="custom-message">Custom error</span>}
      />,
    );

    expect(screen.getByTestId('custom-message')).toHaveTextContent('Custom error');
  });

  it('defaults loading to false', () => {
    render(<Warning imagePath="/svg/x.svg" imageName="img" textMessage="msg" />);
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-loading', 'false');
  });

  it('forwards the loading flag to PageLayout', () => {
    render(<Warning imagePath="/svg/x.svg" imageName="img" textMessage="msg" loading />);
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-loading', 'true');
  });
});
