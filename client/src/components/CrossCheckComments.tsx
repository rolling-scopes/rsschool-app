import { UserOutlined } from '@ant-design/icons';
import { Col, Comment, Divider, Row, Typography } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import PreparedComment from './Forms/PreparedComment';

type Props = {
  comments: {
    comment: string;
    score: number;
    author: {
      name: string;
      githubId: string;
    } | null;
  }[];
};

export function CrossCheckComments(props: Props) {
  const { comments } = props;
  if (!comments || comments.length === 0) {
    return null;
  }
  const style = { margin: 16 };
  return (
    <Col>
      {comments.map(({ comment, author, score }, i) => (
        <Row key={i}>
          <Divider />
          <Comment
            style={style}
            author={author ? <GithubUserLink value={author.githubId} /> : `Student ${i + 1}`}
            avatar={<UserOutlined />}
            content={
              <>
                <Typography.Paragraph strong>Score: {score}</Typography.Paragraph>
                <PreparedComment text={comment} />
              </>
            }
          />
        </Row>
      ))}
    </Col>
  );
}
