import React from 'react';
import { Row, Col, Typography, Tooltip } from 'antd';
import { CourseEvent } from 'services/course';

export function EventDetails({ eventData }: { eventData: CourseEvent }) {
  const { Title, Text } = Typography;

  const {
    event,
    dateTime,
    place,
    comment,
    owner,
    coordinator,
    organizer,
    detailsUrl,
    broadcastUrl,
    special,
    duration,
  } = eventData as CourseEvent;

  return (
    <>
      {eventData && (
        <>
          <div
            style={{
              margin: '20px auto',
              maxWidth: '1200px',
              padding: '20px 10px',
            }}
          >
            <Row justify="center" align="middle" gutter={[40, 8]}>
              <Col>
                <Title>{event.name}</Title>
                {owner && <Typography>Owner: {owner}</Typography>}
              </Col>
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {event.createdDate && (
                <Col>
                  <Tooltip title="Verification">
                    <Text strong>Date of creation: {event.createdDate.replace(/[a-z]/gi, ' ').slice(0, -8)}</Text>
                  </Tooltip>
                </Col>
              )}
              {event.updatedDate && (
                <Col>
                  <Text strong>Update date: {event.updatedDate.replace(/[a-z]/gi, ' ').slice(0, -8)}</Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {event.discipline && (
                <Col>
                  <Tooltip title="Verification">
                    <Text strong>Discipline: {event.discipline}</Text>
                  </Tooltip>
                </Col>
              )}
              {event.type && (
                <Col>
                  <Text>Type: {event.type.split('_').join(' ')}</Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {dateTime && (
                <Col>
                  <Text strong>When: {dateTime.replace(/[a-z]/gi, ' ').slice(0, -8)}</Text>
                </Col>
              )}
              {duration && (
                <Col>
                  <Text strong>Duration: {duration}</Text>
                </Col>
              )}
              {place && (
                <Col>
                  <Text strong>Place: {place}</Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {event.descriptionUrl && (
                <Col>
                  <Text strong>
                    <a href={event.descriptionUrl}>Description</a>
                  </Text>
                </Col>
              )}
              {broadcastUrl && (
                <Col>
                  <Text strong>
                    <a href={broadcastUrl}>Broadcast url</a>
                  </Text>
                </Col>
              )}
              {detailsUrl && (
                <Col>
                  <Text strong>
                    <a href={detailsUrl}>Details url</a>
                  </Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {event.description && (
                <Col>
                  <Text>{event.description}</Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {coordinator && (
                <Col>
                  <Text>Coordinator: {coordinator}</Text>
                </Col>
              )}
              {organizer && (
                <Col>
                  <Text>Organizer: {organizer}</Text>
                </Col>
              )}
              {special && (
                <Col>
                  <Text>Special: {special}</Text>
                </Col>
              )}
            </Row>

            <Row justify="center" align="middle" gutter={[16, 16]}>
              {comment && (
                <Col>
                  <Text>Comment: {comment}</Text>
                </Col>
              )}
            </Row>
          </div>
        </>
      )}
    </>
  );
}

export default EventDetails;
