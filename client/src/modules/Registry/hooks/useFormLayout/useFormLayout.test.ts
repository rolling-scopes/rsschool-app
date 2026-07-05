import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// useFormLayout destructures antd's Grid.useBreakpoint at module-init, so the breakpoint map
// must be controlled at the module boundary. A hoisted holder lets each test pick the screen.
const { breakpoints } = vi.hoisted(() => ({ breakpoints: { value: {} as Record<string, boolean> } }));
vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof import('antd');
  return {
    ...actual,
    Grid: { ...actual.Grid, useBreakpoint: () => breakpoints.value },
  };
});

import { useFormLayout } from './useFormLayout';

describe('useFormLayout', () => {
  it('returns a horizontal layout on large screens', () => {
    breakpoints.value = { md: true, lg: true };
    const { result } = renderHook(() => useFormLayout());

    expect(result.current.formLayout).toBe('horizontal');
    expect(result.current.isSmallScreen).toBeFalsy();
  });

  it('returns a vertical layout when the screen is extra-small', () => {
    breakpoints.value = { xs: true };
    const { result } = renderHook(() => useFormLayout());

    expect(result.current.formLayout).toBe('vertical');
    expect(result.current.isSmallScreen).toBe(true);
  });

  it('treats a small-but-not-large screen (sm only) as a vertical layout', () => {
    // sm true with no md/lg/xl/xxl → isSmallScreen via `sm && !largeScreenSizes.some(Boolean)`.
    breakpoints.value = { sm: true };
    const { result } = renderHook(() => useFormLayout());

    expect(result.current.formLayout).toBe('vertical');
  });
});
