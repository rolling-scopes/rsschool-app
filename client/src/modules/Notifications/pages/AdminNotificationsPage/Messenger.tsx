import { Button, Form, Input, Select, Spin, message } from 'antd';
import { useLoading } from 'components/useLoading';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseDto as Course } from 'api';
import { CourseService } from 'services/course';
import { CoursesService } from 'services/courses';
import { NotificationChannel, NotificationsService } from '../../services/notifications';

type RecipientOption = {
  value: number | string;
  label: string;
};

export function Messenger({ defaultChannel = NotificationChannel.email }: { defaultChannel?: NotificationChannel }) {
  const [form] = Form.useForm();
  const [channel, setChannel] = useState<NotificationChannel>(defaultChannel);
  const [loading, withLoading] = useLoading(false);
  const [courses, setCourses] = useState<Course[]>();
  const [students, setStudents] = useState<RecipientOption[]>([]);
  const [mentors, setMentors] = useState<RecipientOption[]>([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);

  const loadCourses = useCallback(
    withLoading(async () => {
      const courses = await new CoursesService().getCourses();
      setCourses(courses);
    }),
    [],
  );

  useAsync(() => loadCourses(), []);

  return (
    <Spin spinning={loading}>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        form={form}
        onFinish={sendMessage}
        requiredMark
        initialValues={{ channel: defaultChannel, course: undefined as unknown as Course }}
      >
        <Form.Item label="Channel" name="channel">
          <Select
            onChange={(channel: NotificationChannel) => setChannel(channel)}
            placeholder="Select Channel"
            options={Object.keys(NotificationChannel).map(channel => ({ value: channel }))}
          />
        </Form.Item>
        <Form.Item label="Course" name="course">
          <Select
            onChange={(courseId: number) => onCourseChange(courseId)}
            placeholder="Select Course"
            options={courses?.map(course => ({ value: course.id, label: course.name }))}
          />
        </Form.Item>
        <Form.Item label="Students" name="students">
          <Select
            onChange={(selected: (number | string)[]) => updateRecipients(students, selected, 'students', setStudents)}
            placeholder="Select Students"
            disabled={!loadingCourseData && students?.length === 0}
            notFoundContent={loadingCourseData ? <Spin size="small" /> : null}
            options={students}
            maxTagCount="responsive"
            mode="multiple"
          />
        </Form.Item>
        <Form.Item label="Mentors" name="mentors">
          <Select
            onChange={(selected: (number | string)[]) => updateRecipients(mentors, selected, 'mentors', setMentors)}
            disabled={!loadingCourseData && mentors?.length === 0}
            placeholder="Select Mentors"
            notFoundContent={loadingCourseData ? <Spin size="small" /> : null}
            options={mentors}
            maxTagCount="responsive"
            mode="multiple"
          />
        </Form.Item>
        {channel === NotificationChannel.email && (
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Please enter subject.' }]}>
            <Input placeholder="subject" />
          </Form.Item>
        )}
        <Form.Item name="body" label="Body" rules={[{ required: true, message: 'Please enter message body.' }]}>
          <Input.TextArea placeholder="message text" rows={20} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );

  function updateRecipients(
    recipients: RecipientOption[],
    selected: (number | string)[],
    formKey: string,
    setter: (recipients: RecipientOption[]) => void,
  ) {
    const [, ...options] = recipients ?? [];
    if (selected.find(value => value === 'select') || selected.length === options.length) {
      setter([{ value: 'deselect', label: 'Deselect All' }, ...options]);
      form.setFieldsValue({
        [formKey]: options.map(option => option.value),
      });
    } else if (selected.find(value => value === 'deselect')) {
      setter([{ value: 'select', label: 'Select All' }, ...options]);
      form.setFieldsValue({
        [formKey]: [],
      });
    }
  }

  async function onCourseChange(courseId: number) {
    const service = new CourseService(courseId);
    setLoadingCourseData(true);

    setStudents([]);
    setMentors([]);
    form.setFieldsValue({
      students: [],
      mentors: [],
    });

    const [students, mentors] = await Promise.all([service.getCourseStudents(), service.getMentorsWithDetails()]);

    setStudents([
      { value: 'select', label: 'Select All' },
      ...students.map(student => ({ value: student.id, label: student.name || student.githubId })),
    ]);
    setMentors([
      { value: 'select', label: 'Select All' },
      ...mentors.map(mentor => ({ value: mentor.id, label: mentor.name || mentor.githubId })),
    ]);

    setLoadingCourseData(false);
  }

  async function sendMessage(values: {
    students: number[];
    mentors: number[];
    subject?: string;
    body: string;
    channel: NotificationChannel;
  }) {
    const { body, mentors = [], students = [], subject, channel } = values;
    const userIds = [...students, ...mentors];
    if (userIds.length === 0) {
      message.error('Please select recipients');
      return;
    }

    try {
      await new NotificationsService().sendMessage(channel, {
        body,
        subject,
        userIds,
      });
      form.setFieldsValue({
        students: [],
        mentors: [],
        subject: '',
        body: '',
        course: undefined,
      });

      message.success('Message has been sent.');
    } catch {
      message.error("Couldn't send the message. Please try later.");
    }
  }
}
