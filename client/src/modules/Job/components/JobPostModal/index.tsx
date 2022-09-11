import { Col, Form, Input, Row, Select } from 'antd';
import { CreateJobPostDto, JobPostDtoJobTypeEnum, DisciplinesApi } from 'api';
import { ModalForm } from 'components/Forms';
import { useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { urlPattern } from 'services/validators';

type Props = {
  onCancel: () => void;
  onSubmit: (record: CreateJobPostDto) => void;
  data: Partial<CreateJobPostDto> | null;
};

const disciplinesApi = new DisciplinesApi();

export function JobPostModal(props: Props) {
  const { data } = props;
  const [changes, setChanges] = useState({} as Record<string, any>);

  const { value: disciplines } = useAsync(async () => {
    const { data } = await disciplinesApi.getDisciplines();
    return data;
  });

  useEffect(() => {
    setChanges(data ? { ...data, changes } : {});
  }, [data]);

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);
    props.onSubmit(record);
  };

  const handleModalCancel = () => {
    setChanges({});
    props.onCancel();
  };

  return (
    <ModalForm
      data={data}
      okText="Submit For Review"
      onChange={values => setChanges({ checker: values.checker })}
      title="Job Post"
      submit={handleModalSubmit}
      cancel={handleModalCancel}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item rules={[{ min: 16, max: 128 }]} name="title" required label="Title">
            <Input placeholder="Title of your post" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item rules={[{ min: 3 }]} name="company" required label="Company">
            <Input placeholder="Please enter your company name" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="disciplineId" required label="Primary Skill">
        <Select placeholder="Please select discipline">
          {disciplines?.map(discipline => (
            <Select.Option value={discipline.id}>{discipline.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="description" rules={[{ min: 30 }]} required label="Description">
        <Input.TextArea rows={10} placeholder="Description" />
      </Form.Item>
      <Form.Item name="url" rules={[{ pattern: urlPattern, message: 'Please enter a valid URL' }]} label="URL">
        <Input placeholder="Please leave an URL to your carrers site or more detailed description if available" />
      </Form.Item>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="jobType" required label="Job Type">
            <Select>
              <Select.Option value={JobPostDtoJobTypeEnum.Remote}>Remote</Select.Option>
              <Select.Option value={JobPostDtoJobTypeEnum.Office}>Office</Select.Option>
              <Select.Option value={JobPostDtoJobTypeEnum.Hybrid}>Hybrid</Select.Option>
              <Select.Option value={JobPostDtoJobTypeEnum.Any}>Any</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="location" rules={[{ min: 3 }]} required label="Location">
            <Input placeholder="Job Location" />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
}

function createRecord(values: any): CreateJobPostDto {
  return {
    company: values.company,
    description: values.description,
    jobType: values.jobType,
    title: values.title,
    location: values.location,
    url: values.url ?? null,
    disciplineId: values.disciplineId,
  };
}
