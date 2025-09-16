import Image from 'next/image';
import { PageLayout } from 'components/PageLayout';
import { Row } from 'antd';
import { SessionProvider } from 'modules/Course/contexts';

function NotFoundPage() {
  return (
    <PageLayout loading={false}>
      <Row justify="center" style={{ margin: '65px 0 25px 0' }}>
        <Image src="/static/svg/err.svg" alt="Error 404" width={175} height={175} />
      </Row>
      <Row justify="center">
        <h1 style={{ fontSize: '102px', marginBottom: 0 }}>404</h1>
      </Row>
      <Row justify="center">
        <h2>Sorry, Page Not Found</h2>
      </Row>
    </PageLayout>
  );
}

function Page() {
  return (
    <SessionProvider>
      <NotFoundPage />
    </SessionProvider>
  );
}

export default Page;
