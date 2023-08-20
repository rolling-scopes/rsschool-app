import { Button, Col, Row } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  FileExcelOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import React, { useMemo } from 'react';
import { SettingsDrawer } from '../SettingsDrawer';
import { AdditionalActions } from '../AdditionalActions';
import { buildMenuItem } from './helpers';

export interface SettingsPanelProps {
  isCourseManager: boolean;
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
  settings,
  calendarToken,
  tags,
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
    <>
      <Row justify="end" gutter={[16, 16]} style={{ marginBottom: 12 }}>
        {isCourseManager ? (
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateCourseEvent}>
              {SettingsButtons.Event}
            </Button>
          </Col>
        ) : null}
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
              timezone={settings.timezone}
              calendarToken={calendarToken}
              onCopyFromCourse={onCopyFromCourse}
            />
          </Col>
        )}
      </Row>
    </>
  );
}

export default SettingsPanel;
