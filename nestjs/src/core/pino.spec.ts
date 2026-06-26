const cloudwatchStreamMock = vi.fn(() => ({ __stream: true }));

vi.mock('@apalchys/pino-cloudwatch', () => ({
  default: cloudwatchStreamMock,
}));

// pino.ts reads env vars at module-load time, so each scenario resets the module
// registry and re-imports with a tailored process.env.
const loadGetPinoHttp = async (env: Record<string, string | undefined>) => {
  vi.resetModules();
  cloudwatchStreamMock.mockClear();

  const original = { ...process.env };
  // Start from a clean slate for the vars the module reads.
  delete process.env.NODE_ENV;
  delete process.env.AWS_LAMBDA;
  delete process.env.RSSHCOOL_AWS_ACCESS_KEY_ID;
  delete process.env.RSSHCOOL_AWS_SECRET_ACCESS_KEY;
  delete process.env.RSSHCOOL_AWS_REGION;
  Object.assign(process.env, env);

  const mod = await import('./pino');
  const result = mod.getPinoHttp();

  process.env = original;
  return result;
};

const BASE_OPTIONS = { base: {}, autoLogging: false, quietReqLogger: true };

describe('getPinoHttp', () => {
  it('returns plain pino options in dev mode (NODE_ENV != production)', async () => {
    const result = await loadGetPinoHttp({
      NODE_ENV: 'development',
      RSSHCOOL_AWS_ACCESS_KEY_ID: 'key',
      RSSHCOOL_AWS_SECRET_ACCESS_KEY: 'secret',
    });

    expect(result).toEqual(BASE_OPTIONS);
    expect(cloudwatchStreamMock).not.toHaveBeenCalled();
  });

  it('returns plain pino options in dev (no AWS_LAMBDA, non-production) even with credentials', async () => {
    // devMode = NODE_ENV !== production && !AWS_LAMBDA -> true here, so no cloudwatch stream.
    const result = await loadGetPinoHttp({
      NODE_ENV: 'test',
      RSSHCOOL_AWS_ACCESS_KEY_ID: 'key',
      RSSHCOOL_AWS_SECRET_ACCESS_KEY: 'secret',
      RSSHCOOL_AWS_REGION: 'eu-central-1',
    });

    expect(result).toEqual(BASE_OPTIONS);
    expect(cloudwatchStreamMock).not.toHaveBeenCalled();
  });

  it('attaches a cloudwatch stream under AWS_LAMBDA when credentials are present (devMode forced false)', async () => {
    // AWS_LAMBDA forces devMode false regardless of NODE_ENV, so with creds the stream is added.
    const result = await loadGetPinoHttp({
      NODE_ENV: 'development',
      AWS_LAMBDA: 'true',
      RSSHCOOL_AWS_ACCESS_KEY_ID: 'key',
      RSSHCOOL_AWS_SECRET_ACCESS_KEY: 'secret',
      RSSHCOOL_AWS_REGION: 'eu-central-1',
    });

    expect(Array.isArray(result)).toBe(true);
    expect(cloudwatchStreamMock).toHaveBeenCalledTimes(1);
  });

  it('returns plain pino options when AWS credentials are missing', async () => {
    const result = await loadGetPinoHttp({ NODE_ENV: 'production' });

    expect(result).toEqual(BASE_OPTIONS);
    expect(cloudwatchStreamMock).not.toHaveBeenCalled();
  });

  it('returns plain pino options when only the access key id is set', async () => {
    const result = await loadGetPinoHttp({
      NODE_ENV: 'production',
      RSSHCOOL_AWS_ACCESS_KEY_ID: 'key',
    });

    expect(result).toEqual(BASE_OPTIONS);
    expect(cloudwatchStreamMock).not.toHaveBeenCalled();
  });

  it('attaches a cloudwatch stream in production with full AWS credentials', async () => {
    const result = await loadGetPinoHttp({
      NODE_ENV: 'production',
      RSSHCOOL_AWS_ACCESS_KEY_ID: 'key',
      RSSHCOOL_AWS_SECRET_ACCESS_KEY: 'secret',
      RSSHCOOL_AWS_REGION: 'eu-central-1',
    });

    expect(Array.isArray(result)).toBe(true);
    const [options, stream] = result as [unknown, unknown];
    expect(options).toEqual(BASE_OPTIONS);
    expect(stream).toEqual({ __stream: true });

    expect(cloudwatchStreamMock).toHaveBeenCalledTimes(1);
    expect(cloudwatchStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        interval: 2000,
        aws_access_key_id: 'key',
        aws_secret_access_key: 'secret',
        aws_region: 'eu-central-1',
        group: '/app/rsschool-api',
        stream: expect.stringMatching(/^\d{4}-\d{2}-\d{2}-nestjs$/),
      }),
    );
  });
});
