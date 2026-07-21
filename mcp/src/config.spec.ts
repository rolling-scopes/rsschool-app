import { describe, expect, it } from 'vitest';
import { readStdioConfig, readTimeoutMs } from './config.js';

const BASE_ENV = { RSAPP_BASE_URL: 'https://app.rs.school', RSAPP_PAT: 'rsapp_pat_abc' };

describe('readStdioConfig', () => {
  it('reads config with defaults', () => {
    const config = readStdioConfig({ ...BASE_ENV });
    expect(config).toEqual({
      baseUrl: 'https://app.rs.school',
      token: 'rsapp_pat_abc',
      apiPrefix: '/api/v2',
      timeoutMs: 15_000,
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

describe('readTimeoutMs', () => {
  it('falls back to the default when unset or blank', () => {
    expect(readTimeoutMs(undefined)).toBe(15_000);
    expect(readTimeoutMs('   ')).toBe(15_000);
  });

  it('parses a positive value', () => {
    expect(readTimeoutMs('2500')).toBe(2500);
  });

  it('honors an explicit fallback', () => {
    expect(readTimeoutMs(undefined, 42)).toBe(42);
  });

  it('rejects non-positive or non-numeric values', () => {
    expect(() => readTimeoutMs('0')).toThrow(/positive number/);
    expect(() => readTimeoutMs('-5')).toThrow(/positive number/);
    expect(() => readTimeoutMs('soon')).toThrow(/positive number/);
  });

  it('is used by readStdioConfig', () => {
    expect(readStdioConfig({ ...BASE_ENV, RSAPP_REQUEST_TIMEOUT_MS: '3000' }).timeoutMs).toBe(3000);
  });
});
