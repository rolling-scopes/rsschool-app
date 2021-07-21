import React, { useState } from 'react';
import { Calendar, List, Typography, Col, Button } from 'antd';
import { getMonthValue, getListData } from '../utils/filters';
import ModalWindow from './ModalWindow';
import { CourseEvent } from 'services/course';
import { Moment } from 'moment';
import { dateWithTimeZoneRenderer, renderTagWithStyle } from 'components/Table';
import { css } from 'styled-jsx/css';

const { Text } = Typography;

const numberEventsStyle = css`
  section {
    position: absolute;
    bottom: 12px;
    background: #fb6216;
    right: -13px;
    border-radius: 100%;
    width: 20px;
    height: 20px;
    line-height: 19px;
    color: white;
  }
`;

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors?: object;
  alias: string;
};

const MobileCalendar: React.FC<Props> = ({ data, timeZone, storedTagColors, alias }) => {
  const [modalWindowData, setModalWindowData] = useState<
    { color: string; name: string; key: number; time: string; type: string }[] | undefined
  >();
  const [currentItem, setCurrentItem] = useState<CourseEvent | null>(null);
  const [showWindow, setShowWindow] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<string>('month');

  const handleOnClose = () => {
    setShowWindow(false);
  };

  function showModalWindow(id: number) {
    setCurrentItem(() => {
      setShowWindow(true);
      return data.filter(event => event.id === id)[0];
    });
  }

  function onSelect(date: unknown | Moment) {
    if (calendarMode === 'month') {
      setModalWindowData(getListData(date as unknown as Moment, data, timeZone, storedTagColors));
    }
  }

  function onPanelChange(_: any, mode: string) {
    setCalendarMode(mode);
    setModalWindowData([]);
  }

  function dateCellRender(date: unknown | Moment) {
    const numberEvents = getListData(date as unknown as Moment, data, timeZone, storedTagColors).length;
    return (
      !!(numberEvents > 0) && (
        <>
          <section>{numberEvents}</section>
          <style jsx>{numberEventsStyle}</style>
        </>
      )
    );
  }

  const monthCellRender = (date: unknown | Moment) => {
    const numberEvents = getMonthValue(date as unknown as Moment, data, timeZone);
    return (
      !!numberEvents && (
        <>
          <section>{numberEvents}</section>
          <style jsx>{numberEventsStyle}</style>
        </>
      )
    );
  };

  return (
    <>
      <Calendar
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
        fullscreen={false}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
      />
      <List
        dataSource={modalWindowData}
        renderItem={item => {
          if (!data.length) return null;
          const dateTime = data.filter(event => event.id === item.key)[0].dateTime;
          return (
            <List.Item
              actions={[
                <Button onClick={() => showModalWindow(item.key)} type="link">
                  more
                </Button>,
              ]}
            >
              <Col>
                <Text style={{ marginRight: '8px' }} strong>
                  {dateWithTimeZoneRenderer(timeZone, 'HH:mm')(dateTime)}
                </Text>
                {renderTagWithStyle(item.type, storedTagColors)}
                <Text strong>{item.name}</Text>
              </Col>
            </List.Item>
          );
        }}
      />
      {currentItem && (
        <ModalWindow
          isOpen={showWindow}
          data={currentItem}
          handleOnClose={handleOnClose}
          timeZone={timeZone}
          storedTagColors={storedTagColors}
          alias={alias}
        />
      )}
    </>
  );
};

export default MobileCalendar;
