import { Button, Col, Row } from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useState } from 'react';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import ManageCsvButtons from './ManageCsvButtons';

interface SettingsPanelProps {
  isCourseManager: boolean;
  courseId: number;
  settings: ScheduleSettings;
  tags: CourseScheduleItemDtoTagEnum[];
  refreshData: () => void;
  onCreateCourseTask: () => void;
  onCopyFromCourse: () => void;
}

export function SettingsPanel({
  isCourseManager,
  onCreateCourseTask,
  onCopyFromCourse,
  courseId,
  settings,
  tags,
  refreshData,
}: SettingsPanelProps) {
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
            <Button icon={<CopyOutlined />} onClick={onCopyFromCourse}>
              Copy From
            </Button>
          </Col>
        ) : null}
        {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openManageEventModal}>
              Event
            </Button>
          </Col>
        ) : null}
        {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateCourseTask}>
              Task
            </Button>
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
}

export default SettingsPanel;
