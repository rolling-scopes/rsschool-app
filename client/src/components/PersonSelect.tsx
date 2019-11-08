import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';

type Props = {
  [key: string]: any;
  data: { id: number; githubId: string; name?: string }[];
};

export class PersonSelect extends React.PureComponent<Props> {
  render() {
    const { data, ...other } = this.props;
    return (
      <Select
        showSearch
        optionFilterProp="children"
        defaultValue={undefined}
        size="large"
        placeholder="Select..."
        {...other}
      >
        {data.map(person => (
          <Select.Option key={person.id} value={person.id}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
          </Select.Option>
        ))}
      </Select>
    );
  }
}
