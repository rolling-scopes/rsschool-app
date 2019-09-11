import * as React from 'react';
import { Select } from 'antd';
import { CITIES } from 'services/reference-data';

type Props = {
  [key: string]: any;
};

type LocationOption = { id?: string; name: string };
const defaultOption: LocationOption = { id: undefined, name: 'Other' };
const options: LocationOption[] = [defaultOption].concat(CITIES);

export class LocationSelect extends React.PureComponent<Props> {
  render() {
    return (
      <Select labelInValue showSearch optionFilterProp="children" placeholder="Select..." {...this.props}>
        {options.map((location, i) => (
          <Select.Option key={location.id || i} value={location.id}>
            {location.name}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
