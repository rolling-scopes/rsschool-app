import React from 'react';
import { useLocalStorage } from 'react-use';
import Link from 'next/link';
import { Row, Col, Typography, Tooltip, Button } from 'antd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import css from 'styled-jsx/css';
import { CourseTaskDetails } from 'services/course';
import { DEFAULT_COLORS } from './UserSettings/userSettingsHandlers';
import { renderTagWithStyle, tagsRenderer } from 'components/Table';
import { GithubUserLink } from '../GithubUserLink';

type Props = {
  taskData: CourseTaskDetails;
  alias: string;
  isPreview?: boolean;
  onEdit?: (isTask?: boolean) => void;
};

const TaskDetails: React.FC<Props> = ({ taskData, alias, isPreview, onEdit }) => {
  const [storedTagColors] = useLocalStorage<object>('tagColors', DEFAULT_COLORS);
  const { Title, Text } = Typography;

  const {
    description,
    descriptionUrl,
    maxScore,
    name,
    scoreWeight,
    studentStartDate,
    studentEndDate,
    taskOwner,
    type,
    special,
    duration,
  } = taskData;

  return (
    <>
      <div className="container">
        <Row justify="center" align="middle" gutter={[40, 8]}>
          <Col>
            <Title>{name}</Title>
          </Col>
        </Row>

        {studentStartDate && (
          <Row justify="center" align="middle" gutter={[8, 8]}>
            <Col>
              <Title level={3}>{moment(studentStartDate).format('MMM Do YYYY HH:mm')}</Title>
            </Col>
            {studentEndDate && (
              <>
                <Col>
                  <Title level={3}>-</Title>
                </Col>
                <Col>
                  <Title level={3}>{moment(studentEndDate).format('MMM Do YYYY HH:mm')}</Title>
                </Col>
              </>
            )}
          </Row>
        )}

        {type && (
          <Row justify="center" align="middle" gutter={[24, 20]}>
            <Col>{renderTagWithStyle(type, storedTagColors)}</Col>
            {special && <Col>{!!special && tagsRenderer(special.split(','))}</Col>}
          </Row>
        )}

        {taskOwner && taskOwner.githubId && (
          <Tooltip title="Organizer">
            <Row justify="center" align="middle" gutter={[16, 16]}>
              <Col>
                <GithubUserLink value={taskOwner.githubId} />
              </Col>
            </Row>
          </Tooltip>
        )}

        {descriptionUrl && (
          <Row justify="center" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3}>
                <a href={descriptionUrl} target="_blank">
                  Task link
                </a>
              </Title>
            </Col>
          </Row>
        )}

        <Row justify="center" align="middle" gutter={[16, 16]}>
          {duration && (
            <Col>
              <Text strong>{`Duration: ${duration} hours`}</Text>
            </Col>
          )}
          {maxScore && (
            <Col>
              <Tooltip title="Score">
                <Text strong>Max score: {maxScore}</Text>
              </Tooltip>
            </Col>
          )}
          {scoreWeight && (
            <Col>
              <Text strong>Score weight: {scoreWeight}</Text>
            </Col>
          )}
        </Row>

        {description && (
          <Row justify="center" align="middle" gutter={[16, 16]}>
            <Col>
              <Tooltip title="Description">
                <Text strong>{description}</Text>
              </Tooltip>
            </Col>
          </Row>
        )}

        {!isPreview && (
          <>
            <div className="button__close">
              <Link href={`/course/schedule?course=${alias}`}>
                <a>
                  <Button icon={<CloseOutlined />} />
                </a>
              </Link>
            </div>
            <div className="button__edit">
              <Button icon={<EditOutlined />} onClick={() => onEdit && onEdit(true)} />
            </div>
          </>
        )}
      </div>
      <style jsx>{styles}</style>
    </>
  );
};

const styles = css`
  .container {
    position: relative;
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px 10px;
  }
  .button__close {
    position: absolute;
    right: 10px;
    top: 0;
  }
  .button__edit {
    position: absolute;
    left: 10px;
    top: 0;
  }
`;

export default TaskDetails;
