import React from 'react';
import { useLocalStorage } from 'react-use';
import { Row, Col, Typography, Tooltip } from 'antd';
import moment from 'moment-timezone';
import css from 'styled-jsx/css';
import { CourseEvent } from 'services/course';
import { DEFAULT_COLOR } from './UserSettings/userSettingsHandlers';
import { renderTagWithStyle, tagsRenderer } from 'components/Table';
import { GithubUserLink } from './GithubUserLink';

const { Title, Text } = Typography;

export function EventDetails({ eventData }: { eventData: CourseEvent }) {
  const [storedTagColors] = useLocalStorage<object>('tagColors', DEFAULT_COLOR);
  const { event, dateTime, place, organizer, special, duration } = eventData;

  return (
    <>
      {eventData && (
        <>
          <div className="container">
            <Row justify="center" align="middle" gutter={[40, 8]}>
              <Col>
                <Title>{event.name}</Title>
              </Col>
            </Row>

            <Row justify="center" align="middle" gutter={[40, 8]}>
              <Col>
                <Title level={3}>{moment(dateTime).format('MMM Do YYYY HH:mm')}</Title>
              </Col>
            </Row>

            <Row justify="center" align="middle" gutter={[24, 20]}>
              <Col>{renderTagWithStyle(event.type, storedTagColors)}</Col>
              {special && <Col>{!!special && tagsRenderer(special.split(','))}</Col>}
            </Row>

            {organizer && (
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
          </div>
          <style jsx>{styles}</style>
        </>
      )}
    </>
  );
}

const styles = css`
  .container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px 10px;
  }
`;

export default EventDetails;
