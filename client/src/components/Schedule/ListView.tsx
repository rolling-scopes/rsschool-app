import React, { useMemo, useState } from 'react';
import { Collapse, Badge, Button, Row, Typography, Col, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import css from 'styled-jsx/css';
import moment from 'moment-timezone';
import { CourseEvent } from 'services/course';
import { dateWithTimeZoneRenderer, renderTagWithStyle } from 'components/Table';
import Link from 'next/link';

const { Panel } = Collapse;
const { Text } = Typography;

const LAST_WEEK_DAY = 6;
const currentDayColor = '#ffd591';
const previuosDaysColor = '#fff1f0';
const nextDaysColor = '#d9f7be';
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekLength = WEEK.length;

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors?: object;
  alias: string;
};

export const ListView: React.FC<Props> = ({ data, timeZone, storedTagColors, alias }) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const currentDayKey = useMemo(() => {
    const day = moment().day();
    const currentDay = day ? day - 1 : LAST_WEEK_DAY;
    const date = moment().format('YYYYMMDD');
    const todaysEvents = data.filter(({ dateTime }) => date === moment(dateTime).tz(timeZone).format('YYYYMMDD'));

    if (todaysEvents.length === 0) {
      return [];
    }

    return `${WEEK[currentDay]}0`;
  }, [data, timeZone]);

  const startEndWeekLabel = useMemo(() => {
    const startAndEnd = getStartAndEndWeekTime(currentWeek, timeZone);
    return `${startAndEnd[0].format('D MMM')} - ${startAndEnd[1].format('D MMM')}`;
  }, [currentWeek, timeZone]);

  const handleClickBack = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const handleClickForward = () => {
    setCurrentWeek(currentWeek + 1);
  };

  return (
    <div className="List">
      <Row justify="center" align="middle" gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col>
          <Tooltip title="Previous week">
            <Button shape="circle" icon={<LeftOutlined />} size="large" onClick={handleClickBack} />
          </Tooltip>
        </Col>
        <Col>
          <Text strong>{startEndWeekLabel}</Text>
        </Col>
        <Col>
          <Tooltip title="Next week">
            <Button shape="circle" icon={<RightOutlined />} size="large" onClick={handleClickForward} />
          </Tooltip>
        </Col>
      </Row>
      <Collapse defaultActiveKey={currentDayKey}>
        {getWeekElements(data, currentWeek, timeZone, alias, storedTagColors)}
      </Collapse>
      <style jsx>{listStyles}</style>
    </div>
  );
};

const getStartAndEndWeekTime = (currentWeek: number, timeZone: string) => {
  const dayOfSelectedWeek = moment()
    .tz(timeZone)
    .add(currentWeek * weekLength, 'days');
  const startWeek = dayOfSelectedWeek.clone().startOf('isoWeek');
  const endWeek = dayOfSelectedWeek.clone().endOf('isoWeek');

  return [startWeek, endWeek];
};

const isCurrentWeek = (date: string, timeZone: string, currentWeek: number) => {
  const startAndEnd = getStartAndEndWeekTime(currentWeek, timeZone);
  const milliseconds = moment(date).tz(timeZone).valueOf();

  return milliseconds >= startAndEnd[0].valueOf() && milliseconds < startAndEnd[1].valueOf();
};

const panelClassName = (dayOfWeek: number, currentWeek: number) => {
  const today = moment().day();

  if (currentWeek < 0 || (currentWeek === 0 && dayOfWeek < today)) {
    return { backgroundColor: previuosDaysColor };
  }

  if (currentWeek > 0 || (currentWeek === 0 && dayOfWeek > today)) {
    return { backgroundColor: nextDaysColor };
  }

  if (dayOfWeek === today) {
    return { backgroundColor: currentDayColor };
  }

  return {};
};

const mapToWeek = (events: CourseEvent[], timeZone: string) => {
  const weekMap = new Array(weekLength).fill([]);

  events.forEach((event: CourseEvent) => {
    let eventDay = moment(event.dateTime).tz(timeZone).day();

    if (eventDay === 0) {
      eventDay = LAST_WEEK_DAY;
    } else {
      eventDay -= 1;
    }

    if (weekMap[eventDay].length) {
      weekMap[eventDay].push(event);
    } else {
      const dayMap = [];

      dayMap.push(event);
      weekMap[eventDay] = dayMap;
    }
  });

  return weekMap;
};

const getDayEvents = (events: CourseEvent[], timeZone: string, alias: string, storedTagColors?: object) => {
  return events.map((data: CourseEvent) => {
    const { id, event, dateTime, isTask } = data;
    const { type, name } = event;

    return (
      <tbody key={id}>
        <tr>
          <th style={{ width: '10%' }}>{dateWithTimeZoneRenderer(timeZone, 'HH:mm')(dateTime)}</th>
          <th style={{ width: '10%' }}>{renderTagWithStyle(type, storedTagColors)}</th>
          <th style={{ width: '80%' }}>
            <Link
              href={`/course/entity-details?course=${alias}&entityType=${isTask ? 'task' : 'event'}&entityId=${id}`}
            >
              <a>
                <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
                  {name}
                </Text>
              </a>
            </Link>
          </th>
        </tr>
        <style jsx>{tableStyles}</style>
      </tbody>
    );
  });
};

const getWeekElements = (
  events: CourseEvent[],
  selectedWeek: number,
  timeZone: string,
  alias: string,
  storedTagColors?: object,
) => {
  const currentWeek = events.filter((event: CourseEvent) => isCurrentWeek(event.dateTime, timeZone, selectedWeek));
  const weekMap = mapToWeek(currentWeek, timeZone);
  const dayOfSelectedWeek = moment()
    .tz(timeZone)
    .add(selectedWeek * weekLength, 'days');
  const firstDayofSelectedWeek = dayOfSelectedWeek.clone().startOf('isoWeek');

  return weekMap.map((eventsPerDay: CourseEvent[], index: number) => {
    const eventCount = eventsPerDay.length;
    const dayDate = firstDayofSelectedWeek.clone().add(index, 'day').format('Do MMMM');

    const eventCountElem = (
      <Badge count={eventCount}>
        <span style={{ marginRight: '15px' }}>{`${WEEK[index]} - ${dayDate}`}</span>
      </Badge>
    );
    const style = panelClassName(index + 1, selectedWeek);
    const key = `${WEEK[index]}${selectedWeek}`;

    if (eventCount) {
      return (
        <Panel style={style} header={eventCountElem} key={key}>
          <table className="ListTable">
            {getDayEvents(eventsPerDay, timeZone, alias, storedTagColors)}
            <style jsx>{tableStyles}</style>
          </table>
        </Panel>
      );
    }

    return <Panel style={style} header={eventCountElem} key={key} collapsible="disabled" />;
  });
};

const listStyles = css`
  .List {
    margin: 0 auto;
    max-width: 500px;
  }
`;

const tableStyles = css`
  .ListTable {
    border-collapse: collapse;
    margin: 0 auto;
    width: 100%;
  }

  .ListTable th {
    border-bottom: 1px solid #f0f0f0;
    padding: 5px 20px;
    text-align: center;
  }

  .ListTable tr:hover {
    background-color: #f2f2f2;
  }
`;

export default ListView;
