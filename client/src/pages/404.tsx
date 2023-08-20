import Image from 'next/image';
import withSession from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import { Row } from 'antd';
import { DefaultPageProvider } from 'modules/Course/contexts';

function Page() {
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

function PageWithContext() {
  return (
    <DefaultPageProvider>
      <Page />
    </DefaultPageProvider>
  );
}

export default withSession(PageWithContext);
