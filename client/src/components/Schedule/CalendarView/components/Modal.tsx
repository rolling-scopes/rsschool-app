import React from 'react';
import { Modal} from 'antd';
import moment from 'moment';
import {GithubUserLink} from 'components';
import { renderTag, urlRenderer } from 'components/Table/renderers';
import { EventTypeColor, EventTypeToName } from 'components/Schedule/model';
import { CourseEvent } from 'services/course';

type Props = {
  isOpen: boolean;
  dataEvent: CourseEvent;
  handleOnClose: Function;
  timeZone: string;
};

export function ModalWindow({ isOpen, dataEvent, handleOnClose, timeZone }: Props) {

  //!plug
  const newTimeZone = timeZone === 'Europe/Yekaterinburg' ? 'Asia/Yekaterinburg' : timeZone;

  return (
    <>
      <Modal
        title={dataEvent.event.name}
        centered
        footer={null}
        onOk={() => handleOnClose()}
        onCancel={() => handleOnClose()}
        visible={isOpen}
      >
        <div>Date: {moment(dataEvent.dateTime, 'YYYY-MM-DD HH:mmZ').tz(newTimeZone).format('LLL')}</div>
        {dataEvent.event.descriptionUrl &&
          <div>Url: {urlRenderer(dataEvent.event.descriptionUrl)}</div>
        }
        {dataEvent.event.description &&
          <div>{dataEvent.event.description}</div>
        }
        <div>
          {renderTag(EventTypeToName[dataEvent.event.type] || dataEvent.event.type, EventTypeColor[dataEvent.event.type as keyof typeof EventTypeColor])}
        </div>
        {!!dataEvent.organizer.githubId &&
          <div>Organizer: <GithubUserLink value={dataEvent.organizer.githubId} /></div>
        }
        <style jsx>{`
          div {
            margin-bottom: 10px;
          }
        `}</style>
      </Modal>
    </>
  );
}
