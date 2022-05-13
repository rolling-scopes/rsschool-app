import moment from 'moment';
import Link from 'next/link';
import React from 'react';
import { Modal, Space, Typography } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import { renderTagWithStyle, urlRenderer } from 'components/Table/renderers';
import { getEventLink } from '../utils';
import { ScheduleEvent } from '../model';
import { CourseTaskDetails } from 'services/course';

const { Title, Text } = Typography;

type Props = {
  isOpen: boolean;
  data: ScheduleEvent;
  handleOnClose: Function;
  timezone: string;
  tagColors: Record<string, string>;
  alias: string;
};

const ModalWindow: React.FC<Props> = ({ isOpen, data, handleOnClose, timezone, tagColors, alias }) => {
  const typeHeader = data.category === 'task' ? 'Task:' : 'Event:';
  const title = (
    <Link href={getEventLink(alias, data.id, data.category === 'task')}>
      <a>
        <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
          {`${typeHeader} ${data.name}`}
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
        <Title level={5}>{moment(data.startDate).tz(timezone).format('MMM Do YYYY HH:mm')}</Title>
        {(data.entity as CourseTaskDetails).description && <div>{(data.entity as CourseTaskDetails).description}</div>}
        {data.organizer.githubId && (
          <div>
            Organizer: <GithubUserLink value={data.organizer.githubId} />
          </div>
        )}
        <Space>
          {(data.entity as CourseTaskDetails).descriptionUrl && (
            <div>Url: {urlRenderer((data.entity as CourseTaskDetails).descriptionUrl ?? '')}</div>
          )}
          <div>{renderTagWithStyle(data.type, tagColors)}</div>
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
