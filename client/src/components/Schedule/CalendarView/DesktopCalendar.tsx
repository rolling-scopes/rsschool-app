import { Moment } from 'moment';
import React, { useState } from 'react';
import { Calendar, Badge, Typography, Tooltip } from 'antd';
import { getMonthValue, getListData } from './utils';
import ModalWindow from './ModalWindow';
import { ScheduleEvent } from '../model';

const { Title } = Typography;

type Props = {
  data: ScheduleEvent[];
  timezone: string;
  tagColors: Record<string, string>;
  alias: string;
};

const DesktopCalendar: React.FC<Props> = ({ data, timezone, tagColors, alias }) => {
  const [modalWindowData, setModalWindowData] = useState<ScheduleEvent | null>(null);
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
      <div>
        <ul style={{ padding: '5px' }}>
          {getListData(date as unknown as Moment, data, timezone, tagColors).map(coloredEvent => {
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
      </div>
    );
  };

  const monthCellRender = (date: unknown | Moment) => {
    const num = getMonthValue(date as unknown as Moment, data, timezone);

    return !!num && <Title level={5} style={{ textAlign: 'center' }}>{`Events & tasks: ${num}.`}</Title>;
  };

  return (
    <div className="calendar-container">
      {modalWindowData && (
        <ModalWindow
          isOpen={showWindow}
          data={modalWindowData}
          handleOnClose={handleOnClose}
          timezone={timezone}
          tagColors={tagColors}
          alias={alias}
        />
      )}
      <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
    </div>
  );
};

export default DesktopCalendar;
