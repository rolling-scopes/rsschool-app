import { act, renderHook, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { useVerificationsAnswers } from './useVerificationsAnswers';

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

const { getAnswers } = vi.hoisted(() => ({ getAnswers: vi.fn() }));
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockApi() {}
  MockApi.prototype.getAnswers = getAnswers;
  return { ...actual, CourseTaskVerificationsApi: MockApi };
});

describe('useVerificationsAnswers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with no answers and not loading', () => {
    const { result } = renderHook(() => useVerificationsAnswers(1, 2));

    expect(result.current.answers).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads and stores the answers returned by the API', async () => {
    const answers = [{ index: 0, value: 1 }];
    getAnswers.mockResolvedValueOnce({ data: answers });
    const { result } = renderHook(() => useVerificationsAnswers(10, 20));

    await act(async () => {
      await result.current.showAnswers();
    });

    expect(getAnswers).toHaveBeenCalledWith(10, 20);
    await waitFor(() => expect(result.current.answers).toEqual(answers));
  });

  it('clears the answers when hideAnswers is called', async () => {
    getAnswers.mockResolvedValueOnce({ data: [{ index: 0, value: 1 }] });
    const { result } = renderHook(() => useVerificationsAnswers(1, 2));

    await act(async () => {
      await result.current.showAnswers();
    });
    await waitFor(() => expect(result.current.answers).not.toBeNull());

    act(() => result.current.hideAnswers());
    expect(result.current.answers).toBeNull();
  });

  it('shows the server message on an API error response', async () => {
    getAnswers.mockRejectedValueOnce({ response: { data: { message: 'Not allowed' } } });
    const { result } = renderHook(() => useVerificationsAnswers(1, 2));

    await act(async () => {
      await result.current.showAnswers();
    });

    expect(message.error).toHaveBeenCalledWith('Not allowed');
    expect(result.current.answers).toBeNull();
  });

  it('falls back to the error message when no response payload is present', async () => {
    getAnswers.mockRejectedValueOnce({ message: 'Network down' });
    const { result } = renderHook(() => useVerificationsAnswers(1, 2));

    await act(async () => {
      await result.current.showAnswers();
    });

    expect(message.error).toHaveBeenCalledWith('Network down');
  });
});
