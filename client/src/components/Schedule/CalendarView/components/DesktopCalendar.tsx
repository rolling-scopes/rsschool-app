import React, { useState } from 'react';
import { Calendar, Badge, Typography, Tooltip } from 'antd';
import { getMonthValue, getListData } from '../utils/filters';
import { Scrollbars } from 'react-custom-scrollbars';
import ModalWindow from './ModalWindow';
import { CourseEvent } from 'services/course';
import { Moment } from 'moment';

const { Title } = Typography;

type Props = {
  data: CourseEvent[];
  timeZone: string;
  storedTagColors?: object;
  alias: string;
};

const DesktopCalendar: React.FC<Props> = ({ data, timeZone, storedTagColors, alias }) => {
  const [modalWindowData, setModalWindowData] = useState<CourseEvent | null>(null);
  const [showWindow, setShowWindow] = useState<boolean>(false);

  const handleOnClose = () => {
    setShowWindow(false);
  };

  function showModalWindow(id: number) {
    setModalWindowData(() => {
      setShowWindow(true);
      return data.filter(event => event.id === id)[0];
    });
  }

  const dateCellRender = (date: unknown | Moment) => {
    return (
      <Scrollbars autoHide autoHideTimeout={500} autoHideDuration={200}>
        <ul style={{ padding: '5px' }}>
          {getListData(date as unknown as Moment, data, timeZone, storedTagColors).map(coloredEvent => {
            return (
              <Tooltip title={coloredEvent.time}>
                <li
                  style={{
                    border: `1px solid ${coloredEvent.color}`,
                    borderRadius: '5px',
                    backgroundColor: `${coloredEvent.color}10`,
                    listStyleType: 'none',
                    overflowWrap: 'anywhere',
                    marginBottom: '5px',
                    padding: '0px 2px 2px',
                  }}
                  key={coloredEvent.key}
                  onClick={() => showModalWindow(coloredEvent.key)}
                >
                  <Badge color={coloredEvent.color} text={coloredEvent.name} />
                </li>
              </Tooltip>
            );
          })}
        </ul>
      </Scrollbars>
    );
  };

  const monthCellRender = (date: unknown | Moment) => {
    const num = getMonthValue(date as unknown as Moment, data, timeZone);

    return !!num && <Title level={5} style={{ textAlign: 'center' }}>{`Events & tasks: ${num}.`}</Title>;
  };

  return (
    <div className="calendar-container">
      {modalWindowData && (
        <ModalWindow
          isOpen={showWindow}
          data={modalWindowData}
          handleOnClose={handleOnClose}
          timeZone={timeZone}
          storedTagColors={storedTagColors}
          alias={alias}
        />
      )}
      <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
    </div>
  );
};

export default DesktopCalendar;
