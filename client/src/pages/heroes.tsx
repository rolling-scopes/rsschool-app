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

const { TabPane } = Tabs;

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useAsync(async () => {
    const [courses] = await Promise.all([new CoursesService().getCourses()]);
    setCourses(courses);
  }, []);

  return (
    <PageLayout loading={loading} title="Heroes" githubId={props.session.githubId}>
      <Tabs>
        <TabPane tab="Gratitudes" key="1">
          <HeroesForm setLoading={setLoading} courses={courses} />
        </TabPane>
        <TabPane tab="Heroes Radar" key="2">
          <HeroesRadarTab setLoading={setLoading} courses={courses} />
        </TabPane>
      </Tabs>
    </PageLayout>
  );
}

export default withSession(Page);
