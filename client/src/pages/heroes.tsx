import { PageLayout } from 'components/PageLayout';
import { HeroesForm } from '../components/Forms/Heroes';
import { useState } from 'react';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Tabs } from 'antd';
import HeroesRadarTab from 'components/Heroes/HeroesRadarTab';

function Page() {
  const [loading, setLoading] = useState(false);

  const tabs = [
    { label: 'Gratitudes', key: '1', children: <HeroesForm setLoading={setLoading} /> },
    { label: 'Heroes Radar', key: '2', children: <HeroesRadarTab setLoading={setLoading} /> },
  ];

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
