import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import { CriteriaDto } from 'api';
import { TaskType } from './components/CrossCheckCriteriaForm';
import { CrossCheckCriteriaType } from 'services/course';

interface IUploadCriteriaJSON {
  onLoad: (data: CriteriaDto[]) => void;
}

export type CriteriaJSONType = {
  type: CrossCheckCriteriaType;
  max?: number;
  text?: string;
  title?: string;
};

export const UploadCriteriaJSON = ({ onLoad }: IUploadCriteriaJSON) => {
  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      const fileReader = new FileReader();
      fileReader.readAsText(info.file.originFileObj as Blob, 'UTF-8');
      fileReader.onload = (e: Event) => {
        const target = e.target as Element & { result: string };
        const { criteria } = JSON.parse(target.result);
        const transformedCriteria = criteria?.map((item: CriteriaJSONType) => {
          if (item.type === TaskType.Title) {
            return { type: item.type, text: item.title };
          } else return item;
        });
        if (!transformedCriteria?.lengthgi) {
          message.warn(`There is no criteria for downloading`);
          return;
        }
        message.success(`${info.file.name} file uploaded successfully`);
        onLoad(transformedCriteria);
      };
    }
  };

  return (
    <Upload data-testid="uploader" accept=".JSON" onChange={handleChange}>
      <Button
        icon={<UploadOutlined />}
        title='required format: \n{ criteria: {"type": "string", "max": number, "text": "string"}}'
      >
        Click to Upload Criteria (JSON)
      </Button>
    </Upload>
  );
};
