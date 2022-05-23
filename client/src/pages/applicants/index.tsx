import { Layout, Result, Table } from 'antd';
import { ApplicantResumeDto, OpportunitiesApi } from 'api';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { dateRenderer, getColumnSearchProps, stringSorter } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import { NextRouter, withRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

const { Content } = Layout;

type Props = {
  router: NextRouter;
  session: Session;
};

const api = new OpportunitiesApi();

function Page(props: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<ApplicantResumeDto[] | null>(null);

  const { isAdmin, isHirer, githubId: userGithubId } = props.session;

  const hasPriorityRole = isAdmin || isHirer;

  const columns = [
    {
      title: 'Name',
      sorter: stringSorter('name'),
      render: (data: ApplicantResumeDto) => {
        const { name, uuid } = data;

        return (
          <>
            <a href={`/cv/${uuid}`}>{name ?? 'Unknown'}</a>
          </>
        );
      },
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Desired postion',
      dataIndex: 'desiredPosition',
      key: 'desiredPosition',
      ...getColumnSearchProps('desiredPosition'),
    },
    {
      title: 'Locations',
      dataIndex: 'locations',
      key: 'locations',
      ...getColumnSearchProps('locations'),
      render: (locationsRaw: string) => {
        const locations = locationsRaw.split('\n');
        const locationsItems = locations.filter(l => l.trim()).map(location => <li key={location}>{location}</li>);
        return <ul>{locationsItems}</ul>;
      },
    },
    {
      title: 'English level',
      dataIndex: 'englishLevel',
      key: 'englishLevel',
      sorter: stringSorter('englishLevel'),
      ...getColumnSearchProps('englishLevel'),
    },
    {
      title: 'Full time',
      dataIndex: 'fullTime',
      key: 'fullTime',
      ...getColumnSearchProps('fullTime'),
    },
    {
      title: 'Start from',
      dataIndex: 'startFrom',
      key: 'startFrom',
      sorter: stringSorter('startFrom'),
      ...getColumnSearchProps('startFrom'),
    },
    {
      title: 'CV expires',
      dataIndex: 'expires',
      key: 'expires',
      sorter: stringSorter('expires'),
      render: dateRenderer,
      ...getColumnSearchProps('expires'),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await api.getApplicants();
    setApplicants(data);
    setLoading(false);
  }, []);

  const transformApplicants = (data: ApplicantResumeDto[]) => {
    return data.map(item => {
      const { fullTime, startFrom, englishLevel, desiredPosition, locations } = item;
      return {
        ...item,
        desiredPosition: desiredPosition?.length ? desiredPosition : '<Not set>',
        fullTime: fullTime ? 'Yes' : 'No',
        locations: locations?.length ? locations : '<Not set>',
        startFrom: startFrom?.length ? startFrom : '<Not set>',
        englishLevel: englishLevel?.length ? englishLevel?.toUpperCase() : '<Not set>',
      };
    });
  };

  useEffect(() => {
    if (hasPriorityRole) fetchData();
  }, []);

  if (!hasPriorityRole)
    return (
      <>
        <Header username={userGithubId} />
        <Result status="403" title="Sorry, but you don't have access to this page" />
      </>
    );

  let data = null;

  if (applicants) {
    data = transformApplicants(applicants);
  }

  return (
    <>
      <Header username={userGithubId} />
      <LoadingScreen show={loading}>
        <Layout style={{ margin: 'auto', backgroundColor: '#FFF' }}>
          <Content style={{ backgroundColor: '#FFF', minHeight: '60vh', margin: 'auto' }}>
            <Table
              pagination={{ pageSize: 100 }}
              style={{ minWidth: '99vw' }}
              columns={columns}
              dataSource={data ?? undefined}
            ></Table>
          </Content>
        </Layout>
      </LoadingScreen>
    </>
  );
}

export default withRouter(withSession(Page));
