import { CheckCircleTwoTone } from '@ant-design/icons';
import { Button, List } from 'antd';
import { GithubAvatar, PageLayout } from 'components';
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

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState({} as Dictionary<any[]>);
  const [interviews, setInterviews] = useState([] as any[]);
  const [loading, withLoading] = useLoading();

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

  const handleCancel = withLoading(async (id: number) => {
    await courseService.deleteStageInterview(id);
    await loadData();
  });

  const keys = Object.keys(data);
  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      {keys.map(name => {
        const interview = interviews.find(it => it.name === name);
        return (
          <List
            size="small"
            style={{ marginBottom: 16 }}
            header={renderHeader(name, interview)}
            footer={renderFooter(name, props.course.alias)}
            itemLayout="horizontal"
            dataSource={data[name]}
            renderItem={renderItem(props.course, handleCancel)}
          />
        );
      })}
    </PageLayout>
  );
}

function renderItem(course: Course, handleCancel: (id: number) => Promise<void>) {
  return (item: any) => (
    <List.Item>
      <List.Item.Meta
        avatar={<GithubAvatar size={24} githubId={item.student.githubId} />}
        title={item.student.githubId}
        description={
          item.completed ? (
            <span>
              <CheckCircleTwoTone twoToneColor="#52c41a" /> Completed
            </span>
          ) : null
        }
      />
      {!item.completed && (
        <Button href={`/course/mentor/interview-technical-screening?course=${course.alias}`} type="link" size="small">
          Complete
        </Button>
      )}
      {!item.completed && (
        <Button onClick={() => handleCancel(item.id)} type="link" size="small">
          Cancel
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
      <h3>{name}</h3>
      {formatDateFriendly(interview?.startDate)} - {formatDateFriendly(interview?.endDate)}
    </>
  );
}

export default withCourseData(withSession(Page));
