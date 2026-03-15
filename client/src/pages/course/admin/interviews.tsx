import { Button, Row, Select, Table, Popconfirm } from 'antd';
import { useRequest } from 'ahooks';
import { StudentMentorModal } from '@client/shared/components/StudentMentorModal';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import {
  getColumnSearchProps,
  stringSorter,
  boolIconRenderer,
  PersonCell,
  numberSorter,
} from '@client/shared/components/Table';
import { useMemo, useState, useContext } from 'react';
import { CourseService } from '@client/services/course';
import { CourseRole } from '@client/services/models';
import { useAsync } from 'react-use';
import { isCourseManager } from '@client/domain/user';
import { SessionContext, SessionProvider, useActiveCourseContext } from '@client/modules/Course/contexts';
import { CoursesInterviewsApi, InterviewDto, InterviewPairDto } from '@client/api';

const coursesInterviewsApi = new CoursesInterviewsApi();

function Page() {
  const session = useContext(SessionContext);
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;

  const [interviews, setInterviews] = useState<InterviewDto[]>([]);

  const [data, setData] = useState([] as InterviewPairDto[]);
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const courseManagerRole = useMemo(() => isCourseManager(session, courseId), [course, session]);

  const loadInterviews = async () => {
    const { data: interviews } = await coursesInterviewsApi.getInterviews(courseId);
    const filtered = interviews.filter(({ type }) => type === 'interview');
    setInterviews(filtered);
    setSelected(filtered[0]?.id.toString() ?? null);
  };

  const { loading: loadingDeleteInterview, runAsync: deleteInterview } = useRequest(
    async (record: InterviewPairDto) => {
      await courseService.cancelInterviewPair(selected!, String(record.id));
      const filtered = data.filter(d => d.id !== record.id);
      setData(filtered);
    },
    { manual: true },
  );

  const loadData = async () => {
    if (selected) {
      const { data } = await coursesInterviewsApi.getInterviewPairs(Number(selected), courseId);
      setData(data);
    }
  };

  const { loading: loadingCreateInterviews, runAsync: createInterviews } = useRequest(
    async () => {
      if (selected) {
        const courseTaskId = Number(selected);
        const isInterviewsIncludesSelected = interviews.map(({ id }) => id).includes(courseTaskId);

        if (isInterviewsIncludesSelected) {
          await courseService.createInterviewDistribution(courseTaskId);
          await loadDataRequest();
        }
      }
    },
    { manual: true },
  );

  const { loading: loadingData, runAsync: loadDataRequest } = useRequest(loadData, { manual: true });
  const { loading: loadingInterviews, runAsync: loadInterviewsRequest } = useRequest(loadInterviews, { manual: true });
  const { loading: loadingAddPair, runAsync: addInterviewPair } = useRequest(
    async (studentGithubId: string, mentorGithubId: string) => {
      await courseService.addInterviewPair(selected!, mentorGithubId, studentGithubId);
      await loadDataRequest();
      setModal(false);
    },
    { manual: true },
  );

  const loading =
    loadingDeleteInterview || loadingCreateInterviews || loadingData || loadingInterviews || loadingAddPair;

  useAsync(async () => loadDataRequest(), [selected]);

  useAsync(async () => loadInterviewsRequest(), []);

  return (
    <AdminPageLayout loading={loading} title="Interviews" showCourseName courses={courses}>
      <Row style={{ marginBottom: 16, gap: 16 }} justify="space-between">
        <Row style={{ gap: 16 }}>
          <Select value={selected!} onChange={(value: string) => setSelected(value)} style={{ minWidth: 300 }}>
            {interviews.map(interview => (
              <Select.Option value={interview.id.toString()} key={interview.id.toString()}>
                {interview.name}
              </Select.Option>
            ))}
          </Select>
          {courseManagerRole ? (
            <div>
              <Popconfirm
                onConfirm={() => createInterviews()}
                title="Do you want to create interview pairs for not distributed students?"
              >
                <Button>Create Interview Pairs</Button>
              </Popconfirm>
            </div>
          ) : null}
        </Row>
        <Button type="primary" onClick={() => setModal(true)}>
          Create
        </Button>
      </Row>

      <Table
        pagination={{ defaultPageSize: 50 }}
        size="small"
        rowKey="id"
        dataSource={data}
        columns={[
          {
            fixed: 'left',
            title: 'Interviewer',
            dataIndex: 'interviewer',
            sorter: stringSorter('interviewer.githubId' as keyof InterviewPairDto),
            render: value => <PersonCell value={value} />,
            ...getColumnSearchProps('interviewer.githubId'),
          },
          {
            title: 'Student',
            dataIndex: 'student',
            sorter: stringSorter('student.githubId' as keyof InterviewPairDto),
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
        onOk={addInterviewPair}
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
