import { Button, Row, Select, Table } from 'antd';
import { PageLayout, StudentMentorModal, withSession } from 'components';
import { getColumnSearchProps, stringSorter, boolIconRenderer, PersonCell, numberSorter } from 'components/Table';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { CourseService, Interview } from 'services/course';
import { CoursePageProps } from 'services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from 'domain/user';
import { InterviewPair } from '../../../../../common/models/interview';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [loading, withLoading] = useLoading(false);
  const [interviews, setInterviews] = useState([] as Interview[]);
  const [data, setData] = useState([] as InterviewPair[]);
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const loadInterviews = async () => {
    const records = await courseService.getInterviews();
    const filtered = records.filter(({ type }) => type === 'interview');
    setInterviews(filtered);
    setSelected(filtered[0]?.id ?? null);
  };

  const deleteInterview = withLoading(async (record: any) => {
    await courseService.cancelInterviewPair(selected!, record.id);
    const filtered = data.filter(d => d.id !== record.id);
    setData(filtered);
  });

  const loadData = async () => {
    if (selected) {
      const data = await courseService.getInterviewPairs(selected);
      setData(data);
    }
  };

  useAsync(withLoading(loadData), [selected]);

  useAsync(withLoading(loadInterviews), []);

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      <Row style={{ marginBottom: 16 }} justify="space-between">
        <Select value={selected!} onChange={(value: string) => setSelected(value)} style={{ minWidth: 300 }}>
          {interviews.map(interview => (
            <Select.Option value={interview.id} key={interview.id}>
              {interview.name}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={() => setModal(true)}>
          Create
        </Button>
      </Row>

      <Table
        pagination={{ defaultPageSize: 50 }}
        size="small"
        rowKey="id"
        dataSource={data as any}
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
            title: 'Completed',
            dataIndex: 'status',
            sorter: stringSorter('status'),
            render: boolIconRenderer,
          },
          {
            title: 'Result',
            dataIndex: 'result',
            sorter: numberSorter('result'),
          },
          {
            fixed: 'right',
            title: 'Actions',
            dataIndex: 'actions',
            width: 80,
            render: (_, record) => {
              if (isCourseManager(props.session, props.course.id)) {
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
          await courseService.addInterviewPair(selected!, mentorGithubId, studentGithubId);
          await loadData();
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
