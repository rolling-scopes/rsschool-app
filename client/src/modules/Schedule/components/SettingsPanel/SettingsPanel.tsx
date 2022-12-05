import { Button, Col, Row } from 'antd';
import { PlusOutlined, CalendarOutlined, FileExcelOutlined, CopyOutlined } from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useMemo, useState } from 'react';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import { AdditionalActions } from '../AdditionalActions';
import { buildMenuItem } from './helpers';

export interface SettingsPanelProps {
  isCourseManager: boolean;
  courseId: number;
  courseAlias: string;
  settings: ScheduleSettings;
  calendarToken: string;
  tags: CourseScheduleItemDtoTagEnum[];
  refreshData: () => void;
  onCreateCourseTask: () => void;
  onCreateCourseEvent: () => void;
  onCopyFromCourse: () => void;
}

export enum SettingsButtons {
  Event = 'Event',
  Task = 'Task',
  Calendar = 'iCal Link',
  Export = 'Export',
  Copy = 'Copy from',
  More = 'More',
}

export function SettingsPanel({
  isCourseManager,
  onCreateCourseTask,
  onCreateCourseEvent,
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

  const additionalMenuItems = useMemo(
    () =>
      [
        buildMenuItem(SettingsButtons.Calendar, <CalendarOutlined />, !!calendarToken),
        buildMenuItem(SettingsButtons.Export, <FileExcelOutlined />, isCourseManager),
        buildMenuItem(SettingsButtons.Copy, <CopyOutlined />, isCourseManager),
      ].filter(Boolean),
    [calendarToken, isCourseManager],
  );

  return (
    <>
      <Row justify="end" gutter={[16, 16]} style={{ marginBottom: 12 }}>
        {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateCourseEvent}>
              {SettingsButtons.Event}
            </Button>
          </Col>
        ) : null}
        {/* {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openManageEventModal}>
              {SettingsButtons.Event}
            </Button>
          </Col>
        ) : null} */}
        {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateCourseTask}>
              {SettingsButtons.Task}
            </Button>
          </Col>
        ) : null}
        <Col>
          <SettingsDrawer tags={tags} settings={settings} />
        </Col>
        {additionalMenuItems?.length !== 0 && (
          <Col>
            <AdditionalActions
              menuItems={additionalMenuItems}
              courseId={courseId}
              timezone={settings.timezone}
              calendarToken={calendarToken}
              courseAlias={courseAlias}
              onCopyFromCourse={onCopyFromCourse}
            />
          </Col>
        )}
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
