import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import { CriteriaDto } from 'api';
import { CrossCheckCriteriaType } from 'services/course';
import { TaskType } from './constants';
import { useMessage } from 'hooks';

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
  const { message } = useMessage();

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      const fileReader = new FileReader();
      fileReader.readAsText(info.file.originFileObj as Blob, 'UTF-8');
      fileReader.onload = (e: Event) => {
        const target = e.target as Element & { result: string };
        const { criteria } = JSON.parse(target.result) as { criteria: CriteriaDto[] };
        const transformedCriteria = criteria?.map((item: CriteriaJSONType) => {
          if (item.type === TaskType.Title) {
            return { type: item.type, text: item.title };
          }
          return item;
        });
        if (!transformedCriteria?.length) {
          message.warning(`There is no criteria for downloading`);
          return;
        }
        message.success(`${info.file.name} file uploaded successfully`);
        onLoad(transformedCriteria as CriteriaDto[]);
      };
    }
  };

  return (
    <Upload
      data-testid="uploader"
      accept=".JSON"
      onChange={handleChange}
      // This is to override default behavior of the uploader (send request to the server)
      // We don't need it, because we handle file client-side
      customRequest={opts => opts.onSuccess?.(null)}
    >
      <Button
        icon={<UploadOutlined />}
        title='required format: \n{ criteria: {"type": "string", "max": number, "text": "string"}}'
      >
        Click to Upload Criteria (JSON)
      </Button>
    </Upload>
  );
};
