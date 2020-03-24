import { Button, Row, Table, Modal } from 'antd';
import { PageLayout, StudentMentorModal, withSession } from 'components';
import { boolIconRenderer, getColumnSearchProps, numberSorter, stringSorter, PersonCell } from 'components/Table';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from 'rules/user';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [loading, withLoading] = useLoading(false);
  const [interviews, setInterviews] = useState([] as any[]);
  const [modal, setModal] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const loadInterviews = async () => {
    const records = await courseService.getStageInterviews();
    setInterviews(records);
  };

  const createInterviews = () => {
    Modal.confirm({
      title: 'Keep some mentors free from interviews?',
      content: 'Algorithm could automatically reserve some mentors and you could assign interviews to them manually',
      okText: 'Keep',
      cancelText: 'Assign',
      onOk: withLoading(async () => {
        await courseService.createStageInterviews(true);
        await loadInterviews();
      }),
      onCancel: withLoading(async () => {
        await courseService.createStageInterviews(false);
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
    <PageLayout
      loading={loading}
      title="Technical Screening"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Row style={{ marginBottom: 16 }} justify="space-between">
        <Button type="primary" onClick={() => setModal(true)}>
          Create
        </Button>
        {isCourseManager(props.session, props.course.id) ? (
          <Button onClick={createInterviews}>Create Interviews</Button>
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
              if (record.interviewer.githubId === props.session.githubId || props.session.isAdmin) {
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
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
