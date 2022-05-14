import { Button, Row, Table, Modal, Checkbox } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { withSession } from 'components/withSession';
import { StudentMentorModal } from 'components/StudentMentorModal';
import { boolIconRenderer, getColumnSearchProps, numberSorter, stringSorter, PersonCell } from 'components/Table';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from 'domain/user';

function Page(props: CoursePageProps) {
  const { session, course } = props;
  const courseId = course.id;

  const [loading, withLoading] = useLoading(false);
  const [interviews, setInterviews] = useState([] as any[]);
  const [modal, setModal] = useState(false);
  const [noRegistration, setNoRegistration] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const courseManagerRole = useMemo(() => isCourseManager(props.session, courseId), [course, session]);

  const loadInterviews = async () => setInterviews(await courseService.getStageInterviews());

  const createInterviews = () => {
    Modal.confirm({
      title: 'Keep some mentors free from interviews?',
      content: 'Algorithm could automatically reserve some mentors and you could assign interviews to them manually',
      okText: 'Keep',
      cancelText: 'Assign',
      onOk: withLoading(async () => {
        await courseService.createStageInterviews({ keepReserve: true, noRegistration });
        await loadInterviews();
      }),
      onCancel: withLoading(async () => {
        await courseService.createStageInterviews({ keepReserve: false, noRegistration });
        await loadInterviews();
      }),
    });
  };

  const deleteInterview = withLoading(async (record: any) => {
    await courseService.deleteStageInterview(record.id);
    await loadInterviews();
  });

  useAsync(withLoading(loadInterviews), []);

  return (
    <AdminPageLayout
      loading={loading}
      title="Technical Screening"
      session={props.session}
      courseName={props.course.name}
      courses={[props.course]}
    >
      <Row style={{ marginBottom: 16 }} justify="space-between">
        <Button type="primary" onClick={() => setModal(true)}>
          Create
        </Button>
        {courseManagerRole ? (
          <div>
            <Checkbox checked={noRegistration} onChange={e => setNoRegistration(e.target.checked)}>
              No Registration
            </Checkbox>
            <Button onClick={createInterviews}>Create Interviews</Button>
          </div>
        ) : null}
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
            render: value => <PersonCell value={value} />,
            ...getColumnSearchProps('interviewer.githubId'),
          },
          {
            title: 'Student',
            dataIndex: 'student',
            sorter: stringSorter('student.githubId'),
            render: value => <PersonCell value={value} />,
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
        courseId={props.course.id}
      />
    </AdminPageLayout>
  );
}

export default withCourseData(withSession(Page));
