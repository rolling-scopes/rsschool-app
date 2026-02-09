import { useRef, useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { useInterval } from 'ahooks';
import { Location } from '@common/models/profile';

const MAX_POLLING_TIME_MS = 30_000;
const POLLING_INTERVAL_MS = 100;

/**
 * Hook to use Google Maps Places API for location autocomplete
 */
export function useGoogleMapsPlaces(location: Location | null) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const elapsedRef = useRef(0);

  const {
    value,
    suggestions: { data, loading },
    setValue,
    init,
  } = usePlacesAutocomplete({
    defaultValue: fromLocation(location),
    requestOptions: {
      types: ['(cities)'],
      debounce: 300,
    },
    initOnMount: false,
  });

  /**
   * Poll until Google Maps API is loaded or 10 seconds have passed
   */
  const stopPolling = useInterval(() => {
    elapsedRef.current += POLLING_INTERVAL_MS;

    if ('google' in window) {
      setInitialized(true);
      init();
      stopPolling();
    } else if (elapsedRef.current >= MAX_POLLING_TIME_MS) {
      stopPolling();
      setError(new Error('Google Maps API is not loaded'));
    }
  }, POLLING_INTERVAL_MS);

  return { value, data, loading, setValue, initialized, error };
}

const fromLocation = (value: Location | null): string => {
  if (value) {
    return `${value.cityName}, ${value.countryName}`;
  }
  return '';
};
