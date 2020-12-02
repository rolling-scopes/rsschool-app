import React, { useState} from 'react';
import { Calendar, Badge, List } from 'antd';
import { getMonthValue } from '../utils/DateFuncs';
import {ModalWindow} from './Modal';
import { getListData } from '../utils/DataFuncs';
import { CourseEvent } from 'services/course';
import { Moment } from 'moment';
import {dateWithTimeZoneRenderer} from 'components/Table';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

const MobileCalendar: React.FC<Props> = ({ data, timeZone }) => {
  const [modalWindowData, setModalWindowData] = useState<{color: string, name: string, key: number}[] | undefined>();
  const [currentItem, setCurrentItem] = useState<CourseEvent | null>(null);
  const [showWindow, setShowWindow] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<string>('month');

  const handleOnClose = () => {
    setShowWindow(false);
  };

  function showModalWindow(id: number) {
    setCurrentItem(() => {
      setShowWindow(true);
      return data.filter((event) => event.id === id)[0];
    })
  }

  function onSelect(date: unknown | Moment) {
    if (calendarMode === 'month') {
      setModalWindowData(getListData(date as unknown as Moment, data, timeZone));
    }
  }

  function onPanelChange(_: any, mode: string) {
    setCalendarMode(mode);
    setModalWindowData([]);
  }

  function dateCellRender(date: unknown | Moment) {
    const numberEvents = getListData(date as unknown as Moment, data, timeZone).length;
    return numberEvents > 0 ? (
      <>
        <section>{numberEvents}</section>
        <style jsx>
          {`section {
            position: absolute;
            bottom: 12px;
            background: #FB6216;
            right: -13px;
            border-radius: 100%;
            width: 20px;
            height: 20px;
            line-height: 20px;
            color: white;
          }`}
        </style>
      </>
    ) : null;
  }

  const monthCellRender = (date: unknown | Moment) => {
    const num = getMonthValue(date as unknown as Moment, data, timeZone);
    return num ? (
      <>
      <section>{num}</section>
      <style jsx>
          {`
            section {
              position: absolute;
              bottom: 12px;
              background: #FB6216;
              right: -13px;
              border-radius: 100%;
              width: 20px;
              height: 20px;
              line-height: 20px;
              color: white;
            }
          `}
        </style>
      </>
    ) : null;
  }

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
          const dateTime = data.filter((event) => event.id === item.key)[0].dateTime;
          return (
          <List.Item
            actions={[<a onClick={() => showModalWindow(item.key)}>more</a>]}
          >
            <List.Item.Meta
              title={<Badge style={{paddingLeft: 8, paddingRight: 10}} color={item.color} text={item.name} />}
            />
            <div><b>Time:</b> {dateWithTimeZoneRenderer(timeZone, 'h:mm')(dateTime)}</div>
          </List.Item>
        )
      }}/>
      { currentItem &&
        <ModalWindow isOpen={showWindow} dataEvent={currentItem} handleOnClose={handleOnClose} timeZone={timeZone} />
      }
    </>
  );
}

export default MobileCalendar;
