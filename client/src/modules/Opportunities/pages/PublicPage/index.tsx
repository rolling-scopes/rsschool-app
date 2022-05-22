import { Layout } from 'antd';
import { ResumeDto } from 'api';
import ViewCV from 'modules/Opportunities/components/ViewCV';
import Head from 'next/head';
import React, { PropsWithChildren } from 'react';

const { Content } = Layout;

type Props = { data: ResumeDto };

export function PublicPage({ data }: PropsWithChildren<Props>) {
  const title = `CV / ${data.name ?? data.githubUsername ?? '(Empty)'} / RS School`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://app.rs.school/cv/${data.uuid}`} />
        <meta
          property="og:image"
          content={data.avatarLink || 'https://app.rs.school/static/images/logo-rsschool3.png'}
        />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <Layout className="cv-layout">
        <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
          <ViewCV publicMode initialData={data} />
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
