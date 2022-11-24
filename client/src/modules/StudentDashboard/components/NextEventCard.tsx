import * as React from 'react';
import { useLocalStorage } from 'react-use';
import CommonCard from './CommonDashboardCard';
import { YoutubeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { CourseEvent } from 'services/course';
import { Row, Col, Tag, Typography, Tooltip, Select } from 'antd';
import { dateTimeTimeZoneRenderer } from './renderers';
import { GithubUserLink } from 'components/GithubUserLink';
import { TASK_TYPES } from 'data/taskTypes';
import { EVENT_TYPES } from 'data/eventTypes';

const { Link, Text } = Typography;

type Props = {
  nextEvents: CourseEvent[];
  showCountEvents: number;
  courseAlias: string;
  setShowCountEvents: (count: number) => void;
};

const COUNT_EVENTS_LIST = [1, 2, 3, 5, 10];

const EventTypeColor: Record<string, string> = {
  deadline: 'red',
  test: '#63ab91',
  jstask: 'green',
  htmltask: 'green',
  externaltask: 'green',
  selfeducation: 'green',
  codewars: 'green',
  codejam: 'green',
  newtask: 'green',
  lecture: 'blue',
  lecture_online: 'blue',
  lecture_offline: 'blue',
  lecture_mixed: 'blue',
  lecture_self_study: 'blue',
  info: '#ff7b00',
  warmup: '#63ab91',
  meetup: '#bde04a',
  workshop: '#bde04a',
  interview: '#63ab91',
};

const EventTypeToName: Record<string, string> = {
  ...EVENT_TYPES.reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {} as Record<string, string>),
  ...TASK_TYPES.reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {} as Record<string, string>),
};

const STORAGE_KEY = 'showCountEventsOnStudentsDashboard';

export function NextEventCard({ nextEvents, showCountEvents, setShowCountEvents, courseAlias }: Props) {
  const [storageValue] = useLocalStorage(STORAGE_KEY);

  const showCountEventsOnStudentsDashboard = Number(storageValue ? storageValue : 1);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const listEvents = getListEvents(nextEvents, showCountEvents, timeZone);

  return (
    <CommonCard
      title="Available Tasks"
      extra={<Link href={`/course/schedule?course=${courseAlias}`}>View all</Link>}
      content={
        nextEvents.length ? (
          <div style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}
            >
              <Text strong>Select the number of events:</Text>
              <Select onChange={setShowCountEvents} defaultValue={showCountEventsOnStudentsDashboard}>
                {COUNT_EVENTS_LIST.map((count, idx) => (
                  <Select.Option key={idx} value={count}>
                    {count}
                  </Select.Option>
                ))}
              </Select>
            </div>
            {listEvents}
          </div>
        ) : undefined
      }
    />
  );
}

const getListEvents = (nextEvents: CourseEvent[], showCountEvents: number, timeZone: string) =>
  nextEvents
    .map((nextEvent, idx) => (
      <Row
        key={`event-${idx}`}
        style={{
          marginTop: '10px',
          paddingBottom: '10px',
          borderBottom: showCountEvents > 1 && idx !== showCountEvents - 1 ? '1px solid #f0f0f0' : '',
        }}
      >
        <Col>
          <p style={{ marginBottom: 7 }}>
            Type:{' '}
            <Tag color={EventTypeColor[nextEvent.event.type]}>
              {EventTypeToName[nextEvent.event.type] || nextEvent.event.type}
            </Tag>
          </p>
          {nextEvent?.event?.name && (
            <Tooltip title={nextEvent?.comment ? nextEvent?.comment : null}>
              <p style={{ marginBottom: 7 }}>
                Name:{' '}
                {
                  <Text strong>
                    {nextEvent?.event?.descriptionUrl ? (
                      <a target="_blank" href={nextEvent?.event?.descriptionUrl}>
                        {nextEvent?.event?.name}
                      </a>
                    ) : nextEvent?.broadcastUrl ? (
                      <a target="_blank" href={nextEvent?.broadcastUrl}>
                        {nextEvent?.event?.name}
                      </a>
                    ) : (
                      nextEvent?.event?.name
                    )}
                  </Text>
                }
              </p>
            </Tooltip>
          )}
          {nextEvent?.dateTime && (
            <p style={{ marginBottom: 7 }}>
              Date:{' '}
              <Text strong>
                {dateTimeTimeZoneRenderer(nextEvent?.dateTime, timeZone)} ({timeZone})
              </Text>
            </p>
          )}
          {nextEvent?.place && (
            <p style={{ marginBottom: 7 }}>
              Place:{' '}
              <Text strong>
                {nextEvent?.place.includes('Youtube') ? (
                  <span>
                    <YoutubeOutlined /> {nextEvent?.place}{' '}
                    <Tooltip title="Ссылка будет в Discord">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                ) : (
                  nextEvent?.place
                )}
              </Text>
            </p>
          )}
          {nextEvent?.organizer?.githubId && (
            <div style={{ marginBottom: 7 }}>
              Organizer: <Text strong>{<GithubUserLink value={nextEvent?.organizer.githubId} />}</Text>
            </div>
          )}
        </Col>
      </Row>
    ))
    .slice(0, showCountEvents);
