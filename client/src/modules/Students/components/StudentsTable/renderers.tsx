import { Space, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseDto, UserStudentCourseDto, UserStudentDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { getColumnSearchProps } from 'components/Table';

export enum ColumnKey {
  student = 'student',
  onGoingCourses = 'onGoingCourses',
  previousCourses = 'previousCourses',
  country = 'country',
  city = 'city',
}

enum ColumnName {
  student = 'student',
  onGoingCourses = 'Ongoing Courses',
  previousCourses = 'Previous Courses',
  country = 'Country',
  city = 'City',
}

const getSearchProps = (key: string) => ({
  ...getColumnSearchProps(key),
  onFilter: undefined,
});

const coursesRenderer = (courses: UserStudentCourseDto[]) => {
  const visibleCourses = courses.slice(0, 3);
  const hiddenCourses = courses.slice(3);
  const hiddenCoursesCount = hiddenCourses.length;
  const hasCertifiedHiddenCourse = hiddenCourses.some(course => course.hasCertificate);

  return (
    <Space wrap size="small">
      {visibleCourses.map(course => (
        <Tag color={course.hasCertificate ? 'green' : undefined} key={course.alias}>
          {course.alias}
        </Tag>
      ))}
      {hiddenCoursesCount > 0 && (
        <Tooltip
          title={
            <Space wrap>
              {hiddenCourses.map(course => (
                <Tag color={course.hasCertificate ? 'green' : undefined} key={course.alias}>
                  {course.alias}
                </Tag>
              ))}
            </Space>
          }
          color="#fff"
        >
          <Tag color={hasCertifiedHiddenCourse ? 'green' : undefined}>+{hiddenCoursesCount} more</Tag>
        </Tooltip>
      )}
    </Space>
  );
};

export const getColumns = (courses: CourseDto[]): ColumnsType<UserStudentDto> => [
  {
    key: ColumnKey.student,
    title: ColumnName.student,
    dataIndex: ColumnKey.student,
    width: 200,
    render: (_v, record) => <GithubUserLink value={record.githubId} fullName={record.fullName} />,
    ...getSearchProps(ColumnKey.student),
  },
  {
    title: ColumnName.onGoingCourses,
    dataIndex: ColumnKey.onGoingCourses,
    width: 400,
    render: coursesRenderer,
    filters: courses.filter(course => !course.completed).map(course => ({ text: course.alias, value: course.id })),
  },
  {
    title: ColumnName.previousCourses,
    dataIndex: ColumnKey.previousCourses,
    render: coursesRenderer,
    filters: courses.filter(course => course.completed).map(course => ({ text: course.alias, value: course.id })),
  },
  {
    title: ColumnName.country,
    dataIndex: ColumnKey.country,
    width: 200,
    ...getSearchProps(ColumnKey.country),
  },
  {
    title: ColumnName.city,
    dataIndex: ColumnKey.city,
    width: 200,
    ...getSearchProps(ColumnKey.city),
  },
];
