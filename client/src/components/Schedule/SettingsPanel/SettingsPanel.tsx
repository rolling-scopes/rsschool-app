import React, { useState } from 'react';
import { Form, Row, Col, Select, Button, Tooltip, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { RcFile } from 'antd/lib/upload';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  CheckSquareOutlined,
  BorderOutlined,
} from '@ant-design/icons';
import { TIMEZONES } from 'configs/timezones';
import { ViewMode } from 'components/Schedule/constants';
import { EventModalForm } from 'components/Schedule/EventModalForm';
import { parseFiles, uploadResults } from 'components/Schedule/utils';
import { ScheduleSettings as SettingsDrawer } from 'components/Schedule/ScheduleSettings';
import { ScheduleSettings } from 'components/Schedule/useScheduleSettings';

const { Option } = Select;

interface SettingsPanelProps {
  isAdmin: boolean;
  courseId: number;
  settings: ScheduleSettings;
  eventTypes: any;
  courseService: any;
  refreshData: any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isAdmin,
  courseId,
  settings,
  eventTypes,
  courseService,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [isManageEventModalOpen, setIsManageEventModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);

  const closeModal = () => {
    setEditableRecord(null);
    setIsManageEventModalOpen(false);
  };

  const openModal = () => setIsManageEventModalOpen(true);

  const togglePassedEventsVisibility = () => settings.setArePassedEventsHidden(!settings.arePassedEventsHidden);
  const toggleDoneTasksVisibility = () => settings.setAreDoneTasksHidden(!settings.areDoneTasksHidden);

  const exportToCsvFile = () => {
    window.location.href = `/api/course/${courseId}/schedule/csv/${settings.timezone.replace('/', '_')}`;
  };
  const onRemoveCsvFile = (_: UploadFile<any>) => setFileList([]);
  const beforeCsvFileUpload = (file: RcFile) => setFileList([...fileList, file]);
  const handleImportCsv = async (values: any) => {
    try {
      const results = await parseFiles(values.files);
      const submitResults = await uploadResults(courseService, results, settings.timezone);

      if (submitResults.toString().includes('successfully')) {
        message.success(submitResults);
        setFileList([]);
      } else {
        message.error(submitResults);
      }

      refreshData();
    } catch (err) {
      const error = err as Error;
      if (error.message.match(/^Incorrect data/)) {
        message.error(error.message);
      } else {
        message.error('An error occured. Please try later.');
      }
    }
  };

  return (
    <>
      <Row justify="start" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col>
          <Select style={{ width: 100 }} defaultValue={settings.viewMode} onChange={settings.setViewMode}>
            <Option value={ViewMode.Table}>Table</Option>
            <Option value={ViewMode.List}>List</Option>
            <Option value={ViewMode.Calendar}>Calendar</Option>
          </Select>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Please select a timezone"
            defaultValue={settings.timezone}
            onChange={settings.setTimezone}
          >
            {TIMEZONES.map(tz => (
              <Option key={tz} value={tz}>
                {/* there is no 'Europe / Kyiv' time zone at the moment */}
                {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
              </Option>
            ))}
          </Select>
        </Col>
        {isAdmin && (
          <>
            <Col>
              <Tooltip title="Export schedule" mouseEnterDelay={1}>
                <Button onClick={exportToCsvFile} icon={<DownloadOutlined />} />
              </Tooltip>
            </Col>
            <Form form={form} onFinish={handleImportCsv} layout="inline">
              <Col>
                <Form.Item label="" name="files" rules={[{ required: true, message: 'Please select csv-file' }]}>
                  <Upload onRemove={onRemoveCsvFile} beforeUpload={beforeCsvFileUpload} fileList={fileList}>
                    <Tooltip title="Import schedule" mouseEnterDelay={1}>
                      <Button icon={<UploadOutlined />} />
                    </Tooltip>
                  </Upload>
                </Form.Item>
              </Col>
              {fileList.length > 0 && (
                <Col>
                  <Button type="primary" htmlType="submit" style={{ marginRight: '1.5em' }}>
                    Import CSV
                  </Button>
                </Col>
              )}
            </Form>
            <Col>
              <Tooltip title="Add new" mouseEnterDelay={1}>
                <Button type="primary" icon={<PlusOutlined />} onClick={openModal} />
              </Tooltip>
            </Col>
          </>
        )}
        <Col>
          <Tooltip title="Hide old events" mouseEnterDelay={1}>
            <Button
              type="primary"
              onClick={togglePassedEventsVisibility}
              icon={settings.arePassedEventsHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Hide done tasks" mouseEnterDelay={1}>
            <Button
              type="primary"
              onClick={toggleDoneTasksVisibility}
              icon={settings.areDoneTasksHidden ? <BorderOutlined /> : <CheckSquareOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <SettingsDrawer eventTypes={eventTypes} settings={settings} />
        </Col>
      </Row>
      {isManageEventModalOpen && (
        <EventModalForm
          visible={isManageEventModalOpen}
          editableRecord={editableRecord}
          handleCancel={closeModal}
          courseId={courseId}
          refreshData={refreshData}
        />
      )}
    </>
  );
};

export default SettingsPanel;
