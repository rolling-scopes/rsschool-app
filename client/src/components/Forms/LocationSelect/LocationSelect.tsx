import React from 'react';
import { Alert, Select, Spin } from 'antd';
import { Location } from '@common/models/profile';
import { useGoogleMapsPlaces } from './useGoogleMapsPlaces';

type Props = {
  onChange: (arg: Location | null) => void;
  location: Location | null;
  style?: React.CSSProperties;
};

export function LocationSelect(props: Props) {
  const { value, data, loading, setValue, initialized, error } = useGoogleMapsPlaces(props.location);

  const handleInput = (value: string) => setValue(value);

  const handleSelect = (value: string) => {
    setValue(value, false);
    props.onChange(toLocation(value));
  };

  const handleBlur = () => {
    if (!value) {
      setValue(fromLocation(props.location), false);
    }
  };

  if (error) {
    return <Alert message={error.message} type="error" showIcon />;
  }

  if (!initialized) {
    return <Spin size="small" />;
  }

  return (
    <Select
      filterOption={false}
      onSearch={handleInput}
      onSelect={handleSelect}
      showSearch
      onBlur={handleBlur}
      notFoundContent={loading ? <Spin size="small" /> : null}
      value={value}
      placeholder="Select city"
      options={data.map(({ description }) => ({ value: description }))}
      style={props.style}
    />
  );
}

const toLocation = (value: string): Location => {
  const parts = value.split(', ');
  return {
    cityName: parts[0] ?? '',
    countryName: parts[parts.length - 1] ?? '',
  };
};

const fromLocation = (value: Location | null): string => {
  if (value) {
    return `${value.cityName}, ${value.countryName}`;
  }
  return '';
};
