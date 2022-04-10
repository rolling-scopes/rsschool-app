import moment from 'moment-timezone';
import css from 'styled-jsx/css';
import Link from 'next/link';
import React from 'react';
import { Row, Col, Typography, Tooltip, Button } from 'antd';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { renderTagWithStyle, tagsRenderer } from 'components/Table';
import { TASK_TYPES_MAP } from 'data/taskTypes';
import { CourseEvent } from 'services/course';
import { GithubUserLink } from '../../GithubUserLink';
import { ScheduleSettings } from '../useScheduleSettings';

const { Title, Text } = Typography;

interface EventDetailsProps {
  eventData: CourseEvent;
  alias: string;
  isAdmin: boolean;
  isPreview?: boolean;
  onEdit?: (isTask?: boolean) => void;
  settings: ScheduleSettings;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventData, alias, isAdmin, isPreview, onEdit, settings }) => {
  const { event, dateTime, place, organizer, special, duration } = eventData;

  return (
    <>
      <div className="container">
        <Row justify="center" align="middle" gutter={[40, 8]}>
          <Col>
            <Title>{event.name}</Title>
          </Col>
        </Row>

        {dateTime && (
          <Row justify="center" align="middle" gutter={[40, 8]}>
            <Col>
              <Title level={3}>{moment(dateTime).format('MMM Do YYYY HH:mm')}</Title>
            </Col>
          </Row>
        )}

        {event.type && (
          <Row justify="center" align="middle" gutter={[24, 20]}>
            <Col>{renderTagWithStyle(event.type, settings.tagColors, TASK_TYPES_MAP)}</Col>
            {special && <Col>{!!special && tagsRenderer(special.split(','))}</Col>}
          </Row>
        )}

        {organizer && organizer.githubId && (
          <Tooltip title="Organizer">
            <Row justify="center" align="middle" gutter={[16, 16]}>
              <Col>
                <GithubUserLink value={organizer.githubId} />
              </Col>
            </Row>
          </Tooltip>
        )}

        {event.descriptionUrl && (
          <Row justify="center" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3}>
                <a href={event.descriptionUrl} target="_blank">
                  Event link
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
          {place && (
            <Col>
              <Text strong>Place: {place}</Text>
            </Col>
          )}
        </Row>

        {event.description && (
          <Row justify="center" align="middle" gutter={[16, 16]}>
            <Col>
              <Tooltip title="Description">
                <Text>{event.description}</Text>
              </Tooltip>
            </Col>
          </Row>
        )}

        {isAdmin && (
          <div className="button__edit">
            <Button icon={<EditOutlined />} onClick={() => onEdit && onEdit(false)} />
          </div>
        )}

        {!isPreview && (
          <div className="button__close">
            <Link prefetch={false} href={`/course/schedule?course=${alias}`}>
              <a>
                <Button icon={<CloseOutlined />} />
              </a>
            </Link>
          </div>
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

export default EventDetails;
