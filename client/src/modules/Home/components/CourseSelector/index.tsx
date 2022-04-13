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
    return course.courseArchivedLogoUrl ? (
      <Logo url={course.courseArchivedLogoUrl} />
    ) : (
      <CheckCircleTwoTone twoToneColor="#aaa" />
    );
  }
  return course.courseActiveLogoUrl ? <Logo url={course.courseActiveLogoUrl} /> : <PlayCircleTwoTone />;
};

function Logo({ url }: { url: string }) {
  return (
    <>
      <img width={14} height={14} src={url} className="img" />
      <style jsx>{`
        .img {
          vertical-align: -0.125em;
        }
      `}</style>
    </>
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
