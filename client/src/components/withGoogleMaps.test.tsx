/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';

// withGoogleMaps reads `mapsApiKey` at module-eval time to decide whether to
// inject the Google Maps <script>. Control it via the config mock. Because the
// value is captured when the module is first imported, we use vi.resetModules +
// dynamic import per scenario.
const { mapsApiKeyRef } = vi.hoisted(() => ({ mapsApiKeyRef: { value: 'test-key' as string | undefined } }));

vi.mock('@client/configs/gcp', () => ({
  get mapsApiKey() {
    return mapsApiKeyRef.value;
  },
}));

// next/head renders children into a fragment in tests so we can assert on them.
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="head">{children}</div>,
}));

function Dummy(props: { label: string }) {
  return <div data-testid="wrapped">{props.label}</div>;
}

describe('withGoogleMaps', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('injects the maps script and renders the wrapped component when the api key is set', async () => {
    mapsApiKeyRef.value = 'test-key';
    const { withGoogleMaps } = await import('./withGoogleMaps');
    const Wrapped = withGoogleMaps(Dummy);

    render(<Wrapped label="hello" />);

    expect(screen.getByTestId('wrapped')).toHaveTextContent('hello');
    const script = screen.getByTestId('head').querySelector('script');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('src')).toContain('maps.googleapis.com');
    expect(script?.getAttribute('src')).toContain('key=test-key');
  });

  it('passes props through to the wrapped component', async () => {
    mapsApiKeyRef.value = 'k';
    const { withGoogleMaps } = await import('./withGoogleMaps');
    const Wrapped = withGoogleMaps(Dummy);

    render(<Wrapped label="forwarded" />);
    expect(screen.getByTestId('wrapped')).toHaveTextContent('forwarded');
  });

  it('does not inject the script when no api key is configured', async () => {
    mapsApiKeyRef.value = undefined;
    const { withGoogleMaps } = await import('./withGoogleMaps');
    const Wrapped = withGoogleMaps(Dummy);

    render(<Wrapped label="no-maps" />);

    expect(screen.getByTestId('wrapped')).toHaveTextContent('no-maps');
    expect(screen.queryByTestId('head')).not.toBeInTheDocument();
  });
});
