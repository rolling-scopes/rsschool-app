import { Select } from 'antd';
import React, { CSSProperties } from 'react';
import { Course } from 'services/models';
import { CourseIcon } from 'components/Icons/CourseIcon';

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
      {[...courses]
        .sort((a, b) => Number(a.completed) - Number(b.completed))
        .map(course => (
          <Select.Option style={getStatusCss(course)} key={course.id} value={course.id}>
            <CourseIcon course={course} /> {course.name} {getStatus(course)}
          </Select.Option>
        ))}
    </Select>
  );
}

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
