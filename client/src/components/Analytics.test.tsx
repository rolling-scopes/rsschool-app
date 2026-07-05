import { render, screen } from '@testing-library/react';

vi.mock('next/script', () => ({
  default: ({ src, children, id }: { src?: string; children?: React.ReactNode; id?: string }) => (
    <script data-testid="next-script" data-src={src} data-id={id}>
      {children}
    </script>
  ),
}));

describe('Analytics', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it('renders nothing outside production', async () => {
    process.env.NODE_ENV = 'test';
    vi.resetModules();
    const { Analytics } = await import('./Analytics');

    const { container } = render(<Analytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the analytics scripts in production', async () => {
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { Analytics } = await import('./Analytics');

    render(<Analytics />);

    const scripts = screen.getAllByTestId('next-script');
    expect(scripts.length).toBeGreaterThanOrEqual(3);
    expect(scripts.some(s => s.getAttribute('data-src')?.includes('googletagmanager.com'))).toBe(true);
    expect(scripts.some(s => s.getAttribute('data-src')?.includes('cloudflareinsights.com'))).toBe(true);
  });
});
