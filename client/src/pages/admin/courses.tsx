import { useRequest } from 'ahooks';
import { Button, Layout, Table } from 'antd';
import { CoursesApi, DisciplinesApi, DiscordServersApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { boolIconRenderer, dateUtcRenderer, stringSorter, stringTrimRenderer } from 'components/Table';
import { DEFAULT_COURSE_ICONS } from 'configs/course-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isCourseManager } from 'domain/user';
import { SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseModal } from 'modules/CourseManagement/components/CourseModal';
import { useContext, useState } from 'react';
import { Course, CourseRole } from 'services/models';
import { PublicSvgIcon } from '@client/components/Icons';

dayjs.extend(utc);

const disciplinesApi = new DisciplinesApi();
const discordServersService = new DiscordServersApi();
const courseApi = new CoursesApi();

function Page() {
  const session = useContext(SessionContext);

  const { courses: allCourses } = useActiveCourseContext();
  const [modalId, setModalId] = useState<number | null | undefined>();

  const response = useRequest(async () => {
    const [{ data: courses }, { data: discordServers }, { data: disciplines }] = await Promise.all([
      courseApi.getCourses(),
      discordServersService.getReducedDiscordServers(),
      disciplinesApi.getDisciplines(),
    ]);
    return {
      courses: courses.filter(course => isCourseManager(session, course.id)),
      discordServers,
      disciplines,
    };
  });

  return (
    <AdminPageLayout title="Manage Courses" loading={response.loading} courses={allCourses}>
      <Layout.Content style={{ margin: 8 }}>
        <Button type="primary" onClick={() => setModalId(null)}>
          Add Course
        </Button>
        <Table
          size="small"
          style={{ marginTop: 8 }}
          dataSource={response.data?.courses ?? []}
          pagination={{ pageSize: 100 }}
          rowKey="id"
          columns={getColumns((record: Course) => setModalId(record.id))}
        />
      </Layout.Content>
      {modalId !== undefined ? (
        <CourseModal
          onClose={() => setModalId(undefined)}
          discordServers={response.data?.discordServers ?? []}
          disciplines={response.data?.disciplines ?? []}
          courses={allCourses}
          courseId={modalId}
        />
      ) : null}
    </AdminPageLayout>
  );
}

function getColumns(handleEditItem: any) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      render: (logo: string) => <PublicSvgIcon size="25px" src={DEFAULT_COURSE_ICONS[logo]?.active} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<Course>('name'),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      sorter: stringSorter<Course>('fullName'),
      width: 200,
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      sorter: stringSorter<Course>('alias'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: stringTrimRenderer,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: dateUtcRenderer,
      width: 120,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      render: dateUtcRenderer,
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      render: boolIconRenderer,
    },
    {
      title: 'Planned',
      dataIndex: 'planned',
      render: boolIconRenderer,
    },
    {
      title: 'Invite Only',
      dataIndex: 'inviteOnly',
      render: boolIconRenderer,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: any) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <Page />
    </SessionProvider>
  );
}
