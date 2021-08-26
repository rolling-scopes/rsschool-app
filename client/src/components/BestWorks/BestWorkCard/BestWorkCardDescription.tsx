import { GithubUserLink } from '../../GithubUserLink';
import { Button, Col, Row, Tag } from 'antd';
import React from 'react';

interface ICustomTagProps {
  children: React.ReactNode;
}

interface IProps {
  users: string[];
  projectUrl: string;
  tags: string[];
}

function CustomTag({ children }: ICustomTagProps) {
  return <Tag style={{ padding: '5px 10px', marginBottom: '5px' }}>{children}</Tag>;
}

export function BestWorkCardDescription({ users, projectUrl, tags }: IProps) {
  if (!projectUrl.match('^https://')) projectUrl = `https://${projectUrl}`;
  return (
    <>
      <Row gutter={8}>
        {users.map(u => (
          <Col key={u}>
            <GithubUserLink value={u} key={u} />
          </Col>
        ))}
      </Row>
      <Row gutter={8} style={{ marginTop: '15px' }}>
        <Col style={{ marginBottom: '5px' }}>
          <Button href={projectUrl} target={'_blank'} type={'primary'}>
            Go to project
          </Button>
        </Col>
        <Col>
          {tags.map(t => (
            <CustomTag key={t}>{t}</CustomTag>
          ))}
        </Col>
      </Row>
    </>
  );
}
