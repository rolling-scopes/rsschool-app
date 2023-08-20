import { Row } from 'antd';
import Image from 'next/image';
import { PageLayout } from 'components/PageLayout';

const defaultMessage = 'Something went wrong, please try reloading the page later';
const defaultImageName = 'Image error';

type Props = {
  githubId: string;
  imagePath: string;
  imageName: string;
  textMessage: string | JSX.Element;
  loading?: boolean;
};

export function Warning(props: Props) {
  const { loading = false, imagePath, imageName = defaultImageName, textMessage = defaultMessage } = props;
  return (
    <PageLayout loading={loading}>
      <Row justify="center" style={{ margin: '65px 0 25px 0' }}>
        <Image src={`/static${imagePath}`} alt={imageName} width={175} height={175} />
      </Row>
      <Row justify="center">
        <h1 style={{ fontSize: '36px', marginBottom: 0 }}>{textMessage}</h1>
      </Row>
    </PageLayout>
  );
}
