import { AutoComplete } from 'antd';
import * as React from 'react';

import { GithubAvatar } from 'components';
import { CourseService } from 'services/course';
import { StudentBasic } from './../../../common/models';
import { SelectValue } from 'antd/lib/select';

const { Option } = AutoComplete;
const MIN_QUERY_LENGTH = 3;

type State = {
  students: StudentBasic[];
  filteredStudents: string[];
  studentQuery: string;
};

type Props = {
  courseId: number;
  onStudentSelect: (student?: StudentBasic) => void;
};

function renderStudentOption(githubId: string) {
  return (
    <Option key={githubId} title={githubId}>
      <div className="d-flex flex-row">
        <GithubAvatar githubId={githubId} size={24} />
        &nbsp;
        {githubId}
      </div>
    </Option>
  );
}

class StudentsAutocomplete extends React.PureComponent<Props, State> {
  state: State = {
    students: [],
    filteredStudents: [],
    studentQuery: '',
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.courseId);
  }

  async componentDidMount() {
    const students = await this.courseService.getCourseStudents(true);

    this.setState({ students: students.filter((student: StudentBasic) => student.isActive) });
  }

  handleStudentSearch = (query: string) => {
    if (query.length >= MIN_QUERY_LENGTH) {
      this.setState({
        filteredStudents: this.state.students
          .filter((student: StudentBasic) => student.githubId.includes(query))
          .map((student: StudentBasic) => student.githubId),
      });
    }
  };

  handleStudentInputChange = (query: any) => {
    this.setState({ studentQuery: query });
  };

  handleStudentSelect = (_: SelectValue, { key }: any) => {
    this.props.onStudentSelect(this.state.students.find((student: StudentBasic) => student.githubId === key));
  };

  render() {
    const { filteredStudents, studentQuery } = this.state;

    return (
      <AutoComplete
        className="global-search"
        size="large"
        style={{ width: '100%' }}
        value={studentQuery}
        dataSource={filteredStudents.map(renderStudentOption)}
        onChange={this.handleStudentInputChange}
        onSelect={this.handleStudentSelect}
        onSearch={this.handleStudentSearch}
        placeholder="Student Github"
        optionLabelProp="title"
      />
    );
  }
}

export { StudentsAutocomplete };
