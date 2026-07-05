import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GetServerSidePropsContext } from 'next';

// Boundary: the only network call is OpportunitiesApi.getPublicResume.
const { getPublicResume } = vi.hoisted(() => ({ getPublicResume: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  OpportunitiesApi: function OpportunitiesApi() {
    return { getPublicResume };
  },
}));

const ctx = (uuid?: string) => ({ params: uuid ? { uuid } : undefined }) as unknown as GetServerSidePropsContext;

async function loadModule() {
  vi.resetModules();
  return import('./getServerSideProps');
}

describe('getServerSideProps (public resume)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the resume data as props on success', async () => {
    getPublicResume.mockResolvedValue({ data: { name: 'Jane' } });
    const { getServerSideProps } = await loadModule();

    const result = await getServerSideProps(ctx('abc-uuid'));

    expect(getPublicResume).toHaveBeenCalledWith('abc-uuid');
    expect(result).toEqual({ props: { data: { name: 'Jane' } } });
  });

  it('redirects to home when the resume cannot be loaded', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getPublicResume.mockRejectedValue(new Error('not found'));
    const { getServerSideProps } = await loadModule();

    const result = await getServerSideProps(ctx('missing'));

    expect(result).toEqual({ redirect: { destination: '/', permanent: false } });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('builds an authenticated, host-scoped API configuration when RS_HOST is set', async () => {
    // With RS_HOST set the module-init builds baseURL = RS_HOST + BASE_PATH (the truthy
    // branches of `rsHost ? … : undefined`). Importing the module exercises that init path.
    vi.stubEnv('RS_HOST', 'https://api.rs.school');
    getPublicResume.mockResolvedValue({ data: { name: 'Host' } });
    const { getServerSideProps } = await loadModule();

    const result = await getServerSideProps(ctx('uuid-host'));
    expect(result).toEqual({ props: { data: { name: 'Host' } } });
  });

  it('falls back to a relative base when RS_HOST is empty', async () => {
    vi.stubEnv('RS_HOST', '');
    getPublicResume.mockResolvedValue({ data: { name: 'NoHost' } });
    const { getServerSideProps } = await loadModule();

    const result = await getServerSideProps(ctx('uuid-nohost'));
    expect(result).toEqual({ props: { data: { name: 'NoHost' } } });
  });
});
