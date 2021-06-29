import React from 'react';
import { Select, Spin } from 'antd';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { Location } from '../../../../common/models/profile';

type Props = {
  onChange: (arg: Location | null) => void;
  location: Location | null;
};

export function LocationSelect(props: Props) {
  const {
    value,
    suggestions: { data, loading },
    setValue,
  } = usePlacesAutocomplete({
    defaultValue: fromLocation(props.location),
    requestOptions: {
      types: ['(cities)'],
      debounce: 300,
    },
  });

  const handleInput = (value: string) => {
    setValue(value);
  };

  const handleSelect = (value: any) => {
    setValue(value, false);
    props.onChange(toLocation(value));
  };

  const handleBlur = () => {
    if (!value) {
      setValue(fromLocation(props.location), false);
    }
  };

  return (
    <Select
      filterOption={false}
      onSearch={handleInput}
      onSelect={handleSelect}
      showSearch
      onBlur={handleBlur}
      notFoundContent={loading ? <Spin size="small" /> : null}
      value={value}
      placeholder="Select users"
      options={data.map(({ description }) => ({ value: description }))}
    />
    // <AutoComplete
    //   value={value}

    //   onChange={handleInput}
    //   onSelect={handleSelect}
    //   options={data.map(({ description }) => description)}
    // />
  );
}

const toLocation = (value: string): Location => {
  const parts = value.split(', ');
  return {
    cityName: parts[0],
    countryName: parts[parts.length - 1],
  };
};

const fromLocation = (value: Location | null): string => {
  if (value) {
    return `${value.cityName}, ${value.countryName}`;
  }
  return '';
};
