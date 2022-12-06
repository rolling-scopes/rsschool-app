import { UploadFile, Form, Upload, Button, Row } from 'antd';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';

function JupyterNotebook() {
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
  const handleFileChose = async (info: any) => setUploadFile(info.file);

  return (
    <Row>
      <Form.Item name="upload">
        <Upload fileList={uploadFile ? [uploadFile] : []} onChange={handleFileChose} multiple={false}>
          <Button>
            <UploadOutlined /> Select Jupyter Notebook
          </Button>
        </Upload>
      </Form.Item>
    </Row>
  );
}

export default JupyterNotebook;
