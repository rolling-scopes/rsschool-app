import UploadOutlined from '@ant-design/icons/UploadOutlined';
import { Button, Form, List, message, Table, Typography, Upload } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { PageLayoutSimple } from 'components/PageLayout';
import { CourseTaskSelect } from 'components/Forms';
import csv from 'csvtojson';
import isUndefined from 'lodash/isUndefined';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { filterLogin } from 'utils/text-utils';
import { isCourseManager } from 'domain/user';
import { CoursesTasksApi, CourseTaskDto } from 'api';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

interface SubmitResult {
  status: string;
  count: number;
  messages?: string[];
}

const courseTasksApi = new CoursesTasksApi();

export function SubmitScorePage() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const [form] = Form.useForm();
  const courseId = course.id;
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTaskDto[]);
  const [loading, setLoading] = useState(false);
  const [submitResults, setSubmitResults] = useState([] as SubmitResult[]);
  const [selectedFileList, setSelectedFileList] = useState(new Map() as Map<string, UploadFile>);

  useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    setCourseTasks(data.filter(item => item.taskOwner?.id === session.id || isCourseManager(session, courseId)));
  }, [courseService]);

  const handleTaskChange = () => setSubmitResults([]);

  const handleFileChose = (info: UploadChangeParam<UploadFile>) => {
    let newSelectedFileList: Map<string, UploadFile> = new Map(selectedFileList);
    info.fileList.forEach(file => {
      switch (file.status) {
        case 'uploading':
        case 'done': {
          newSelectedFileList.set(file.uid, file);
          break;
        }
        case 'removed': {
          newSelectedFileList.delete(file.uid);
          break;
        }
        default: {
          newSelectedFileList = new Map();
        }
      }
    });
    setSelectedFileList(newSelectedFileList);
    setSubmitResults([]);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const results = await parseFiles(values.files);
      const submitResults = await uploadResults(courseService, values.courseTaskId, results);
      setSubmitResults(submitResults);
      setSelectedFileList(new Map());
      message.success('Score has been submitted.');
    } catch (err) {
      const error = err as Error;
      if (error.message.match(/^Incorrect data/)) {
        message.error(error.message);
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
    <PageLayoutSimple loading={loading} title="Submit Scores" showCourseName>
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
            accept=".csv"
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

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]}>
        <SubmitScorePage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
