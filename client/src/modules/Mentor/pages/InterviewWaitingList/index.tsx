import { Button, Table } from 'antd';
import { PageLayout } from 'components/PageLayout';
import {
  getColumnSearchProps,
  numberSorter,
  stringSorter,
  boolSorter,
  boolIconRenderer,
  PersonCell,
  dateRenderer,
} from 'components/Table';
import { useLoading } from 'components/useLoading';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager, isMentor } from 'domain/user';
import { AvailableStudentDto, CoursesInterviewsApi, InterviewDto, TaskDtoTypeEnum } from 'api';
import { getRating } from 'domain/interview';
import { CustomPopconfirm } from 'components/common/CustomPopconfirm';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useRequest } from 'ahooks';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Rating } from '@client/components/Rating';

const api = new CoursesInterviewsApi();

export type PageProps = CoursePageProps & { interview: InterviewDto };

export function InterviewWaitingList() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const courseId = course.id;
  const router = useRouter();
  const interviewId = Number(router.query.interviewId);
  const isPowerUser = useMemo(() => isCourseManager(session, courseId), [session, courseId]);
  const [loading, withLoading] = useLoading(false);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudentDto[]>([]);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const { data: interview } = useRequest(async () => {
    const { data } = await api.getInterview(interviewId, courseId);
    const isStage = data.type === TaskDtoTypeEnum.StageInterview;
    if (!isStage && dayjs(data.startDate).isAfter(dayjs())) {
      router.push(`/403`);
    }
    return data;
  });

  const isStageInterview = interview?.type === TaskDtoTypeEnum.StageInterview;

  useAsync(
    withLoading(async () => {
      const { data } = await api.getAvailableStudents(courseId, interviewId);
      setAvailableStudents(data);
    }),
    [],
  );

  const inviteStudent = withLoading(async (githubId: string) => {
    if (isStageInterview) {
      await courseService.createInterview(githubId, session.githubId);
    } else {
      await courseService.addInterviewPair(`${interviewId}`, session.githubId, githubId);
    }
    removeStudentFromList(githubId);
  });

  const assignStudentToMentor = withLoading(async (studentId: string) => {
    await courseService.updateStudent(studentId, { mentorGithuId: session.githubId });
    removeStudentFromList(studentId);
  });

  const removeFromList = withLoading(async (githubId: string) => {
    await courseService.updateMentoringAvailability(githubId, false);
    removeStudentFromList(githubId);
  });

  return (
    <PageLayout loading={loading} title={`${interview?.name.trim()}: Wait list`} showCourseName>
      <Table
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={availableStudents}
        rowKey="id"
        columns={[
          {
            title: 'Github',
            dataIndex: 'githubId',
            sorter: stringSorter('githubId'),
            width: 180,
            render: (_: string, record) => <PersonCell value={record} />,
            ...getColumnSearchProps(['githubId', 'name']),
          },
          ...(isStageInterview
            ? [
                {
                  title: 'Good Candidate',
                  dataIndex: 'isGoodCandidate',
                  width: 180,
                  sorter: boolSorter('isGoodCandidate'),
                  render: (value: boolean) => (value ? boolIconRenderer(value) : null),
                },
                {
                  title: 'Interview Rating',
                  dataIndex: 'rating',
                  sorter: numberSorter('rating'),
                  width: 210,
                  render: (value: number, record: AvailableStudentDto) =>
                    value != null ? (
                      <Rating rating={getRating(value, record.maxScore, record.feedbackVersion)} />
                    ) : null,
                },
              ]
            : []),
          {
            title: 'City',
            dataIndex: 'cityName',
            sorter: stringSorter('cityName'),
            width: 180,
            ...getColumnSearchProps('cityName'),
          },
          {
            title: 'Country',
            dataIndex: 'countryName',
            sorter: stringSorter('countryName'),
            width: 180,
            ...getColumnSearchProps('countryName'),
          },
          {
            title: 'Score',
            dataIndex: 'totalScore',
            sorter: numberSorter('totalScore'),
          },
          {
            title: 'Date registered',
            width: 140,
            dataIndex: 'registeredDate',
            render: (registeredDate: string) => dateRenderer(registeredDate),
          },
          {
            title: 'Actions',
            dataIndex: 'actions',
            align: 'right',
            render: (_, record) => (
              <>
                <CustomPopconfirm
                  title={
                    <>
                      Are you sure to interview <b>{record.githubId}</b>?
                    </>
                  }
                  okText="Yes"
                  onConfirm={() => inviteStudent(record.githubId)}
                >
                  <Button type="link">Want to interview</Button>
                </CustomPopconfirm>
                {isStageInterview && isMentor(session, courseId) && record.rating ? (
                  <CustomPopconfirm
                    title={
                      <>
                        Are you sure you want to assign <b>{record.githubId}</b> to yourself without an interview?
                      </>
                    }
                    okText="Yes"
                    onConfirm={() => assignStudentToMentor(record.githubId)}
                  >
                    <Button type="link">Assign student to me</Button>
                  </CustomPopconfirm>
                ) : null}
                {isStageInterview && isPowerUser ? (
                  <CustomPopconfirm
                    title={<>Are you sure to remove {record.githubId} from the wait list?</>}
                    okText="Yes"
                    onConfirm={() => removeFromList(record.githubId)}
                  >
                    <Button type="link">Remove from list</Button>
                  </CustomPopconfirm>
                ) : null}
              </>
            ),
          },
        ]}
      />
    </PageLayout>
  );

  function removeStudentFromList(githubIdToRemove: string) {
    setAvailableStudents(students => students.filter(({ githubId }) => githubId !== githubIdToRemove));
  }
}
