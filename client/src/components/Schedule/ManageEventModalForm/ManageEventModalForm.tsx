import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Modal, Tabs } from 'antd';
import useWindowDimensions from 'utils/useWindowDimensions';
import { CourseEvent, CourseTaskDetails } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { ScheduleSettings } from '../useScheduleSettings';
import { TaskDetails, EventDetails } from '../EventDetails';
import ManageEventForm from './ManageEventForm';

const { TabPane } = Tabs;

interface ManageEventModalFormProps {
  visible: boolean;
  handleCancel: () => void;
  courseId: number;
  editableRecord?: CourseEvent | null;
  refreshData: Function;
  settings: ScheduleSettings;
}

const ManageEventModalForm: React.FC<ManageEventModalFormProps> = ({ visible, handleCancel, courseId, editableRecord, refreshData, settings }) => {
  const router = useRouter();
  const { course } = router.query;
  const alias = Array.isArray(course) ? course[0] : course;

  const initialEntityType = (editableRecord && (editableRecord.isTask ? 'task' : 'event')) || 'task';
  const [entityType, setEntityType] = useState(initialEntityType);
  const [entityData, setEntityData] = useState(null);
  const { width } = useWindowDimensions();

  const onFieldsChange = (values: any) => {
    setEntityData(values);
  };

  if (!alias) {
    return null;
  }

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
            <ManageEventForm
              handleCancel={handleCancel}
              onFieldsChange={onFieldsChange}
              courseId={courseId}
              entityType={entityType}
              onEntityTypeChange={setEntityType}
              editableRecord={editableRecord}
              refreshData={refreshData}
            />
          </TabPane>
          <TabPane tab="Preview" key="2">
            {entityType === 'task' && entityData && (
              <TaskDetails
                taskData={getEntityDataForPreview(entityType, entityData) as CourseTaskDetails}
                settings={settings}
                alias={alias}
                isPreview
                isAdmin
              />
            )}
            {entityType === 'event' && entityData && (
              <EventDetails
                eventData={getEntityDataForPreview(entityType, entityData) as CourseEvent}
                settings={settings}
                alias={alias}
                isPreview
                isAdmin
              />
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
      taskOwner: entityData.taskOwner,
      githubPrRequired: entityData.githubPrRequired,
      sourceGithubRepoUrl: entityData.sourceGithubRepoUrl,
      githubRepoName: entityData.githubRepoName,
      checker: entityData.checker,
      pairsCount: entityData.pairsCount,
    };
  }

  return {
    event: {
      name: entityData.name,
      type: entityData.type,
      descriptionUrl: entityData.descriptionUrl,
      description: entityData.description,
    },
    dateTime: entityData.dateTime ? formatTimezoneToUTC(entityData.dateTime, entityData.timeZone) : null,
    organizer: entityData.organizer,
    place: entityData.place,
    special: entityData.special ? entityData.special.join(',') : '',
    duration: entityData.duration,
  };
};

export default ManageEventModalForm;
