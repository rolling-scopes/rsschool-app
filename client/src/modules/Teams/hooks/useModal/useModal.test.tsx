import { renderHook, act } from '@testing-library/react-hooks';
import { useModal } from './useModal';

describe('useModal', () => {
  it('should return the correct initial state', () => {
    const { result } = renderHook(() => useModal<{ id: number }>());
    expect(result.current.mode).toBe('create');
    expect(result.current.open).toBe(false);
    expect(result.current.formData).toBe(undefined);
  });

  it('should toggle the modal when toggle is called', () => {
    const { result } = renderHook(() => useModal<{ id: number }>());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(false);
  });

  it('should set the mode to "edit" and form data when toggle is called with data', () => {
    const { result } = renderHook(() => useModal<{ id: number }>());
    act(() => {
      result.current.toggle({ id: 1 });
    });
    expect(result.current.mode).toBe('edit');
    expect(result.current.formData).toEqual({ id: 1 });
  });

  it('should set the mode to "create" and form data to null when toggle is called without data', () => {
    const { result } = renderHook(() => useModal<{ id: number }>());
    act(() => {
      result.current.toggle({ id: 1 });
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current.mode).toBe('create');
    expect(result.current.formData).toBe(undefined);
  });
});
