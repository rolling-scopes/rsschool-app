import * as React from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components';

type Person = { id: number; githubId: string; name: string; };

type Props = {
  [key: string]: any;
  searchFn: (value: string) => Promise<Person[]>;
  defaultValues?: Person[];
};

type State = {
  data: Person[];
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
      this.setState({ data: this.props.defaultValues || [] });
    }
  };

  componentDidUpdate = prevProps => {
    if (prevProps.defaultValues !== this.props.defaultValues) {
      this.setState({ data: this.props.defaultValues || [] });
    }
  };

  render() {
    return (
      <Select
        {...this.props}
        showSearch
        defaultValue={undefined}
        defaultActiveFirstOption={false}
        showArrow={this.props.defaultValues ? Boolean(this.props.defaultValues.length) : false}
        filterOption={false}
        onSearch={this.handleSearch}
        size="large"
        placeholder={this.props.defaultValues && this.props.defaultValues.length > 0 ? 'Select...' : 'Search...'}
        notFoundContent={null}
      >
        {this.state.data.map(person => (
          <Select.Option key={person.id} value={person.id}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.name} (
            {person.githubId})
          </Select.Option>
        ))}
      </Select>
    );
  }
}
