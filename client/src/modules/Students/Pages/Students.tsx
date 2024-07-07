import { TablePaginationConfig, message } from 'antd';
import { FilterValue } from 'antd/es/table/interface';
import { StudentsApi, UserStudentDto } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { AdminPageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { useState } from 'react';
import { useAsync } from 'react-use';
import StudentsTable from '../components/StudentsTable';
import { ColumnKey } from '../components/StudentsTable/renderers';
import { PageProps } from './getServerSideProps';

const studentsApi = new StudentsApi();

type StudentsState = {
  content: UserStudentDto[];
  pagination: IPaginationInfo;
};

export const Students = ({ courses }: PageProps) => {
  const [students, setStudents] = useState<StudentsState>({
    content: [],
    pagination: { current: 1, pageSize: 20 },
  });

  const [loading, withLoading] = useLoading(false);

  const getStudents = withLoading(
    async (pagination: TablePaginationConfig, filters?: Record<ColumnKey, FilterValue | null>) => {
      try {
        const { student, country, city, onGoingCourses, previousCourses } = filters || {};
        const { data } = await studentsApi.getUserStudents(
          String(pagination.current),
          String(pagination.pageSize),
          student?.toString(),
          country?.toString(),
          city?.toString(),
          onGoingCourses?.toString(),
          previousCourses?.toString(),
        );
        setStudents({ ...students, ...data });
      } catch (error) {
        message.error('Failed to load students list. Please try again.');
      }
    },
  );

  useAsync(async () => await getStudents(students.pagination), []);

  return (
    <AdminPageLayout loading={loading} title="Students List" courses={courses}>
      <StudentsTable
        handleChange={getStudents}
        loading={loading}
        content={students.content}
        pagination={students.pagination}
        courses={courses}
      />
    </AdminPageLayout>
  );
};
