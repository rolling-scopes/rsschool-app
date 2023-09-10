import { Button, Row, Table, Checkbox, Popconfirm } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { StudentMentorModal } from 'components/StudentMentorModal';
import { boolIconRenderer, getColumnSearchProps, numberSorter, stringSorter, PersonCell } from 'components/Table';
import { useLoading } from 'components/useLoading';
import { useMemo, useState, useContext } from 'react';
import { CourseService } from 'services/course';
import { CourseRole } from 'services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from 'domain/user';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

function Page() {
  const session = useContext(SessionContext);
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;

  const [loading, withLoading] = useLoading(false);
  const [interviews, setInterviews] = useState([] as any[]);
  const [modal, setModal] = useState(false);
  const [noRegistration, setNoRegistration] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const courseManagerRole = useMemo(() => isCourseManager(session, courseId), [course, session]);

  const loadInterviews = async () => setInterviews(await courseService.getStageInterviews());

  const createInterviews = async () => {
    await courseService.createStageInterviews({ noRegistration });
    await loadInterviews();
  };

  const deleteInterview = withLoading(async (record: any) => {
    await courseService.deleteStageInterview(record.id);
    await loadInterviews();
  });

  useAsync(withLoading(loadInterviews), []);

  return (
    <AdminPageLayout loading={loading} title="Technical Screening" showCourseName courses={courses}>
      <Row style={{ marginBottom: 16 }} justify="space-between">
        {courseManagerRole ? (
          <div>
            <Checkbox checked={noRegistration} onChange={e => setNoRegistration(e.target.checked)}>
              No Registration
            </Checkbox>
            <Popconfirm
              onConfirm={() => createInterviews()}
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
        pagination={{ pageSize: 50 }}
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
              if (courseManagerRole) {
                return (
                  <Button type="link" onClick={() => deleteInterview(record)}>
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
        onOk={withLoading(async (studentGithubId, mentorGithubId) => {
          await courseService.createInterview(studentGithubId, mentorGithubId);
          await loadInterviews();
          setModal(false);
        })}
        onCancel={() => setModal(false)}
        visible={modal}
        courseId={course.id}
      />
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
