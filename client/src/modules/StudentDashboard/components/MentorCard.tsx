import { EnvironmentFilled, GithubFilled } from '@ant-design/icons';
import { Button, Col, Descriptions, Form, Input, Row, Typography } from 'antd';
import { CoursesTasksApi, CoursesTaskSolutionsApi, CourseTaskDto } from 'api';
import { AxiosError } from 'axios';
import { MentorBasic } from 'common/models';
import { CourseTaskSelect } from 'components/Forms';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { GithubAvatar } from 'components/GithubAvatar';
import { useReducer } from 'react';
import { urlPattern } from 'services/validators';
import CommonCard from './CommonDashboardCard';

interface MentorContact {
  contactsEmail?: string;
  contactsPhone?: string;
  contactsSkype?: string;
  contactsTelegram?: string;
  contactsNotes?: string;
}

type Contact = { name: string; value: string | undefined };

type Props = {
  mentor: (MentorBasic & MentorContact) | undefined;
  courseId: number;
};

type ModalState = {
  errorText?: string;
  submitted?: boolean;
  data?: { courseTasks: CourseTaskDto[] };
  loading?: boolean;
} | null;

type ModalReducerAction = {
  type: 'loading' | 'open' | 'close' | 'error' | 'submit';
  state?: ModalState;
};

export function MentorCard(props: Props) {
  const {
    name,
    githubId,
    contactsEmail,
    contactsPhone,
    contactsSkype,
    contactsTelegram,
    contactsNotes,
    cityName,
    countryName,
  } = props.mentor ?? {};

  const contacts = [
    { name: 'E-mail', value: contactsEmail },
    { name: 'Telegram', value: contactsTelegram },
    { name: 'Phone', value: contactsPhone },
    { name: 'Skype', value: contactsSkype },
    { name: 'Notes', value: contactsNotes },
  ];

  const filledContacts = contacts.filter(({ value }: Contact) => value);
  const { Title, Paragraph } = Typography;
  const [modalState, dispatch] = useReducer((state: ModalState, action: ModalReducerAction): ModalState => {
    switch (action.type) {
      case 'loading':
        return { loading: true };
      case 'open':
        return { loading: false, data: action.state?.data };
      case 'submit':
        return { submitted: true, data: state?.data };
      case 'close':
        return null;
      case 'error':
        return { errorText: action.state?.errorText, data: state?.data };
      default:
        return state;
    }
  }, {} as ModalState);

  const handleModalShow = async () => {
    dispatch({ type: 'loading' });
    const coursesTasksApi = new CoursesTasksApi();
    const { data } = await coursesTasksApi.getCourseTasks(props.courseId);
    const courseTasks = data.filter(
      item => item.checker === 'mentor' && item.type != 'stage-interview' && item.type != 'interview',
    );
    dispatch({ type: 'open', state: { data: { courseTasks } } });
  };

  const handleSubmit = async (values: { courseTaskId: number; url: string }) => {
    try {
      const api = new CoursesTaskSolutionsApi();
      await api.createTaskSolution(props.courseId, values.courseTaskId, { url: values.url });
      dispatch({ type: 'submit' });
    } catch (err) {
      const error = err as AxiosError;
      dispatch({ type: 'error', state: { errorText: (error.response?.data as Error).message ?? error.message } });
    }
  };

  return (
    <>
      <CommonCard
        title="Mentor"
        content={
          props.mentor ? (
            <Col>
              <div style={{ marginBottom: 8 }}>
                <GithubAvatar size={48} githubId={githubId!} style={{ margin: '0 auto 10px', display: 'block' }} />
                <Title level={1} style={{ fontSize: 24, textAlign: 'center', margin: 0 }}>
                  {name}
                </Title>
                <Paragraph style={{ textAlign: 'center', marginBottom: 10 }}>
                  <a target="_blank" href={`https://github.com/${githubId}`} style={{ fontSize: 16 }}>
                    <GithubFilled /> {githubId}
                  </a>
                </Paragraph>
                <Paragraph style={{ textAlign: 'center', margin: 0 }}>
                  <span>
                    <EnvironmentFilled /> {`${cityName}, ${countryName}`}
                  </span>
                </Paragraph>
              </div>
              <div style={{ marginBottom: 4 }}>
                {filledContacts.length ? (
                  <Descriptions layout="horizontal" column={1} size="small">
                    {filledContacts.map(({ name, value }, idx) => (
                      <Descriptions.Item labelStyle={{ color: '#666' }} key={idx} label={name}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : null}
              </div>
              <Row justify="center">
                <Button onClick={handleModalShow} type="primary">
                  Submit Task
                </Button>
              </Row>
            </Col>
          ) : null
        }
      />
      <ModalSubmitForm
        title="Submit Task For Mentor Review"
        data={modalState}
        submitted={modalState?.submitted}
        submit={handleSubmit}
        close={() => dispatch({ type: 'close' })}
        errorText={modalState?.errorText}
        loading={modalState?.loading}
      >
        <CourseTaskSelect groupBy="deadline" data={modalState?.data?.courseTasks ?? []} />
        <Form.Item
          label="Add a solution link"
          name="url"
          required
          rules={[{ message: 'Please enter valid URL', pattern: urlPattern }]}
        >
          <Input />
        </Form.Item>
      </ModalSubmitForm>
    </>
  );
}
