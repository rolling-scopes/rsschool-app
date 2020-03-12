import React from 'react';
import AlgoliaPlaces from 'algolia-places-react';
import { config } from '../config';
import { Location } from '../../../common/models/profile';

type Props = {
  onChange: Function;
  location: Location | null;
};

const { algoliaPlacesApiKey, algoliaPlacesAppId } = config;

const getDefaultValue = (location: Location | null): string =>
  location?.countryName ? `${location.cityName}, ${location.countryName}` : '';

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
        aroundLatLngViaIP: false,
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
