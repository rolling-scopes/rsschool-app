import React, { useState } from 'react';
import { Upload, Row, Col, Tooltip, Button, Form, message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import {
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { CourseService } from 'services/course';
import { parseFiles, uploadResults } from '../utils';

interface ManageCsvButtonsProps {
  courseId: number;
  courseService: CourseService;
  timezone: string;
  refreshData: () => void;
}

const ManageCsvButtons: React.FC<ManageCsvButtonsProps> = ({
  courseId,
  courseService,
  timezone,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const onRemoveCsvFile = (_: UploadFile<any>) => setFileList([]);
  const beforeCsvFileUpload = (file: RcFile) => setFileList([...fileList, file]);
  const exportToCsvFile = () => {
    window.location.href = `/api/course/${courseId}/schedule/csv/${timezone.replace('/', '_')}`;
  };
  const importCsvFile = async (values: any) => {
    try {
      const results = await parseFiles(values.files);
      const submitResults = await uploadResults(courseService, results, timezone);

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
    <Row justify="start" gutter={[16, 16]}>
      <Col>
        <Tooltip title="Export schedule" mouseEnterDelay={1}>
          <Button onClick={exportToCsvFile} icon={<DownloadOutlined />} />
        </Tooltip>
      </Col>
      <Col>
        <Form form={form} onFinish={importCsvFile} layout="inline">
          <Form.Item label="" name="files" rules={[{ required: true, message: 'Please select csv-file' }]}>
            <Upload onRemove={onRemoveCsvFile} beforeUpload={beforeCsvFileUpload} fileList={fileList}>
              <Tooltip title="Import schedule" mouseEnterDelay={1}>
                <Button icon={<UploadOutlined />} />
              </Tooltip>
            </Upload>
          </Form.Item>
          {fileList.length > 0 && (
            <Button type="primary" htmlType="submit" style={{ marginRight: '1.5em' }}>
              Import CSV
            </Button>
          )}
        </Form>
      </Col>
    </Row>
  );
};

export default ManageCsvButtons;
