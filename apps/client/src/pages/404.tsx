import Image from 'next/image';
import withSession, { Session } from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import { Row } from 'antd';

type IProps = {
  session: Session;
};

function Page(props: IProps) {
  return (
    <PageLayout loading={false} githubId={props.session.githubId}>
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

export default withSession(Page);
