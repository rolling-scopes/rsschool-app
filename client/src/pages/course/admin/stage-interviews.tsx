import { Button, message, Row, Table, Checkbox, Popconfirm } from 'antd';
import { useRequest } from 'ahooks';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { StudentMentorModal } from '@client/shared/components/StudentMentorModal';
import {
  boolIconRenderer,
  getColumnSearchProps,
  numberSorter,
  stringSorter,
  PersonCell,
} from '@client/shared/components/Table';
import { useMemo, useState, useContext } from 'react';
import { CourseService } from '@client/services/course';
import { CourseRole } from '@client/services/models';
import { isCourseManager, isCourseSupervisor } from '@client/domain/user';
import { SessionContext, SessionProvider, useActiveCourseContext } from '@client/modules/Course/contexts';

function Page() {
  const session = useContext(SessionContext);
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;

  const [interviews, setInterviews] = useState([] as any[]);
  const [modal, setModal] = useState(false);
  const [noRegistration, setNoRegistration] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const courseManagerRole = useMemo(() => isCourseManager(session, courseId), [course, session]);
  const courseSupervisorRole = useMemo(() => isCourseSupervisor(session, courseId), [course, session]);

  const loadInterviews = async () => courseService.getStageInterviews();

  const deleteInterviewRequest = useRequest(
    async (record: any) => {
      await courseService.deleteStageInterview(record.id);
    },
    {
      manual: true,
      onSuccess: () => loadInterviewsRequest.runAsync(),
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );
  const loadInterviewsRequest = useRequest(loadInterviews, {
    onError: () => {
      message.error('An unexpected error occurred. Please try later.');
    },
    onSuccess: data => setInterviews(data),
  });
  const createInterviewRequest = useRequest(
    async (studentGithubId: string, mentorGithubId: string) => {
      await courseService.createInterview(studentGithubId, mentorGithubId);
      setModal(false);
    },
    {
      manual: true,
      onSuccess: () => loadInterviewsRequest.runAsync(),
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );
  const createInterviewsRequest = useRequest(
    async () => {
      await courseService.createStageInterviews({ noRegistration });
    },
    {
      manual: true,
      onSuccess: () => loadInterviewsRequest.runAsync(),
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );
  const loading =
    deleteInterviewRequest.loading ||
    loadInterviewsRequest.loading ||
    createInterviewRequest.loading ||
    createInterviewsRequest.loading;

  return (
    <AdminPageLayout loading={loading} title="Technical Screening" showCourseName courses={courses}>
      <Row style={{ marginBottom: 16 }} justify="space-between">
        {courseManagerRole ? (
          <div>
            <Checkbox checked={noRegistration} onChange={e => setNoRegistration(e.target.checked)}>
              No Registration
            </Checkbox>
            <Popconfirm
              onConfirm={() => createInterviewsRequest.runAsync()}
              title="Do you want to create interview pairs for not distributed students?"
            >
              <Button>Create Interview Pairs</Button>
            </Popconfirm>
          </div>
        ) : null}
        <Button type="primary" onClick={() => setModal(true)}>
          Create interview
        </Button>
      </Row>

      <Table
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} interviews`,
        }}
        size="small"
        rowKey="id"
        dataSource={interviews}
        columns={[
          {
            fixed: 'left',
            title: 'Interviewer',
            dataIndex: 'interviewer',
            sorter: stringSorter('interviewer.githubId'),
            render: value => <PersonCell value={value} showCountry={true} />,
            ...getColumnSearchProps('interviewer.githubId'),
          },
          {
            title: 'Student',
            dataIndex: 'student',
            sorter: stringSorter('student.githubId'),
            render: value => <PersonCell value={value} showCountry={true} />,
            ...getColumnSearchProps('student.githubId'),
          },
          {
            title: 'Preference',
            dataIndex: ['interviewer', 'preference'],
            sorter: stringSorter('interviewer.preference'),
            width: 80,
          },
          {
            title: 'Student Score',
            dataIndex: ['student', 'totalScore'],
            sorter: numberSorter('student.totalScore'),
            width: 80,
          },
          {
            title: 'Completed',
            dataIndex: 'completed',
            sorter: stringSorter('completed'),
            render: boolIconRenderer,
            width: 80,
          },
          {
            fixed: 'right',
            title: 'Actions',
            dataIndex: 'actions',
            width: 80,
            render: (_, record) => {
              if (courseManagerRole || courseSupervisorRole) {
                return (
                  <Button type="link" onClick={() => deleteInterviewRequest.runAsync(record)}>
                    Cancel
                  </Button>
                );
              }
              return null;
            },
          },
        ]}
      />

      <StudentMentorModal
        onOk={createInterviewRequest.runAsync}
        onCancel={() => setModal(false)}
        visible={modal}
        courseId={course.id}
      />
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>
      <Page />
    </SessionProvider>
  );
}
