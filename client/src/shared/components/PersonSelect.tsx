import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from './GithubAvatar';
import get from 'lodash/get';
import { SelectProps } from 'antd/lib/select';

type Props = SelectProps<string> & {
  data: { id: number; githubId: string; name?: string }[];
  keyField?: 'id' | 'githubId';
  defaultValue?: string | number;
};

export class PersonSelect extends React.PureComponent<Props> {
  render() {
    const { data, keyField, defaultValue, ...other } = this.props;
    return (
      <Select showSearch optionFilterProp="children" defaultValue={defaultValue} placeholder="Select..." {...other}>
        {data.map(person => {
          const id = keyField ? get(person, keyField) : person.id;
          return (
            <Select.Option key={id} value={id}>
              <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
            </Select.Option>
          );
        })}
      </Select>
    );
  }
}

export { GithubAvatar } from './GithubAvatar';
