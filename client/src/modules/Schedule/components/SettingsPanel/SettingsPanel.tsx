import { Button, Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useState } from 'react';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import { AdditionalActions } from './AdditionalActions';

interface SettingsPanelProps {
  isCourseManager: boolean;
  courseId: number;
  courseAlias: string;
  settings: ScheduleSettings;
  calendarToken: string;
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
  courseAlias,
  settings,
  calendarToken,
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
      <Row justify="end" gutter={[16, 16]}>
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
        <Col>
          <SettingsDrawer tags={tags} settings={settings} />
        </Col>
        <Col>
          <AdditionalActions
            isCourseManager={isCourseManager}
            courseId={courseId}
            timezone={settings.timezone}
            calendarToken={calendarToken}
            courseAlias={courseAlias}
            onCopyFromCourse={onCopyFromCourse}
          />
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
}

export default SettingsPanel;
