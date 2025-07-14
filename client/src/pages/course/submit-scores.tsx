import UploadOutlined from '@ant-design/icons/UploadOutlined';
import { Button, Form, List, message, Table, Typography, Upload } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
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

interface SubmitFormValues {
  files: {
    fileList: UploadFile[];
  };
  courseTaskId: number;
}

interface IncomingFiles {
  fileList: UploadFile[];
}

interface StudentScore {
  score: number;
  studentGithubId: string;
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
    const newSelectedFileList = new Map<string, UploadFile>();

    info.fileList.forEach(file => {
      newSelectedFileList.set(file.uid, file);
    });

    setSelectedFileList(newSelectedFileList);
    setSubmitResults([]);
  };

  const handleSubmit = async (values: SubmitFormValues) => {
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
        message.error('An error occurred. Please try later.');
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
            beforeUpload={() => false}
            fileList={Array.from(selectedFileList).map(([, file]) => file)}
            onChange={handleFileChose}
            accept=".csv"
            multiple
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

async function parseFiles(incomingFiles: IncomingFiles): Promise<StudentScore[]> {
  const files = incomingFiles.fileList;

  const filesContent: string[] = await Promise.all(
    files.map(
      file =>
        new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.readAsText(file.originFileObj as Blob, 'utf-8');
          reader.onload = ({ target }) => res((target?.result as string) || '');
          reader.onerror = e => rej(e);
        }),
    ),
  );

  const parsedRecords = await Promise.all(filesContent.map(content => csv().fromString(content)));
  const scores = parsedRecords.flat().map(item => {
    if (isUndefined(item.Github) || isUndefined(item.Score)) {
      throw new Error('Incorrect data: CSV file should contain the headers named "Github" and "Score"!');
    }

    const parsedScore = parseInt(item.Score, 10);
    if (isNaN(parsedScore)) {
      throw new Error(`Incorrect data: Cannot parse "Score" for Github ${item.Github}`);
    }

    return {
      score: parsedScore,
      github: filterLogin(item.Github).toLowerCase(),
    };
  });

  const uniqueStudents = new Map<string, number>();
  scores.forEach(({ github, score }) => {
    const current = uniqueStudents.get(github);
    if (!current || current < score) {
      uniqueStudents.set(github, score);
    }
  });

  return Array.from(uniqueStudents).map(([studentGithubId, score]) => ({
    studentGithubId,
    score,
  }));
}

async function uploadResults(
  courseService: CourseService,
  courseTaskId: number,
  data: StudentScore[],
): Promise<SubmitResult[]> {
  const results = await courseService.postMultipleScores(courseTaskId, data);
  const groupedByStatus = new Map<string, SubmitResult>();

  results.forEach(({ status, value }: { status: string; value: string | number }) => {
    const current = groupedByStatus.get(status);

    if (current) {
      const newStatus: SubmitResult = {
        status,
        count: current.count + 1,
        messages:
          status === 'skipped' && typeof value === 'string' ? (current.messages ?? []).concat(value) : current.messages,
      };
      groupedByStatus.set(status, newStatus);
    } else {
      const newStatus: SubmitResult = {
        status,
        count: 1,
        messages: status === 'skipped' && typeof value === 'string' ? [value] : undefined,
      };
      groupedByStatus.set(status, newStatus);
    }
  });

  return Array.from(groupedByStatus.values());
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
