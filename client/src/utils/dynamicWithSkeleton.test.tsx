import { isValidElement } from 'react';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { dynamicWithSkeleton } from './dynamicWithSkeleton';

vi.mock('next/dynamic', () => ({
  default: vi.fn((importFn, options) => {
    const Stub = () => <div data-testid="dynamic-stub" />;
    // expose what dynamic was called with for assertions
    (Stub as unknown as { __importFn: unknown }).__importFn = importFn;
    (Stub as unknown as { __options: unknown }).__options = options;
    return Stub;
  }),
}));

describe('dynamicWithSkeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next/dynamic with the import function and ssr disabled', () => {
    const importFn = vi.fn();
    dynamicWithSkeleton(importFn);

    expect(dynamic).toHaveBeenCalledTimes(1);
    const [passedImportFn, options] = vi.mocked(dynamic).mock.calls[0];
    expect(passedImportFn).toBe(importFn);
    expect(options).toMatchObject({ ssr: false });
    expect(typeof options?.loading).toBe('function');
  });

  it('returns the component produced by next/dynamic', () => {
    const Component = dynamicWithSkeleton(vi.fn());
    expect(typeof Component).toBe('function');
  });

  it('uses an active antd Skeleton as the loading fallback', () => {
    dynamicWithSkeleton(vi.fn());
    const [, options] = vi.mocked(dynamic).mock.calls[0];
    const Loading = options?.loading as () => JSX.Element;

    const element = Loading();
    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(Skeleton);
    expect((element.props as { active?: boolean }).active).toBe(true);
  });
});
