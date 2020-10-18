import * as React from 'react';
import CommonCard from './CommonDashboardCard';
import { ScheduleOutlined, YoutubeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { CourseEvent } from 'services/course';
import { Row, Col, Tag, Typography, Tooltip, Select } from 'antd';
import { dateTimeTimeZoneRenderer } from './renderers';
import { GithubUserLink } from 'components';

type Props = {
  nextEvents: CourseEvent[];
  showCountEvents: number;
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
  lecture_online: 'online lecture',
  lecture_offline: 'offline lecture',
  lecture_mixed: 'mixed lecture',
  lecture_self_study: 'self study',
  warmup: 'warm-up',
  jstask: 'js task',
  kotlintask: 'kotlin task',
  objctask: 'objc task',
  htmltask: 'html task',
  codejam: 'code jam',
  externaltask: 'external task',
  selfeducation: 'self education',
  codewars: 'codewars',
  // TODO: Left hardcoded (codewars:stage1|codewars:stage2) configs only for backward compatibility. Delete them in the future.
  'codewars:stage1': 'codewars',
  'codewars:stage2': 'codewars',
};

export function NextEventCard(props: Props) {
  const { nextEvents, showCountEvents, setShowCountEvents } = props;

  const showCountEventsOnStudentsDashboard = Number(
    localStorage.getItem('showCountEventsOnStudentsDashboard')
      ? localStorage.getItem('showCountEventsOnStudentsDashboard')
      : 1,
  );
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const listEvents = getListEvents(nextEvents, showCountEvents, timeZone);

  return (
    <CommonCard
      title="Next event"
      icon={<ScheduleOutlined />}
      content={
        nextEvents.length ? (
          <div style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}
            >
              <Typography.Text strong>Select the number of events:</Typography.Text>
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
                  <Typography.Text strong>
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
                  </Typography.Text>
                }
              </p>
            </Tooltip>
          )}
          {nextEvent?.dateTime && (
            <p style={{ marginBottom: 7 }}>
              Date:{' '}
              <Typography.Text strong>
                {dateTimeTimeZoneRenderer(nextEvent?.dateTime, timeZone)} ({timeZone})
              </Typography.Text>
            </p>
          )}
          {nextEvent?.place && (
            <p style={{ marginBottom: 7 }}>
              Place:{' '}
              <Typography.Text strong>
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
              </Typography.Text>
            </p>
          )}
          {nextEvent?.organizer?.githubId && (
            <div style={{ marginBottom: 7 }}>
              Organizer:{' '}
              <Typography.Text strong>{<GithubUserLink value={nextEvent?.organizer.githubId} />}</Typography.Text>
            </div>
          )}
        </Col>
      </Row>
    ))
    .slice(0, showCountEvents);
