import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import FormAddEntity from './FormAddEntity';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { CourseEvent, CourseTaskDetails } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import TaskDetails from './taskDetails';
import EventDetails from './eventDetails';

const { TabPane } = Tabs;

type Props = {
  visible: boolean;
  handleCancel: () => void;
  courseId: number;
  tags: string[];
};

const ModalFormAddEntity: React.FC<Props> = ({ visible, handleCancel, courseId, tags }: Props) => {
  const [entityType, setEntityType] = useState('task');
  const [entityData, setEntityData] = useState(null);
  const { width } = useWindowDimensions();

  const onFieldsChange = (values: any) => {
    setEntityData(values);
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleCancel}
      width={
        width >= 1280 ? '45vw' : width >= 960 && width < 1280 ? '55vw' : width < 960 && width > 800 ? '65vw' : '100vw'
      }
      style={{ maxWidth: '100%', top: 10 }}
      title={
        <Tabs defaultActiveKey="1">
          <TabPane tab="Add new entity" key="1">
            <FormAddEntity
              handleCancel={handleCancel}
              onFieldsChange={onFieldsChange}
              courseId={courseId}
              tags={tags}
              entityType={entityType}
              onEntityTypeChange={setEntityType}
            />
          </TabPane>
          <TabPane tab="Preview" key="2">
            {entityType === 'task' && entityData && (
              <TaskDetails taskData={getTaskDataForPreview(entityType, entityData) as CourseTaskDetails} />
            )}
            {entityType === 'event' && entityData && (
              <EventDetails eventData={getTaskDataForPreview(entityType, entityData) as CourseEvent} />
            )}
          </TabPane>
        </Tabs>
      }
      bodyStyle={{ display: 'none' }}
      footer={false}
    />
  );
};

const getTaskDataForPreview = (entityType: string, entityData: any) => {
  if (entityType === 'task') {
    const [startDate, endDate] = entityData.range || [null, null];

    return {
      name: entityData.name,
      type: entityData.type,
      special: entityData.special ? entityData.special.join(',') : '',
      studentStartDate: startDate ? formatTimezoneToUTC(startDate, entityData.timeZone) : null,
      studentEndDate: endDate ? formatTimezoneToUTC(endDate, entityData.timeZone) : null,
      descriptionUrl: entityData.descriptionUrl,
      duration: entityData.duration,
      description: entityData.description,
      scoreWeight: entityData.scoreWeight,
      maxScore: entityData.maxScore,
      taskOwner: { githubId: entityData.organizerId },
    };
  }

  return {
    event: {
      name: entityData.name,
      type: entityData.type,
      descriptionUrl: entityData.descriptionUrl,
    },
    dateTime: formatTimezoneToUTC(entityData.dateTime, entityData.timeZone),
    organizerId: entityData.organizerId,
    place: entityData.place,
    special: entityData.special ? entityData.special.join(',') : '',
    duration: entityData.duration,
  };
};

export default ModalFormAddEntity;
