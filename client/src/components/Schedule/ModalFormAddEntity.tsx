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
  typesFromBase: string[];
  editableRecord?: CourseEvent | null;
};

const ModalFormAddEntity: React.FC<Props> = ({ visible, handleCancel, courseId, typesFromBase, editableRecord }) => {
  const initialEntityType = (editableRecord && (editableRecord.isTask ? 'task' : 'event')) || 'task';
  const [entityType, setEntityType] = useState(initialEntityType);
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
          <TabPane tab="New entity" key="1">
            <FormAddEntity
              handleCancel={handleCancel}
              onFieldsChange={onFieldsChange}
              courseId={courseId}
              typesFromBase={typesFromBase}
              entityType={entityType}
              onEntityTypeChange={setEntityType}
              editableRecord={editableRecord}
            />
          </TabPane>
          <TabPane tab="Preview" key="2">
            {entityType === 'task' && entityData && (
              <TaskDetails taskData={getEntityDataForPreview(entityType, entityData) as CourseTaskDetails} />
            )}
            {entityType === 'event' && entityData && (
              <EventDetails eventData={getEntityDataForPreview(entityType, entityData) as CourseEvent} />
            )}
          </TabPane>
        </Tabs>
      }
      bodyStyle={{ display: 'none' }}
      footer={false}
    />
  );
};

const getEntityDataForPreview = (entityType: string, entityData: any) => {
  if (!entityData) {
    return {};
  }

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
    dateTime: entityData.dateTime ? formatTimezoneToUTC(entityData.dateTime, entityData.timeZone) : null,
    organizerId: entityData.organizerId,
    place: entityData.place,
    special: entityData.special ? entityData.special.join(',') : '',
    duration: entityData.duration,
  };
};

export default ModalFormAddEntity;
