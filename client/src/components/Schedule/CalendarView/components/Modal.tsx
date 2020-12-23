import React from 'react';
import { Modal, Space } from 'antd';
import moment from 'moment';
import { GithubUserLink } from 'components';
import { renderTagWithStyle, urlRenderer } from 'components/Table/renderers';
import { CourseEvent } from 'services/course';

type Props = {
  isOpen: boolean;
  dataEvent: CourseEvent;
  handleOnClose: Function;
  timeZone: string;
  storedTagColors: object;
};

export function ModalWindow({ isOpen, dataEvent, handleOnClose, timeZone, storedTagColors }: Props) {

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
        <div>Date: {moment(dataEvent.dateTime, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('LLL')}</div>
        {dataEvent.event.description &&
        <div>{dataEvent.event.description}</div>
        }
        {!!dataEvent.organizer.githubId &&
        <div>Organizer: <GithubUserLink value={dataEvent.organizer.githubId} /></div>
        }
        <Space>
          {dataEvent.event.descriptionUrl &&
          <div>Url: {urlRenderer(dataEvent.event.descriptionUrl)}</div>
          }
          <div>
            {renderTagWithStyle(dataEvent.event.type, storedTagColors)}
          </div>
        </Space>
        <style jsx>{`
          div {
            margin-bottom: 10px;
          }
        `}</style>
      </Modal>
    </>
  );
}
