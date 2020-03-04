import React from 'react';
import AlgoliaPlaces from 'algolia-places-react';
import { config } from '../config';

export type Location = {
  cityName: string;
  countryName: string;
};

type Props = {
  onChange: Function;
  location: Location | null;
};

const { algoliaPlacesApiKey, algoliaPlacesAppId } = config;

const getDefaultValue = (location: Location | null): string =>
  location?.countryName ? `${location.countryName}, ${location.cityName}` : '';

export function LocationSelect(props: Props) {
  const discardLocation = () => {
    props.onChange(null);
  };

  return (
    <AlgoliaPlaces
      options={{
        appId: algoliaPlacesAppId,
        apiKey: algoliaPlacesApiKey,
        language: 'en',
        type: 'city',
      }}
      defaultValue={getDefaultValue(props.location)}
      onSuggestions={discardLocation}
      onClear={discardLocation}
      onChange={({ suggestion }: any) => {
        const location = {
          countryName: suggestion.country,
          cityName: suggestion.name,
        } as Location;
        props.onChange(location);
      }}
      placeholder="Please enter your city"
    />
  );
}
