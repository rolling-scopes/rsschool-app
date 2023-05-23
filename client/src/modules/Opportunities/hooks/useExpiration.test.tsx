import { renderHook } from '@testing-library/react';
import { ExpirationState } from '../constants';
import { useExpiration } from './useExpiration';

const mockCurrentTime = 1664564110455;

describe('useExpiration', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(mockCurrentTime);
  });

  it('should correctly return NotExpired status', () => {
    const addition = 30 * 24 * 60 * 60 * 1000;
    const mockExpiresIn30Days = String(mockCurrentTime + addition);
    const { result } = renderHook(() => useExpiration(mockExpiresIn30Days));
    expect(result.current).toStrictEqual({
      expirationDateFormatted: '2022-10-30',
      expirationState: ExpirationState.NotExpired,
    });
  });

  it('should correctly return NearlyExpired status', () => {
    const addition = 1 * 24 * 60 * 60 * 1000;
    const mockExpiresIn1Day = String(mockCurrentTime + addition);
    const { result } = renderHook(() => useExpiration(mockExpiresIn1Day));
    expect(result.current).toStrictEqual({
      expirationDateFormatted: '2022-10-01',
      expirationState: ExpirationState.NearlyExpired,
    });
  });

  it('should correctly return Expired status', () => {
    const addition = 1 * 24 * 60 * 60 * 1000;
    const mockExpiresIn1DayBefore = String(mockCurrentTime - addition);
    const { result } = renderHook(() => useExpiration(mockExpiresIn1DayBefore));
    expect(result.current).toStrictEqual({
      expirationDateFormatted: '2022-09-29',
      expirationState: ExpirationState.Expired,
    });
  });
});
