import { Button, Col, Row } from 'antd';
import {
  CalendarOutlined,
  CloudDownloadOutlined,
  CopyOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useMemo } from 'react';
import { SettingsDrawer } from '../SettingsDrawer';
import { AdditionalActions } from '../AdditionalActions';
import { buildMenuItem } from './helpers';

export interface SettingsPanelProps {
  isCourseManager: boolean;
  courseId: number;
  courseAlias: string;
  settings: ScheduleSettings;
  calendarToken: string;
  mobileView?: boolean;
  tags: CourseScheduleItemDtoTagEnum[];
  refreshData: () => void;
  onCreateCourseTask: () => void;
  onCreateCourseEvent: () => void;
  onCopyFromCourse: () => void;
}

export enum SettingsButtons {
  Event = 'Event',
  Task = 'Task',
  CopyLink = 'Copy iCal Link',
  Download = 'Download iCal',
  Export = 'Export Excel',
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
  mobileView,
}: SettingsPanelProps) {
  const additionalMenuItems = useMemo(
    () =>
      [
        buildMenuItem(SettingsButtons.CopyLink, <CalendarOutlined />, !!calendarToken),
        buildMenuItem(SettingsButtons.Download, <CloudDownloadOutlined />, !!calendarToken),
        buildMenuItem(SettingsButtons.Export, <FileExcelOutlined />, isCourseManager),
        buildMenuItem(SettingsButtons.Copy, <CopyOutlined />, isCourseManager),
      ].filter(Boolean),
    [calendarToken, isCourseManager],
  );

  return (
    <Row justify="end" gutter={16}>
      {isCourseManager && !mobileView ? (
        <Col>
          <Button
            data-testid={SettingsButtons.Event}
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateCourseEvent}
          >
            {SettingsButtons.Event}
          </Button>
        </Col>
      ) : null}
      {isCourseManager && !mobileView ? (
        <Col>
          <Button
            data-testid={SettingsButtons.Task}
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateCourseTask}
          >
            {SettingsButtons.Task}
          </Button>
        </Col>
      ) : null}
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
      <Col>
        <SettingsDrawer tags={tags} settings={settings} />
      </Col>
    </Row>
  );
}

export default SettingsPanel;
