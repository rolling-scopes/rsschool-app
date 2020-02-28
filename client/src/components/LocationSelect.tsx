import React from 'react';
import AlgoliaPlaces from 'algolia-places-react';

type Props = {
  onChange: Function;
};

export function LocationSelect(props: Props) {
  return (
    <AlgoliaPlaces
      options={{
        appId: 'plYRMXVHA4VI',
        apiKey: 'c3457dc71fd196231949ed98db03f119',
        language: 'en',
        type: 'city',
      }}

      onChange={({suggestion}: any) => {
        props.onChange(suggestion.name + ', ' + suggestion.country);
      }}
      placeholder='Write an address here'
    />
  );
}
