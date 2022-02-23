import { Layout } from 'antd';
import { ResumeDto } from 'api';
import ViewCV from 'modules/Opportunities/components/ViewCV';
import Head from 'next/head';
import React, { PropsWithChildren } from 'react';

const { Content } = Layout;

type Props = { data: ResumeDto };

export function PublicPage({ data }: PropsWithChildren<Props>) {
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <Layout className="cv-layout">
        <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
          <ViewCV initialData={data} />
        </Content>
      </Layout>
      <style jsx global>{`
        html,
        body {
          font-family: 'Ubuntu', sans-serif;
        }
        .cv-layout {
          background-color: white !important;
        }
      `}</style>
    </>
  );
}
