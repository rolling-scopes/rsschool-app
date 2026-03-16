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
import { isCourseManager } from '@client/domain/user';
import { SessionContext, SessionProvider, useActiveCourseContext } from '@client/modules/Course/contexts';
import { CoursesInterviewsApi, InterviewPairDto } from '@client/api';

const coursesInterviewsApi = new CoursesInterviewsApi();

function Page() {
  const session = useContext(SessionContext);
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;

  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState(false);

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const courseManagerRole = useMemo(() => isCourseManager(session, courseId), [course, session]);

  const interviewsRequest = useRequest(
    async () => {
      const { data: interviews } = await coursesInterviewsApi.getInterviews(courseId);
      const filtered = interviews
        .filter(({ type }) => type === 'interview')
        .map(({ id, name }) => ({ label: name, value: id }));
      return filtered;
    },
    { onSuccess: data => setSelected(data[0]?.value ?? null) },
  );

  const interviewPairsRequest = useRequest(
    async () => {
      const { data } = await coursesInterviewsApi.getInterviewPairs(Number(selected), courseId);
      return data;
    },
    { ready: Boolean(selected), refreshDeps: [selected] },
  );

  const deleteInterviewRequest = useRequest(
    async (selected: number, record: InterviewPairDto) =>
      courseService.cancelInterviewPair(selected, String(record.id)),
    { manual: true, onSuccess: interviewPairsRequest.runAsync },
  );

  const createInterviewsRequest = useRequest(
    async (selected: number) => courseService.createInterviewDistribution(selected),
    { ready: Boolean(selected), manual: true, onSuccess: interviewPairsRequest.runAsync },
  );

  const addInterviewPairRequest = useRequest(
    async (studentGithubId: string, mentorGithubId: string) => {
      await courseService.addInterviewPair(String(selected), mentorGithubId, studentGithubId);
      await interviewPairsRequest.runAsync();
      setModal(false);
    },
    { manual: true },
  );

  const loading =
    deleteInterviewRequest.loading ||
    interviewPairsRequest.loading ||
    createInterviewsRequest.loading ||
    interviewsRequest.loading ||
    addInterviewPairRequest.loading;

  return (
    <AdminPageLayout loading={loading} title="Interviews" showCourseName courses={courses}>
      <Row style={{ marginBottom: 16, gap: 16 }} justify="space-between">
        <Row style={{ gap: 16 }}>
          <Select
            value={selected}
            options={interviewsRequest.data}
            onChange={setSelected}
            style={{ minWidth: 300 }}
          ></Select>
          {courseManagerRole ? (
            <div>
              <Popconfirm
                onConfirm={() => createInterviewsRequest.run(selected!)}
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
        dataSource={interviewPairsRequest.data}
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
                  <Button type="link" onClick={() => deleteInterviewRequest.run(selected!, record)}>
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
        onOk={addInterviewPairRequest.run}
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
