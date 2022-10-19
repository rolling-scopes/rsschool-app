import { Button, Col, message, Row } from 'antd';
import { PlusOutlined, CopyOutlined, CalendarOutlined } from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useState } from 'react';
import { ManageEventModalForm } from '../ManageEventModalForm';
import { SettingsDrawer } from '../SettingsDrawer';
import ManageCsvButtons from './ManageCsvButtons';
import { useCopyToClipboard } from 'react-use';

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

function buildICalendarLink(courseId: number, token: string, timezone: string) {
  return `/api/v2/courses/${courseId}/icalendar/${token}?timezone=${encodeURIComponent(timezone || '')}`;
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
  const [, copyToClipboard] = useCopyToClipboard();

  const openManageEventModal = () => setIsManageEventModalOpen(true);
  const closeManageEventModal = () => {
    setEditableRecord(null);
    setIsManageEventModalOpen(false);
  };

  const iCalLink = buildICalendarLink(courseId, calendarToken, settings.timezone);

  return (
    <>
      <Row justify="end" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <SettingsDrawer tags={tags} settings={settings} />
        </Col>
        {calendarToken ? (
          <Col>
            <Button.Group>
              <Button
                icon={<CalendarOutlined />}
                download={`schedule-${courseAlias}.ics`}
                target="_blank"
                href={iCalLink}
              >
                iCal Link
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  copyToClipboard(`${window.document.location.origin}${iCalLink}`);
                  message.success('Copied to clipboard');
                }}
              />
            </Button.Group>
          </Col>
        ) : null}
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
