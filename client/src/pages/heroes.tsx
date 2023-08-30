import { PageLayout } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { HeroesForm } from '../components/Forms/Heroes';
import React, { useState } from 'react';
import { Tabs } from 'antd';
import HeroesRadarTab from 'components/Heroes/HeroesRadarTab';
import { Course } from 'services/models';
import { CoursesService } from 'services/courses';
import { useAsync } from 'react-use';

type Props = {
  session: Session;
};

// const { TabPane } = Tabs;

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const tabs = [
    { label: 'Gratitudes', key: '1', children: <HeroesForm setLoading={setLoading} courses={courses} /> },
    { label: 'Heroes Radar', key: '2', children: <HeroesRadarTab setLoading={setLoading} courses={courses} /> },
  ];

  useAsync(async () => {
    const [courses] = await Promise.all([new CoursesService().getCourses()]);
    setCourses(courses);
  }, []);

  return (
    <PageLayout loading={loading} title="Heroes" githubId={props.session.githubId}>
      <Tabs items={tabs} />
    </PageLayout>
  );
}

export default withSession(Page);
