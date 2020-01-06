import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { get } from 'lodash';

type Props = {
  [key: string]: any;
  data: { id: number; githubId: string; name?: string }[];
  keyField?: 'id' | 'githubId';
};

export class PersonSelect extends React.PureComponent<Props> {
  render() {
    const { data, ...other } = this.props;
    return (
      <Select
        showSearch
        optionFilterProp="children"
        defaultValue={undefined}
        placeholder="Select..."
        {...other}
      >
        {data.map(person => (
          <Select.Option key={person.id} value={this.props.keyField ? get(person, this.props.keyField) : person.id}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
          </Select.Option>
        ))}
      </Select>
    );
  }
}
