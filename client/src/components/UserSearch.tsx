import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';

type Person = { id: number; githubId: string; firstName: string; lastName: string };

type Props = {
  [key: string]: any;
  searchFn: (value: string) => Promise<Person[]>;
};

type State = {
  data: { id: number; githubId: string; firstName: string; lastName: string }[];
};

export class UserSearch extends React.Component<Props, State> {
  state: State = {
    data: [],
  };

  handleSearch = async (value: string) => {
    if (value) {
      const data = await this.props.searchFn(value);
      this.setState({ data });
    } else {
      this.setState({ data: [] });
    }
  };

  render() {
    return (
      <Select
        {...this.props}
        showSearch
        defaultValue={undefined}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        size="large"
        placeholder="Search..."
        notFoundContent={null}
      >
        {this.state.data.map(person => (
          <Select.Option key={person.id} value={person.id}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.firstName} {person.lastName} (
            {person.githubId})
          </Select.Option>
        ))}
      </Select>
    );
  }
}
