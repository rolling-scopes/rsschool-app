import { renderHook, act } from '@testing-library/react';
import { useGoogleMapsPlaces } from './useGoogleMapsPlaces';
import * as usePlacesAutocompleteModule from 'use-places-autocomplete';
import { useInterval } from 'ahooks';
import { Location } from '@common/models/profile';

jest.mock('use-places-autocomplete');
jest.mock('ahooks');

describe('useGoogleMapsPlaces', () => {
  const mockInit = jest.fn();
  const mockSetValue = jest.fn();
  const mockStopPolling = jest.fn();
  const usePlacesAutocompleteMock = usePlacesAutocompleteModule.default as jest.Mock;
  const useIntervalMock = useInterval as jest.Mock;

  const defaultAutocompleteState = {
    value: '',
    suggestions: { data: [], loading: false },
    setValue: mockSetValue,
    init: mockInit,
  };

  const renderUseGoogleMapsPlaces = (location: Location | null = null) =>
    renderHook(() => useGoogleMapsPlaces(location));

  const setupPollingCallback = () => {
    let pollCallback: (() => void) | null = null;

    useIntervalMock.mockImplementation((callback: () => void, interval: number | null) => {
      if (interval !== null) {
        pollCallback = callback;
      }
      return mockStopPolling;
    });

    return () => pollCallback?.();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usePlacesAutocompleteMock.mockReturnValue(defaultAutocompleteState);
    useIntervalMock.mockReturnValue(mockStopPolling);
    delete (window as unknown as { google?: unknown }).google;
    delete (Window.prototype as { google?: unknown }).google;
  });

  it('returns default state when location is null', () => {
    const { result } = renderUseGoogleMapsPlaces();

    expect(result.current.value).toBe('');
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.initialized).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('location formatting', () => {
    it.each([
      { location: null, expected: '' },
      { location: { cityName: 'Minsk', countryName: 'Belarus' } as Location, expected: 'Minsk, Belarus' },
      { location: { cityName: 'São Paulo', countryName: 'Brazil' } as Location, expected: 'São Paulo, Brazil' },
    ])('uses "$expected" as the autocomplete default value', ({ location, expected }) => {
      renderUseGoogleMapsPlaces(location);

      expect(usePlacesAutocompleteModule.default).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValue: expected,
          requestOptions: {
            types: ['(cities)'],
            debounce: 300,
          },
          initOnMount: false,
        }),
      );
    });
  });

  describe('Google Maps API polling', () => {
    it('initializes and stops polling when Google Maps API is loaded', async () => {
      const triggerPoll = setupPollingCallback();
      Object.defineProperty(window, 'google', {
        configurable: true,
        writable: true,
        value: {},
      });

      const { result } = renderUseGoogleMapsPlaces();

      await act(async () => triggerPoll());

      expect(result.current.initialized).toBe(true);
      expect(mockInit).toHaveBeenCalled();
      expect(mockStopPolling).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('sets an error and stops polling when Google Maps API is not loaded', async () => {
      const triggerPoll = setupPollingCallback();
      expect('google' in window).toBe(false);
      const { result } = renderUseGoogleMapsPlaces();

      await act(async () => {
        for (let attempts = 0; attempts < 500; attempts += 1) {
          triggerPoll();
        }
      });

      expect(mockStopPolling).toHaveBeenCalled();
      expect(mockInit).not.toHaveBeenCalled();
      expect(result.current.initialized).toBe(false);
      expect(result.current.error?.message).toBe('Google Maps API is not loaded');
    });
  });

  describe('autocomplete values', () => {
    it('returns values provided by usePlacesAutocomplete', () => {
      const data = [{ description: 'Minsk, Belarus' }, { description: 'Munich, Germany' }];

      usePlacesAutocompleteMock.mockReturnValue({
        ...defaultAutocompleteState,
        value: 'M',
        suggestions: { data, loading: true },
      });

      const { result } = renderUseGoogleMapsPlaces();

      expect(result.current.value).toBe('M');
      expect(result.current.data).toEqual(data);
      expect(result.current.loading).toBe(true);
      expect(result.current.setValue).toBe(mockSetValue);
    });

    it('forwards setValue calls', () => {
      const { result } = renderUseGoogleMapsPlaces();

      act(() => {
        result.current.setValue('New York');
      });

      expect(mockSetValue).toHaveBeenCalledWith('New York');
    });
  });

  it('uses 100ms polling interval', () => {
    renderUseGoogleMapsPlaces();

    expect(useInterval).toHaveBeenCalledWith(expect.any(Function), 100);
  });
});
