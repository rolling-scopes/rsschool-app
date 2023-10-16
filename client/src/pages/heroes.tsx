import { PageLayout } from 'components/PageLayout';
import { HeroesForm } from '../components/Forms/Heroes';
import { useState } from 'react';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Tabs } from 'antd';
import HeroesRadarTab from 'components/Heroes/HeroesRadarTab';
import { Course } from 'services/models';
import { CoursesService } from 'services/courses';
import { useAsync } from 'react-use';

function Page() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const tabs = [
    { label: 'Gratitudes', key: '1', children: <HeroesForm setLoading={setLoading} courses={courses} /> },
    { label: 'Heroes Radar', key: '2', children: <HeroesRadarTab setLoading={setLoading} courses={courses} /> },
  ];

  useAsync(async () => {
    const courses = await new CoursesService().getCourses();
    setCourses(courses);
  }, []);

  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <PageLayout loading={loading} title="Heroes">
          <Tabs items={tabs} />
        </PageLayout>
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
