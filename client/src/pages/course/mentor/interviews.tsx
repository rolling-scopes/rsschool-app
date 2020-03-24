import { CheckCircleTwoTone } from '@ant-design/icons';
import { Button, List } from 'antd';
import { PageLayout, GithubUserLink } from 'components';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { Dictionary, groupBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { Course } from 'services/models';
import { formatDateFriendly } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { SelectMentorModal } from 'components/SelectMentorModal';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState({} as Dictionary<any[]>);
  const [activeInterviewId, setActiveIntervewId] = useState(null as number | null);
  const [interviews, setInterviews] = useState([] as any[]);
  const [loading, withLoading] = useLoading();
  const [mentorModalShown, setMentorModalShown] = useState(false);

  const loadData = async () => {
    const [data, interviews] = await Promise.all([
      courseService.getMentorInterviews(props.session.githubId),
      courseService.getInterviews(),
    ] as const);
    const groupedData = groupBy(data, 'name');
    setData(groupedData);
    setInterviews(interviews);
  };

  useAsync(withLoading(loadData), []);

  const showMentorModal = (interviewId: number) => {
    setActiveIntervewId(interviewId);
    setMentorModalShown(true);
  };

  const handleTransfer = withLoading(async (githubId: string) => {
    if (activeInterviewId) {
      await courseService.updateStageInterview(activeInterviewId, { githubId });
      await loadData();
      setMentorModalShown(false);
    }
  });

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      {interviews.map(interview => {
        const name = interview.name;
        return (
          <List
            key={interview.id}
            locale={{ emptyText: 'No planned or completed interviews' }}
            size="small"
            style={{ marginBottom: 16 }}
            header={renderHeader(name, interview)}
            footer={renderFooter(name, props.course.alias)}
            itemLayout="horizontal"
            dataSource={data[name]}
            renderItem={renderItem(props.course, showMentorModal)}
          />
        );
      })}
      <SelectMentorModal
        courseId={props.course.id}
        visible={mentorModalShown}
        onOk={handleTransfer}
        onCancel={() => setMentorModalShown(false)}
      />
    </PageLayout>
  );
}

function renderItem(course: Course, showMentorModal: (id: number) => void) {
  return (item: any) => (
    <List.Item>
      <List.Item.Meta
        title={<GithubUserLink value={item.student.githubId} />}
        description={
          item.completed ? (
            <span>
              <CheckCircleTwoTone twoToneColor="#52c41a" /> Completed
            </span>
          ) : null
        }
      />
      {!item.completed && (
        <Button
          href={`/course/mentor/interview-technical-screening?course=${course.alias}&githubId=${item.student.githubId}`}
          type="link"
          size="small"
        >
          Provide Feedback
        </Button>
      )}
      {!item.completed && (
        <Button onClick={() => showMentorModal(item.id)} type="link" size="small">
          Transfer
        </Button>
      )}
      {!item.completed && (
        <Button href={`/course/mentor/expel-student?course=${course.alias}`} type="link" size="small">
          Expel
        </Button>
      )}
    </List.Item>
  );
}

function renderFooter(key: string, courseAlias: string) {
  return key === 'Technical Screening' ? (
    <>
      <div>Do you want to interview more students?</div> Please check
      <Button size="small" type="link" href={`/course/mentor/interview-students?course=${courseAlias}`}>
        Available Students
      </Button>
    </>
  ) : null;
}

function renderHeader(name: string, interview: any) {
  return (
    <>
      <h4>{name}</h4>
      {formatDateFriendly(interview?.startDate)} - {formatDateFriendly(interview?.endDate)}
    </>
  );
}

export default withCourseData(withSession(Page));
