import Image from 'next/image';
import withSession, { Session } from 'components/withSession';
import { PageLayout } from 'components';
import { Row } from 'antd';

type IProps = {
  session: Session;
};

function Page(props: IProps) {
  return (
    <PageLayout loading={false} githubId={props.session.githubId}>
      <Row justify="center">
        <Image src="/static/svg/err.svg" alt="Error 404" width={400} height={400} />
      </Row>
      <Row justify="center">
        <h2>404</h2>
      </Row>
      <Row justify="center">
        <h3>That page doesn't exist!</h3>
      </Row>
      <Row justify="center">
        <p>Sorry, the page you were looking for could not be found.</p>
      </Row>
    </PageLayout>
  );
}

export default withSession(Page);
