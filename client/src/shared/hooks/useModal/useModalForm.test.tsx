import { renderHook, act } from '@testing-library/react';
import { useModalForm } from './useModalForm';

describe('useModalForm', () => {
  it('handles create, open, close, and edit states', () => {
    const { result } = renderHook(() => useModalForm<{ id: number }>());
    expect(result.current.mode).toBe('create');
    expect(result.current.open).toBe(false);
    expect(result.current.formData).toBe(undefined);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(false);

    act(() => {
      result.current.toggle({ id: 1 });
    });
    expect(result.current.mode).toBe('edit');
    expect(result.current.formData).toEqual({ id: 1 });

    act(() => {
      result.current.toggle();
    });
    expect(result.current.mode).toBe('create');
    expect(result.current.formData).toBe(undefined);
  });
});
