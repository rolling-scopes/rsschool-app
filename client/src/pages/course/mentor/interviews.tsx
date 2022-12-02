import { CheckCircleTwoTone } from '@ant-design/icons';
import { Button, List } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { Dictionary, groupBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Interview } from 'services/course';
import { Course } from 'services/models';
import { formatDateFriendly } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { SelectMentorModal } from 'components/SelectMentorModal';
import moment from 'moment';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState({} as Dictionary<any[]>);
  const [activeInterviewId, setActiveIntervewId] = useState(null as number | null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
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
            footer={renderFooter(interview, props.course.alias)}
            itemLayout="horizontal"
            dataSource={data[name]}
            renderItem={renderItem(props.course, interview, showMentorModal)}
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

function renderItem(course: Course, interview: { template: string | null }, showMentorModal: (id: number) => void) {
  return (item: any) => {
    return (
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
        {item.completed && (
          <Button
            href={getURL(item, course, isTechnicalScreening(item) ? null : interview.template)}
            type="link"
            size="small"
          >
            Edit Feedback
          </Button>
        )}
        {!item.completed && (
          <Button href={getURL(item, course, interview.template)} type="link" size="small">
            Provide Feedback
          </Button>
        )}
        {!item.completed && isTechnicalScreening(item) && (
          <Button onClick={() => showMentorModal(item.id)} type="link" size="small">
            Transfer
          </Button>
        )}
      </List.Item>
    );
  };
}

function getURL(item: any, course: Course, template?: string | null) {
  if (isTechnicalScreening(item)) {
    return `/course/mentor/interview-technical-screening?course=${course.alias}&githubId=${item.student.githubId}`;
  }
  return `/course/interview/${template}/feedback?course=${course.alias}&githubId=${item.student.githubId}`;
}

function isTechnicalScreening(item: { name: string }) {
  return item.name.includes('Technical Screening');
}

function renderFooter(interview: Interview, courseAlias: string) {
  const { name, startDate, id } = interview;
  const showWaitList = isTechnicalScreening({ name }) || moment(startDate).isBefore(moment());

  if (showWaitList) {
    return (
      <>
        <div>Do you want to interview more students?</div> Please check
        <Button
          size="small"
          type="link"
          href={`/course/mentor/interview-wait-list?course=${courseAlias}&interviewId=${id}`}
        >
          Available Students
        </Button>
      </>
    );
  }
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
