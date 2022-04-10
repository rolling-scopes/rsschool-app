import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { CourseService } from 'services/course';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import { ScheduleSettings } from '../useScheduleSettings';
import ViewModeSelect from './ViewModeSelect';
import TimezoneSelect from './TimezoneSelect';
import ManageCsvButtons from './ManageCsvButtons';
import AddEventButton from './AddEventButton';
import HidePassedEventsButton from './HidePassedEventsButton';
import HideDoneTasksButton from './HideDoneTasksButton';

interface SettingsPanelProps {
  isAdmin: boolean;
  courseId: number;
  settings: ScheduleSettings;
  eventTypes: string[];
  courseService: CourseService;
  refreshData: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isAdmin,
  courseId,
  settings,
  eventTypes,
  courseService,
  refreshData,
}) => {
  const [isManageEventModalOpen, setIsManageEventModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);

  const openManageEventModal = () => setIsManageEventModalOpen(true);
  const closeManageEventModal = () => {
    setEditableRecord(null);
    setIsManageEventModalOpen(false);
  };

  return (
    <>
      <Row justify="start" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col>
          <ViewModeSelect viewMode={settings.viewMode} setViewMode={settings.setViewMode} />
        </Col>
        <Col>
          <TimezoneSelect timezone={settings.timezone} setTimezone={settings.setTimezone} />
        </Col>
        {isAdmin && (
          <>
            <Col>
              <ManageCsvButtons
                courseId={courseId}
                courseService={courseService}
                timezone={settings.timezone}
                refreshData={refreshData}
              />
            </Col>
            <Col>
              <AddEventButton openManageEventModal={openManageEventModal} />
            </Col>
          </>
        )}
        <Col>
          <HidePassedEventsButton
            arePassedEventsHidden={settings.arePassedEventsHidden}
            setArePassedEventsHidden={settings.setArePassedEventsHidden}
          />
        </Col>
        <Col>
          <HideDoneTasksButton
            areDoneTasksHidden={settings.areDoneTasksHidden}
            setAreDoneTasksHidden={settings.setAreDoneTasksHidden}
          />
        </Col>
        <Col>
          <SettingsDrawer eventTypes={eventTypes} settings={settings} />
        </Col>
      </Row>
      {isManageEventModalOpen && (
        <ManageEventModalForm
          courseId={courseId}
          visible={isManageEventModalOpen}
          editableRecord={editableRecord}
          handleCancel={closeManageEventModal}
          refreshData={refreshData}
          settings={settings}
        />
      )}
    </>
  );
};

export default SettingsPanel;
