import { Button, Table } from 'antd';
import { Rating } from 'components/Rating';
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
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager } from 'domain/user';
import { AvailableStudentDto, CoursesInterviewsApi, InterviewDto } from 'api';
import { getApiConfiguration } from 'utils/axios';

const api = new CoursesInterviewsApi(getApiConfiguration());

export type PageProps = CoursePageProps & { interview: InterviewDto };

export function InterviewWaitingList({ session, course, interview }: PageProps) {
  const courseId = course.id;
  const isPowerUser = useMemo(() => isCourseManager(session, courseId), [session]);
  const [loading, withLoading] = useLoading(false);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudentDto[]>([]);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const isStageInteview = interview.type === 'stage-interview';

  useAsync(
    withLoading(async () => {
      const { data } = await api.getAvailableStudents(courseId, interview.id);
      setAvailableStudents(data);
    }),
    [],
  );

  const inviteStudent = withLoading(async (githubId: string) => {
    if (isStageInteview) {
      await courseService.createInterview(githubId, session.githubId);
    } else {
      await courseService.addInterviewPair(`${interview.id}`, session.githubId, githubId);
    }
    removeStudentFromList(githubId);
  });

  const removeFromList = withLoading(async (githubId: string) => {
    await courseService.updateMentoringAvailability(githubId, false);
    removeStudentFromList(githubId);
  });

  return (
    <PageLayout
      loading={loading}
      title={`${interview.name.trim()}: Wait list`}
      githubId={session.githubId}
      courseName={course.name}
    >
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
          ...(isStageInteview
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
                  render: (value: number) => (value != null ? <Rating rating={value} /> : null),
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
                <Button type="link" onClick={() => inviteStudent(record.githubId)}>
                  Want to interview
                </Button>
                {isStageInteview && isPowerUser ? (
                  <Button type="link" onClick={() => removeFromList(record.githubId)}>
                    Remove from list
                  </Button>
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
