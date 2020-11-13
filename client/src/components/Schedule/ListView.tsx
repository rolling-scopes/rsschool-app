import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { Collapse, Tag, Badge, Spin, Button, Row, Typography, Col, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import { CourseEvent } from 'services/course';
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// import { getTagColorByEventType, getFormatTime } from '../../helpers/schedule-utils';
// import { TaskType } from '../../constants/settings';

import css from 'styled-jsx/css';

const { Panel } = Collapse;

const weekLength = WEEK.length;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

const getStartAndEndWeekTime = (currentWeek: number) => {
  const dateNow = 1586250152000;
  // поменять на Date.now()
  const now = new Date(dateNow + currentWeek * weekLength * millisecondsPerDay);
  let day = now.getDay();
  if (day === 0) {
    day = 7;
  }

  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  const startWeek = now.getTime() - millisecondsPerDay * (day - 1);
  const endWeek = now.getTime() + millisecondsPerDay * (weekLength - day + 1) - 1;

  return [startWeek, endWeek];
};

const isCurrentWeek = (date: string, currentWeek: number) => {
  const startAndEnd = getStartAndEndWeekTime(currentWeek);
  const milliseconds = Date.parse(date);
  return milliseconds > startAndEnd[0] && milliseconds < startAndEnd[1];
};

const panelClassName = (daySelected: number, currentWeek: number) => {
  const now = new Date(Date.now());
  let dayNow = now.getDay();
  if (dayNow === 0) {
    dayNow = 7;
  }

  if (currentWeek > 0) {
    return { backgroundColor: '#d9f7be' };
  }
  if (currentWeek < 0) {
    return { backgroundColor: '#fff1f0', opacity: '0.5' };
  }
  if (dayNow > daySelected) {
    return { backgroundColor: '#fff1f0', opacity: '0.5' };
  }
  if (dayNow < daySelected) {
    return { backgroundColor: '#d9f7be' };
  }
  if (dayNow === daySelected) {
    return { backgroundColor: '#ffd591' };
  }

  return {};
};

const mapToWeek = (events: CourseEvent[]) => {
  const weekMap = new Array(weekLength).fill([]);

  events.forEach((event: CourseEvent) => {
    const time = Date.parse(event.dateTime);
    const date = new Date(time);
    let eventDay = date.getDay();

    if (eventDay === 0) {
      eventDay = 6;
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

const getFormatTime = (dateNumb: number, timeZone: number): string => {
  const date = new Date(dateNumb + timeZone * 3600 * 1000);
  const hour = `${date.getUTCHours()}`.padStart(2, '0');
  const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');

  return `${hour}:${minutes}`;
};

const dayEvents = (events: CourseEvent[], timeZone: number) => {
  return events.map((data: CourseEvent) => {
    const { id, event, dateTime } = data;
    const { type, name } = event;
    // const color = getTagColorByEventType(type as TaskType);
    const color = 'red';
    // const eventCopy = { ...event };
    const eventTime = getFormatTime(Date.parse(dateTime), timeZone);
    return (
      <tbody key={id}>
        <tr>
          <th style={{ width: '15%' }}>{eventTime}</th>
          <th style={{ width: '15%' }}>
            <Tag color={color}>{type}</Tag>
          </th>
          <th style={{ width: '70%' }}>
            <span>{name}</span>
            {/*<Link to={{ pathname: `/task/${id}`, state: { event: eventCopy } }}>{name}</Link>*/}
          </th>
        </tr>
        <style jsx>{tableStyles}</style>
      </tbody>
    );
  });
};

const weekElements = (events: CourseEvent[], currentWeekCount: number, timeZone: number) => {
  const currentWeek = events.filter((event: CourseEvent) => isCurrentWeek(event.dateTime, currentWeekCount));
  const weekMap = mapToWeek(currentWeek);
  const currentDate = Date.now();

  return weekMap.map((event: CourseEvent[], index: number) => {
    const eventCount = event.length;
    const eventCountElem = (
      <Badge count={eventCount}>
        <span style={{ marginRight: '10px' }}>{WEEK[index]}</span>
      </Badge>
    );
    const style = panelClassName(index + 1, currentWeekCount);
    const key = currentDate + index;

    if (event.length) {
      return (
        <Panel style={style} header={eventCountElem} key={key}>
          <table className={'ListTable'}>
            {dayEvents(event, timeZone)}
            <style jsx>{tableStyles}</style>
          </table>
        </Panel>
      );
    }

    return <Panel style={style} header={eventCountElem} key={key} disabled />;
  });
};

type Props = {
  data: any;
  timeZone: string;
};

const ScheduleList = ({ data }: Props): React.ReactElement => {
  const { Text } = Typography;
  const [currentWeek, setCurrentWeek] = useState(0);

  const [startWeekDate, setStartWeekDate] = useState('');
  const [endWeekDate, setEndWeekDate] = useState('');
  // const {
  //   settings: {
  //     settings: { timeZone },
  //   },
  // } = useStores();
  const timeZone = 3;

  useEffect(() => {
    const startAndEnd = getStartAndEndWeekTime(currentWeek);
    const startWeek = new Date(startAndEnd[0]);
    const endWeek = new Date(startAndEnd[1]);
    const startWeekText = `${startWeek.getDate()} ${MONTHS[startWeek.getMonth()]}`;
    const endWeekText = `${endWeek.getDate()} ${MONTHS[endWeek.getMonth()]}`;

    setStartWeekDate(startWeekText);
    setEndWeekDate(endWeekText);
  }, [currentWeek]);

  const handleClickBack = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const handleClickForward = () => {
    setCurrentWeek(currentWeek + 1);
  };

  if (data === null) return <Spin tip="Loading..." size="large" />;

  return (
    <div className={'List'}>
      <Row justify="center" align="middle" gutter={[16, 16]}>
        <Col>
          <Tooltip title="Previous week">
            <Button shape="circle" icon={<LeftOutlined />} onClick={handleClickBack} />
          </Tooltip>
        </Col>
        <Col>
          <Text strong>{`${startWeekDate} - ${endWeekDate}`}</Text>
        </Col>
        <Col>
          <Tooltip title="Next week">
            <Button shape="circle" icon={<RightOutlined />} onClick={handleClickForward} />
          </Tooltip>
        </Col>
      </Row>
      <Collapse style={{ margin: '0 auto', maxWidth: '500px' }}>{weekElements(data, currentWeek, timeZone)}</Collapse>
      <style jsx>{listStyles}</style>
    </div>
  );
};

const listStyles = css`
  .List {
    padding: 0 100px;
  }

  @media (max-width: 600px) {
    .List {
      padding: 0;
    }
  }
`;

const tableStyles = css`
  .ListTable {
    border-collapse: collapse;
    margin: 0 auto;
    width: 100%;

    th {
      border-bottom: 1px solid #f0f0f0;
      padding: 5px 20px;
      text-align: center;
      cursor: pointer;
    }

    tr:hover {
      background-color: #fcc;
    }
  }
`;

export default ScheduleList;
