import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';

type Person = { id: number; githubId: string; firstName: string; lastName: string };

type Props = {
  [key: string]: any;
  searchFn: (value: string) => Promise<Person[]>;
  person?: { id: number; githubId: string; firstName: string; lastName: string } | null;
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
        defaultValue={this.props.person ? this.props.person.id : undefined}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        size="large"
        placeholder="Search..."
        notFoundContent={null}
      >
        {
          this.props.person && this.state.data.length === 0
            ? (
              <Select.Option key={this.props.person.id} value={this.props.person.id}>
                <GithubAvatar
                  size={24}
                  githubId={this.props.person.githubId}
                /> {this.props.person.firstName} {this.props.person.lastName} (
                {this.props.person.githubId})
              </Select.Option>
            )
            : ''
        }
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
