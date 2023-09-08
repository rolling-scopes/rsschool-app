import React from 'react';
import Link from 'next/link';
import { Row, Image, Layout, Space, Typography, Alert, Button } from 'antd';

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
        <Space direction="vertical" align="center" size="middle" style={{ padding: '20px' }}>
          <Alert message="Oops, looks like we couldn't find your profile in RS-App! 🤔" type="warning" showIcon />
          <Text>No worries—you have a couple of options:</Text>
          <Space direction="vertical" align="center">
            <Link href="/login">
              <Button type="primary">Log in with another GitHub account 🔄</Button>
            </Link>
            <Space wrap>
              <Link href="/registry/student">
                <Button type="default">Register as a student 🎓</Button>
              </Link>
              <Link href="/registry/mentor">
                <Button type="default">Register as a mentor 🌟</Button>
              </Link>
            </Space>
          </Space>
        </Space>
      </Row>
    </Layout>
  );
}
