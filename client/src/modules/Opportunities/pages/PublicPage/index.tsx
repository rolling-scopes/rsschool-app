import { Layout } from 'antd';
import { ResumeDto } from 'api';
import { ViewCV } from 'modules/Opportunities/components/ViewCv';
import Head from 'next/head';
import { PropsWithChildren } from 'react';
import styles from './index.module.css';

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
      <Layout>
        <Content className="print-no-padding" style={{ maxWidth: 960, margin: 'auto' }}>
          <ViewCV publicMode initialData={data} />
        </Content>
      </Layout>
      <div className={styles.fontOverride} />
    </>
  );
}
