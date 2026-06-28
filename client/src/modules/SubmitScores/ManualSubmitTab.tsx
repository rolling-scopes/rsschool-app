import { useMemo, useState } from 'react';
import { Button, Form, InputNumber, Select, Space, Table } from 'antd';
import MinusCircleOutlined from '@ant-design/icons/MinusCircleOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import groupBy from 'lodash/groupBy';
import { CourseService } from '@client/services/course';
import { CourseTaskDto } from '@client/api';
import { StudentSearch } from '@client/shared/components/StudentSearch';
import { useMessage } from '@client/hooks';
import { aggregateResults, findDuplicateRow, ManualRow, SubmitResult } from './utils';
import styles from './SubmitScores.module.css';

type ManualFormRow = Partial<ManualRow>;

interface ManualFormValues {
  rows: ManualFormRow[];
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
      [...courseTasks]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(task => ({ label: `${task.name} (max ${task.maxScore})`, value: task.id })),
    [courseTasks],
  );

  const maxScoreByTaskId = useMemo(
    () => new Map<number, number>(courseTasks.map(t => [t.id, t.maxScore])),
    [courseTasks],
  );

  const handleSubmit = async (values: ManualFormValues) => {
    const rows: ManualRow[] = (values.rows ?? []).flatMap(r =>
      r && r.studentGithubId && r.courseTaskId != null && r.score != null
        ? [{ studentGithubId: r.studentGithubId, courseTaskId: r.courseTaskId, score: r.score }]
        : [],
    );

    if (rows.length === 0) {
      message.error('Add at least one row to submit.');
      return;
    }

    const duplicate = findDuplicateRow(rows);
    if (duplicate) {
      message.error(`Duplicate row: ${duplicate.studentGithubId} for the same task. Remove one of them.`);
      return;
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

      onResults(aggregateResults(responses.flat()));
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
                  className={styles.rowFormItem}
                >
                  <StudentSearch courseId={courseId} keyField="githubId" className={styles.fullWidth} />
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
                  className={styles.rowFormItem}
                >
                  <Select
                    showSearch
                    placeholder="Select task"
                    optionFilterProp="label"
                    options={taskOptions}
                    className={styles.fullWidth}
                    onChange={() => form.validateFields([['rows', field.name, 'score']]).catch(() => {})}
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
                  noStyle
                  shouldUpdate={(prev: ManualFormValues, curr: ManualFormValues) =>
                    prev?.rows?.[field.name]?.courseTaskId !== curr?.rows?.[field.name]?.courseTaskId
                  }
                >
                  {({ getFieldValue }) => {
                    const taskId = getFieldValue(['rows', field.name, 'courseTaskId']) as number | undefined;
                    const max = taskId != null ? maxScoreByTaskId.get(taskId) : undefined;
                    return (
                      <Form.Item
                        name={[field.name, 'score']}
                        rules={[
                          { required: true, message: 'Enter score' },
                          {
                            type: 'number',
                            max,
                            message: max != null ? `Max ${max}` : undefined,
                          },
                        ]}
                        className={styles.rowFormItem}
                      >
                        <InputNumber min={0} max={max} className={styles.fullWidth} />
                      </Form.Item>
                    );
                  }}
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
                className={styles.rowsTable}
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
