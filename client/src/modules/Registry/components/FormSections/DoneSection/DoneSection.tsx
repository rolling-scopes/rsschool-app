import { Button, Card, Col, Image, Row, Typography } from 'antd';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { SUCCESS_TEXT } from 'modules/Registry/constants';

type Props = {
  courseName?: string;
};

const { Title, Text } = Typography;

export function DoneSection({ courseName }: Props) {
  const isStudentForm = !!courseName;

  return (
    <Card>
      <Row justify="center" gutter={[0, 28]}>
        <Col>
          <DoneSectionImage isStudentForm={isStudentForm} />
        </Col>
        <Col span={24}>
          <Row justify="center" gutter={[0, 16]}>
            <Col span={24}>
              <Row justify="center">
                <Title level={3} style={{ marginBottom: 0 }}>
                  Success
                </Title>
              </Row>
            </Col>
            {!isStudentForm && (
              <>
                <Col span={24}>
                  <Row justify="center">
                    <Title level={3} style={{ textTransform: 'uppercase', color: '#1890FF', marginBottom: 0 }}>
                      but
                    </Title>
                  </Row>
                </Col>
                <Col span={24}>
                  <Row justify="center">
                    <ArrowIcon />
                  </Row>
                </Col>
              </>
            )}
            <Col span={24}>
              <Row justify="center">
                <Text type="secondary" style={{ maxWidth: '480px', textAlign: 'center' }}>
                  {SUCCESS_TEXT(courseName)}
                </Text>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="center">
                <Text type="secondary">See you soon</Text>
              </Row>
            </Col>
            {isStudentForm && (
              <Col span={24}>
                <Row justify="center">
                  <Button type="primary" href="/">
                    Continue
                  </Button>
                </Row>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

enum Sloths {
  MentorForm = 'slothzy',
  StudentForm = 'its-a-good-job',
}

function svg() {
  return (
    <svg width="24" height="65" viewBox="0 0 24 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.9393 63.7296C11.5251 64.3154 12.4749 64.3154 13.0607 63.7296L22.6066 54.1837C23.1924 53.5979 23.1924 52.6481 22.6066 52.0623C22.0208 51.4766 21.0711 51.4766 20.4853 52.0623L12 60.5476L3.51472 52.0623C2.92893 51.4766 1.97918 51.4766 1.3934 52.0623C0.807609 52.6481 0.807609 53.5979 1.3934 54.1837L10.9393 63.7296ZM10.5 -6.5567e-08L10.5 62.6689L13.5 62.6689L13.5 6.5567e-08L10.5 -6.5567e-08Z"
        fill="#1890FF"
      />
    </svg>
  );
}

function ArrowIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={svg} {...props} />;
}

function DoneSectionImage({ isStudentForm }: { isStudentForm: boolean }) {
  const alt = isStudentForm ? Sloths.StudentForm : Sloths.MentorForm;
  const src = `https://cdn.rs.school/sloths/stickers/${alt}/image.svg`;

  return <Image preview={false} src={src} alt={alt} />;
}
