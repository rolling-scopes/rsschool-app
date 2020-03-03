import React from 'react';
import AlgoliaPlaces from 'algolia-places-react';

export type Location = {
  cityName: string;
  countryName: string;
}

type Props = {
  onChange: Function;
  location: Location;
};

const getDefaultValue = (location: Location ): string => location && location.countryName !== null
  ? `${location.countryName}, ${location.cityName}`
  : '';


export function LocationSelect(props: Props) {

  const discardLocation = () => {
    props.onChange(null);
  }

  return (
    <AlgoliaPlaces
      options={{
        appId: 'plYRMXVHA4VI',
        apiKey: 'c3457dc71fd196231949ed98db03f119',
        language: 'en',
        type: 'city',
      }}

      defaultValue={getDefaultValue(props.location)}

      onSuggestions={discardLocation}
      onClear={discardLocation}

      onChange={({suggestion}: any) => {
        const location = {
          countryName: suggestion.country,
          cityName: suggestion.name
        } as Location;
        props.onChange(location);
      }}

      placeholder='Write an address here'
    />
  );
}
