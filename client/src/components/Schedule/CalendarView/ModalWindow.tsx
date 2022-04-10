import moment from 'moment';
import Link from 'next/link';
import React from 'react';
import { Modal, Space, Typography } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import { renderTagWithStyle, urlRenderer } from 'components/Table/renderers';
import { CourseEvent } from 'services/course';
import { getEventLink } from '../utils';

const { Title, Text } = Typography;

type Props = {
  isOpen: boolean;
  data: CourseEvent;
  handleOnClose: Function;
  timezone: string;
  tagColors: Record<string, string>;
  alias: string;
};

const ModalWindow: React.FC<Props> = ({ isOpen, data, handleOnClose, timezone, tagColors, alias }) => {
  const typeHeader = data.isTask ? 'Task:' : 'Event:';
  const title = (
    <Link href={getEventLink(alias, data.id, data.isTask)}>
      <a>
        <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
          {`${typeHeader} ${data.event.name}`}
        </Text>
      </a>
    </Link>
  );

  return (
    <div>
      <Modal
        title={title}
        centered
        footer={null}
        onOk={() => handleOnClose()}
        onCancel={() => handleOnClose()}
        visible={isOpen}
      >
        <Title level={5}>{moment(data.dateTime).tz(timezone).format('MMM Do YYYY HH:mm')}</Title>
        {data.event.description && <div>{data.event.description}</div>}
        {data.organizer && data.organizer.githubId && (
          <div>
            Organizer: <GithubUserLink value={data.organizer.githubId} />
          </div>
        )}
        <Space>
          {data.event.descriptionUrl && <div>Url: {urlRenderer(data.event.descriptionUrl)}</div>}
          <div>{renderTagWithStyle(data.event.type, tagColors)}</div>
        </Space>
        <style jsx>{`
          div {
            margin-bottom: 10px;
          }
        `}</style>
      </Modal>
    </div>
  );
};

export default ModalWindow;
