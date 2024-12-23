import { Button, Row, Select, Table } from 'antd';
import { StudentMentorModal } from 'components/StudentMentorModal';
import { AdminPageLayout } from 'components/PageLayout';
import { getColumnSearchProps, stringSorter, boolIconRenderer, PersonCell, numberSorter } from 'components/Table';
import { useLoading } from 'components/useLoading';
import { useMemo, useState, useContext } from 'react';
import { CourseService } from 'services/course';
import { CourseRole } from 'services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from 'domain/user';
import { InterviewPair } from 'common/models/interview';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesInterviewsApi, InterviewDto } from 'api';

const coursesInterviewsApi = new CoursesInterviewsApi();

function Page() {
  const session = useContext(SessionContext);
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;

  const [loading, withLoading] = useLoading(false);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [data, setData] = useState([] as InterviewPair[]);
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const loadInterviews = async () => {
    const { data: interviews } = await coursesInterviewsApi.getInterviews(courseId);
    const filtered = interviews.filter(({ type }) => type === 'interview');
    setInterviews(filtered);
    setSelected(filtered[0]?.id.toString() ?? null);
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
    <AdminPageLayout loading={loading} title="Interviews" showCourseName courses={courses}>
      <Row style={{ marginBottom: 16 }} justify="space-between">
        <Select value={selected!} onChange={(value: string) => setSelected(value)} style={{ minWidth: 300 }}>
          {interviews.map(interview => (
            <Select.Option value={interview.id.toString()} key={interview.id.toString()}>
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
              if (isCourseManager(session, course.id)) {
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
