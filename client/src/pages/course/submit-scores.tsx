import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, List, message, Table, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { PageLayoutSimple, withSession } from 'components';
import { CourseTaskSelect } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import csv from 'csvtojson';
import { isUndefined } from 'lodash';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { filterLogin } from 'utils/text-utils';

interface SubmitResult {
  status: string;
  count: number;
  messages?: string[];
}

export function Page(props: CoursePageProps) {
  const [form] = Form.useForm();
  const courseId = props.course.id;
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [loading, setLoading] = useState(false);
  const [submitResults, setSubmitResults] = useState([] as SubmitResult[]);
  const [selectedFileList, setSelectedFileList] = useState(new Map() as Map<string, UploadFile>);

  useAsync(async () => {
    const data = await courseService.getCourseTasksForTaskOwner();
    setCourseTasks(data);
  }, [courseService]);

  const handleTaskChange = () => setSubmitResults([]);

  const handleFileChose = (info: any) => {
    let newSelectedFileList: Map<string, UploadFile> = new Map(selectedFileList);
    switch (info.file.status) {
      case 'uploading':
      case 'done': {
        newSelectedFileList.set(info.file.uid, info.file);
        break;
      }
      case 'removed': {
        newSelectedFileList.delete(info.file.uid);
        break;
      }
      default: {
        newSelectedFileList = new Map();
      }
    }
    setSelectedFileList(newSelectedFileList);
    setSubmitResults([]);
  };

  const handleSubmit = async values => {
    try {
      setLoading(true);
      const results = await parseFiles(values.files);
      const submitResults = await uploadResults(courseService, values.courseTaskId, results);
      setSubmitResults(submitResults);
      setSelectedFileList(new Map());
      message.success('Score has been submitted.');
    } catch (e) {
      if (e.message.match(/^Incorrect data/)) {
        message.error(e.message);
      } else {
        message.error('An error occured. Please try later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [skipped] = submitResults.filter(({ status }) => status === 'skipped');
  const skippedStudents = skipped && skipped.messages ? skipped.messages : [];

  return (
    <PageLayoutSimple
      loading={loading}
      title="Submit Scores"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
        <h3>Uploading rules</h3>
        <List
          size="small"
          bordered
          dataSource={[
            'CSV-file should contain columns "Score" and "Github".',
            '"Github" fields could be links or plain names.',
            'For duplicated "Github" fields the best score would be counted.',
            'You should upload several files, if you need scoring the best result from two or more tests.',
            'Only students in the file would be scored. By the way, you can update just several scores.',
          ]}
          renderItem={(item, idx) => (
            <List.Item>
              <Typography.Text strong>{idx + 1}</Typography.Text> {item}
            </List.Item>
          )}
          style={{ marginBottom: '1em' }}
        />
        <Form.Item label="CSV File" name="files" rules={[{ required: true, message: 'Please select csv-file' }]}>
          <Upload
            fileList={Array.from(selectedFileList).map(([, file]) => file)}
            onChange={handleFileChose}
            multiple={true}
          >
            <Button>
              <UploadOutlined /> Select files
            </Button>
          </Upload>
        </Form.Item>
        <Button size="large" type="primary" htmlType="submit" style={{ marginRight: '1.5em' }}>
          Submit
        </Button>
        {submitResults.length ? (
          <Form.Item>
            <h3>Summary</h3>
            <Table
              pagination={false}
              dataSource={submitResults}
              size="small"
              rowKey="status"
              columns={[
                {
                  title: 'Status',
                  dataIndex: 'status',
                },
                {
                  title: 'Count',
                  dataIndex: 'count',
                },
              ]}
            />
          </Form.Item>
        ) : (
          ''
        )}
        {skippedStudents.length ? (
          <Form.Item>
            <h3>Skipped students</h3>
            <List
              size="small"
              bordered
              dataSource={skippedStudents}
              renderItem={item => <List.Item>{item}</List.Item>}
              style={{ marginBottom: '1em' }}
            />
          </Form.Item>
        ) : (
          ''
        )}
      </Form>
    </PageLayoutSimple>
  );
}

async function parseFiles(incomingFiles: any) {
  const files = incomingFiles.fileList;
  const filesContent: string[] = await Promise.all(
    files.map(
      (file: any) =>
        new Promise((res, rej) => {
          const reader = new FileReader();
          reader.readAsText(file.originFileObj, 'utf-8');
          reader.onload = ({ target }) => res(target ? target.result : '');
          reader.onerror = e => rej(e);
        }),
    ),
  );
  const scores = (await Promise.all(filesContent.map((content: string) => csv().fromString(content))))
    .reduce((acc, cur) => acc.concat(cur), [])
    .map(item => {
      if (isUndefined(item.Github) || isUndefined(item.Score)) {
        throw new Error('Incorrect data: CSV file should content the headers named "Github" and "Score"!');
      }
      return {
        score: parseInt(item.Score, 10),
        github: filterLogin(item.Github).toLowerCase(),
      };
    });
  const uniqueStudents = new Map();
  scores.forEach(({ github, score }) => {
    if (uniqueStudents.has(github)) {
      const savedScore = uniqueStudents.get(github);
      if (savedScore < score) {
        uniqueStudents.set(github, score);
      }
    } else {
      uniqueStudents.set(github, score);
    }
  });
  const data = Array.from(uniqueStudents).map(([github, score]) => ({
    score,
    studentGithubId: github,
  }));
  return data;
}

async function uploadResults(
  courseService: CourseService,
  courseTaskId: number,
  data: { score: any; studentGithubId: any }[],
) {
  const results = await courseService.postMultipleScores(courseTaskId, data);
  const groupedByStatus = new Map();
  results.forEach(({ status, value }: { status: string; value: string | number }) => {
    if (groupedByStatus.has(status)) {
      const savedStatus = groupedByStatus.get(status);
      const newStatus = {
        status,
        count: savedStatus.count + 1,
      } as SubmitResult;
      if (status === 'skipped' && typeof value === 'string') {
        newStatus.messages = savedStatus.messages.concat([value]);
      }
      groupedByStatus.set(status, newStatus);
    } else {
      const newStatus = {
        status,
        count: 1,
      } as SubmitResult;
      if (status === 'skipped' && typeof value === 'string') {
        newStatus.messages = [value];
      }
      groupedByStatus.set(status, newStatus);
    }
  });
  const submitResults = Array.from(groupedByStatus).map(([, submitResult]) => submitResult);
  return submitResults;
}

export default withCourseData(withSession(Page));
