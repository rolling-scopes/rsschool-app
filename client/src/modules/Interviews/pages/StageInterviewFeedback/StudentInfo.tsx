import { Col, Row, Typography } from 'antd';
import GithubFilled from '@ant-design/icons/GithubFilled';
import { GithubAvatar } from '@client/shared/components/GithubAvatar';
import { StudentDto } from '@client/api';

type Props = {
  student: StudentDto;
  courseSummary: {
    totalScore: number;
    studentsCount: number;
  };
};

const { Text } = Typography;

export function StudentInfo(props: Props) {
  const { student, courseSummary } = props;
  const { githubId, name, rank, totalScore } = student;
  const hasName = name && name !== '(Empty)';
  const location = [student.cityName, student.countryName].filter(Boolean).join(', ');

  return (
    <Col style={{ padding: 24 }}>
      <Row align="middle" gutter={24}>
        <Col>
          <GithubAvatar githubId={githubId} size={48} />
        </Col>
        <Col>
          {hasName && (
            <Row>
              <Typography.Title level={5}>{name}</Typography.Title>
            </Row>
          )}
          <Row>
            <Typography.Link target="_blank" href={`https://github.com/${githubId}`}>
              <GithubFilled /> {githubId}
            </Typography.Link>
          </Row>
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginTop: 32 }}>
        <Col>
          <Row>
            <Text type="secondary">Position</Text>
          </Row>
          <Row>
            <Text>{`${rank}/${courseSummary.studentsCount}`}</Text>
          </Row>
        </Col>
        <Col>
          <Row>
            <Text type="secondary">Total Score</Text>
          </Row>
          <Row>
            {' '}
            <Text>{`${totalScore}/${courseSummary.totalScore}`}</Text>
          </Row>
        </Col>
        <Col>
          <Row>
            <Text type="secondary">Location</Text>
          </Row>
          <Row>
            <Text>{location}</Text>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
