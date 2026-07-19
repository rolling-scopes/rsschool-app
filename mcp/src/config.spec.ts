import { describe, expect, it } from 'vitest';
import { readStdioConfig } from './config.js';

const BASE_ENV = { RSAPP_BASE_URL: 'https://app.rs.school', RSAPP_PAT: 'rsapp_pat_abc' };

describe('readStdioConfig', () => {
  it('reads config with defaults', () => {
    const config = readStdioConfig({ ...BASE_ENV });
    expect(config).toEqual({
      baseUrl: 'https://app.rs.school',
      token: 'rsapp_pat_abc',
      apiPrefix: '/api/v2',
      toolsets: undefined,
    });
  });

  it('honors RSAPP_API_PREFIX including empty string', () => {
    expect(readStdioConfig({ ...BASE_ENV, RSAPP_API_PREFIX: '' }).apiPrefix).toBe('');
  });

  it('parses RSAPP_TOOLSETS', () => {
    expect(readStdioConfig({ ...BASE_ENV, RSAPP_TOOLSETS: 'common,student' }).toolsets).toEqual(['common', 'student']);
  });

  it('fails fast without base URL or PAT', () => {
    expect(() => readStdioConfig({ RSAPP_PAT: 'rsapp_pat_abc' })).toThrow(/RSAPP_BASE_URL/);
    expect(() => readStdioConfig({ RSAPP_BASE_URL: 'x' })).toThrow(/RSAPP_PAT/);
  });

  it('rejects a PAT without the expected prefix', () => {
    expect(() => readStdioConfig({ RSAPP_BASE_URL: 'x', RSAPP_PAT: 'nope' })).toThrow(/rsapp_pat_/);
  });
});
