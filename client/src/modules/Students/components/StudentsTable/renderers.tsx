import { Space, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseDto, UserStudentCourseDto, UserStudentDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { getColumnSearchProps } from 'components/Table';

export enum ColumnKey {
  Student = 'student',
  OnGoingCourses = 'onGoingCourses',
  PreviousCourses = 'previousCourses',
  Country = 'country',
  City = 'city',
}

enum ColumnName {
  Student = 'Student',
  OnGoingCourses = 'Ongoing Courses',
  PreviousCourses = 'Previous Courses',
  Country = 'Country',
  City = 'City',
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
    key: ColumnKey.Student,
    title: ColumnName.Student,
    dataIndex: ColumnKey.Student,
    width: 200,
    render: (_v, record) => <GithubUserLink value={record.githubId} fullName={record.fullName} />,
    ...getSearchProps(ColumnKey.Student),
  },
  {
    title: ColumnName.OnGoingCourses,
    dataIndex: ColumnKey.OnGoingCourses,
    width: 400,
    render: coursesRenderer,
    filters: courses.filter(course => !course.completed).map(course => ({ text: course.alias, value: course.id })),
  },
  {
    title: ColumnName.PreviousCourses,
    dataIndex: ColumnKey.PreviousCourses,
    render: coursesRenderer,
    filters: courses.filter(course => course.completed).map(course => ({ text: course.alias, value: course.id })),
  },
  {
    title: ColumnName.Country,
    dataIndex: ColumnKey.Country,
    width: 200,
    ...getSearchProps(ColumnKey.Country),
  },
  {
    title: ColumnName.City,
    dataIndex: ColumnKey.City,
    width: 200,
    ...getSearchProps(ColumnKey.City),
  },
];
