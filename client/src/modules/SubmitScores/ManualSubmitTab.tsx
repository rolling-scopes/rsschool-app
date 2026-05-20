import { useMemo, useState } from 'react';
import { Button, Form, InputNumber, Select, Space, Table } from 'antd';
import MinusCircleOutlined from '@ant-design/icons/MinusCircleOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import groupBy from 'lodash/groupBy';
import { CourseService } from '@client/services/course';
import { CourseTaskDto } from '@client/api';
import { StudentSearch } from '@client/shared/components/StudentSearch';
import { useMessage } from '@client/hooks';
import { aggregateResults, SubmitResult } from './utils';

interface ManualRow {
  studentGithubId?: string;
  courseTaskId?: number;
  score?: number;
}

interface ManualFormValues {
  rows: ManualRow[];
}

interface Props {
  courseId: number;
  courseService: CourseService;
  courseTasks: CourseTaskDto[];
  onResults: (results: SubmitResult[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function ManualSubmitTab({ courseId, courseService, courseTasks, onResults, onLoadingChange }: Props) {
  const { message } = useMessage();
  const [form] = Form.useForm<ManualFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const taskOptions = useMemo(
    () =>
      [...courseTasks].sort((a, b) => a.name.localeCompare(b.name)).map(task => ({ label: task.name, value: task.id })),
    [courseTasks],
  );

  const handleSubmit = async (values: ManualFormValues) => {
    const rows = (values.rows ?? []).filter(
      r => r && r.studentGithubId && r.courseTaskId != null && r.score != null,
    ) as Required<ManualRow>[];

    if (rows.length === 0) {
      message.error('Add at least one row to submit.');
      return;
    }

    // Detect duplicate (student, task) pairs within the batch.
    const seen = new Set<string>();
    for (const r of rows) {
      const key = `${r.courseTaskId}::${r.studentGithubId.toLowerCase()}`;
      if (seen.has(key)) {
        message.error(`Duplicate row: ${r.studentGithubId} for the same task. Remove one of them.`);
        return;
      }
      seen.add(key);
    }

    try {
      setSubmitting(true);
      onLoadingChange(true);
      onResults([]);

      const groups = groupBy(rows, r => String(r.courseTaskId));

      const responses = await Promise.all(
        Object.entries(groups).map(([courseTaskId, items]) =>
          courseService.postMultipleScores(
            Number(courseTaskId),
            items.map(({ studentGithubId, score }) => ({ studentGithubId, score })),
          ),
        ),
      );

      const flat = responses.flat() as { status: string; value: string | number }[];
      onResults(aggregateResults(flat));
      form.resetFields();
      message.success('Scores have been submitted.');
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setSubmitting(false);
      onLoadingChange(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ rows: [{}] }}>
      <Form.List name="rows">
        {(fields, { add, remove }) => {
          const columns = [
            {
              title: 'Student (GitHub)',
              key: 'student',
              width: '40%',
              render: (_: unknown, field: (typeof fields)[number]) => (
                <Form.Item
                  name={[field.name, 'studentGithubId']}
                  rules={[{ required: true, message: 'Select a student' }]}
                  style={{ marginBottom: 0 }}
                >
                  <StudentSearch courseId={courseId} keyField="githubId" style={{ width: '100%' }} />
                </Form.Item>
              ),
            },
            {
              title: 'Course Task',
              key: 'task',
              width: '40%',
              render: (_: unknown, field: (typeof fields)[number]) => (
                <Form.Item
                  name={[field.name, 'courseTaskId']}
                  rules={[{ required: true, message: 'Select a task' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    showSearch
                    placeholder="Select task"
                    optionFilterProp="label"
                    options={taskOptions}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ),
            },
            {
              title: 'Score',
              key: 'score',
              width: '15%',
              render: (_: unknown, field: (typeof fields)[number]) => (
                <Form.Item
                  name={[field.name, 'score']}
                  rules={[{ required: true, message: 'Enter score' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              ),
            },
            {
              title: '',
              key: 'actions',
              width: '5%',
              render: (_: unknown, field: (typeof fields)[number]) => (
                <Button
                  type="text"
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(field.name)}
                  disabled={fields.length === 1}
                  aria-label="Remove row"
                />
              ),
            },
          ];

          return (
            <>
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={fields}
                columns={columns}
                style={{ marginBottom: '1em' }}
              />
              <Form.Item>
                <Button onClick={() => add({})} icon={<PlusOutlined />} block>
                  Add row
                </Button>
              </Form.Item>
            </>
          );
        }}
      </Form.List>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting} size="large">
            Submit
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
