import Link from 'next/link';
import { Row, Image, Layout, Space, Typography, Alert, Button, Divider } from 'antd';

const { Text } = Typography;

export function WelcomeCard() {
  return (
    <Layout style={{ background: 'transparent', minHeight: '100vh' }}>
      <Row justify="center" style={{ margin: '65px 0 25px 0' }}>
        <Image
          src="https://cdn.rs.school/sloths/stickers/welcome/image.png"
          preview={false}
          alt="welcome"
          width={240}
          height={240}
        />
      </Row>
      <Row justify="center">
        <Space orientation="vertical" align="center" size="middle" style={{ padding: '20px' }}>
          <Alert message="Welcome to RS School App! Please register to continue" type="info" showIcon />
          <Space orientation="vertical" align="center">
            <Space wrap>
              <Link href="/registry/student">
                <Button type="default">Register as a student 🎓</Button>
              </Link>
              <Link href="/registry/mentor">
                <Button type="default">Register as a mentor 🌟</Button>
              </Link>
            </Space>

            <Divider />

            <Text>If you made a mistake and used the wrong GitHub account, you can log in with another one:</Text>
            <Link href="/login">
              <Button type="default">Log in with another GitHub account 🔄</Button>
            </Link>
          </Space>
        </Space>
      </Row>
    </Layout>
  );
}
