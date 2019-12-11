import * as React from 'react';
import { Select } from 'antd';
import { get } from 'lodash';
import { GithubAvatar } from 'components';
import { CourseService } from 'services/course';

type Person = { id: number; githubId: string; name: string };

type Props = {
  [key: string]: any;
  defaultValues?: Person[];
  courseId: number;
  keyField?: 'id' | 'githubId';
};

type State = {
  data: Person[];
};

export class StudentSearch extends React.Component<Props, State> {
  state: State = { data: [] };

  courseService = new CourseService();

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
        style={{ width: '100%' }}
      >
        {this.state.data.map(person => (
          <Select.Option key={person.id} value={this.props.keyField ? get(person, this.props.keyField) : person.id}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
          </Select.Option>
        ))}
      </Select>
    );
  }

  private searchStudents = async (searchText: string) => {
    return this.courseService.searchCourseStudent(this.props.courseId, searchText);
  };

  private handleSearch = async (value: string) => {
    if (value) {
      const data = await this.searchStudents(value);
      this.setState({ data });
    } else {
      this.setState({ data: this.props.defaultValues || [] });
    }
  };
}
