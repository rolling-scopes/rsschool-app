import { Row, Image } from 'antd';
import { PageLayout } from 'components/PageLayout';

export default function NotAccess() {
  return (
    <PageLayout loading={false}>
      <Row justify="center" style={{ margin: '65px 0 25px 0' }}>
        <Image
          src="https://cdn.rs.school/sloths/stickers/what-is-it/image.svg"
          alt="Error 403"
          preview={false}
          width={175}
          height={175}
        />
      </Row>
      <Row justify="center">
        <h2>Sorry, you do not have access to this page.</h2>
      </Row>
    </PageLayout>
  );
}
