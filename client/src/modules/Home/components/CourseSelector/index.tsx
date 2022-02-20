import { Select } from 'antd';
import { PlayCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import React, { CSSProperties } from 'react';
import { Course } from 'services/models';

type Props = {
  course: Course | null;
  onChangeCourse: (courseId: number) => void;
  courses: Course[];
};

export function CourseSelector(props: Props) {
  const { course, courses, onChangeCourse } = props;

  if (!course) {
    return null;
  }
  return (
    <Select
      showSearch
      optionFilterProp="children"
      style={{ width: 300, marginBottom: 16 }}
      defaultValue={course.id}
      onChange={onChangeCourse}
    >
      {courses.map(course => (
        <Select.Option style={getStatusCss(course)} key={course.id} value={course.id}>
          {getStatusIcon(course)} {course.name} {getStatus(course)}
        </Select.Option>
      ))}
    </Select>
  );
}

const getStatusIcon = (course: Course) => {
  if (course.completed) {
    return <CheckCircleTwoTone twoToneColor="#aaa" />;
  }
  return <PlayCircleTwoTone />;
};

const getStatus = (course: Course) => {
  if (course.completed) {
    return `(Archived)`;
  }
  return '';
};

const getStatusCss = (course: Course): CSSProperties => {
  if (course.completed) {
    return {
      color: '#999',
    };
  }
  return {};
};
