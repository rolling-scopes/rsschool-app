import React, { useState } from 'react';
import { Calendar, Badge } from 'antd';
import { getMonthValue, getListData } from '../utils/filters';
import { Scrollbars } from 'react-custom-scrollbars';
import { ModalWindow } from './Modal';
import { CourseEvent } from 'services/course';
import { Moment } from 'moment';

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors: object;
};


const DesktopCalendar: React.FC<Props> = ({ data, timeZone, storedTagColors }) => {
  const [modalWindowData, setModalWindowData] = useState<CourseEvent | null>(null);
  const [showWindow, setShowWindow] = useState<boolean>(false);

  const handleOnClose = () => {
    setShowWindow(false);
  };

  function showModalWindow(id: number) {
    setModalWindowData(() => {
      setShowWindow(true);
      return data.filter((event) => event.id === id)[0];
    });
  }

  const dateCellRender = (date: unknown | Moment) => {
    return (
      <Scrollbars autoHide autoHideTimeout={500} autoHideDuration={200}>
        <ul style={{ padding: '5px' }}>
          {getListData(date as unknown as Moment, data, timeZone, storedTagColors).map((coloredEvent) => {
            return (
              <li
                style={{
                  border: `1px solid ${coloredEvent.color}`,
                  borderRadius: '5px',
                  backgroundColor: `${coloredEvent.color}10`,
                  listStyleType: 'none',
                  overflowWrap: 'anywhere',
                  marginBottom: '5px',
                  padding: '0px 2px 2px 2px',
                }}
                key={coloredEvent.key}
                onClick={() => showModalWindow(coloredEvent.key)}
              >
                <Badge color={coloredEvent.color} text={coloredEvent.name} />
              </li>
            );
          })}
        </ul>
      </Scrollbars>
    );
  };

  const monthCellRender = (date: unknown | Moment) => {
    const num = getMonthValue(date as unknown as Moment, data, timeZone);

    return !!num && (
      <div>
        <span>Number of events</span>
        <section>{num}</section>
      </div>
    );
  };


  return (
    <div className="calendar-container">
      {modalWindowData &&
      <ModalWindow isOpen={showWindow} dataEvent={modalWindowData} handleOnClose={handleOnClose} timeZone={timeZone}
                   storedTagColors={storedTagColors} />
      }
      <Calendar
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
      />
    </div>
  );
};

export default DesktopCalendar;
