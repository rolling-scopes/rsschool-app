import { Col, Row } from 'antd';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useState } from 'react';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import { AddEventButton } from './AddEventButton';
import ManageCsvButtons from './ManageCsvButtons';

interface SettingsPanelProps {
  isCourseManager: boolean;
  courseId: number;
  settings: ScheduleSettings;
  tags: CourseScheduleItemDtoTagEnum[];
  refreshData: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isCourseManager, courseId, settings, tags, refreshData }) => {
  const [isManageEventModalOpen, setIsManageEventModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);

  const openManageEventModal = () => setIsManageEventModalOpen(true);
  const closeManageEventModal = () => {
    setEditableRecord(null);
    setIsManageEventModalOpen(false);
  };

  return (
    <>
      <Row justify="end" gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <SettingsDrawer tags={tags} settings={settings} />
        </Col>
        {isCourseManager ? (
          <Col>
            <ManageCsvButtons courseId={courseId} timezone={settings.timezone} refreshData={refreshData} />
          </Col>
        ) : null}
        {isCourseManager ? (
          <Col>
            <AddEventButton onClick={openManageEventModal} />
          </Col>
        ) : null}
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
