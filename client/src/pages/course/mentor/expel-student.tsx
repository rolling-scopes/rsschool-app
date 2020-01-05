import { Button, Col, Row, Form, Input, message, Typography } from 'antd';
import { PageLayout, PersonSelect } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import { uniqBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { CourseService } from 'services/course';
import { Course, StudentBasic } from 'services/models';

type Props = { session: Session; course: Course };
const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: Props) {
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as StudentBasic[]);

  const loadDataEffect = () => {
    const getData = async () => {
      const [mentorStudents, interviewStudents] = await Promise.all([
        courseService.getMentorStudents(),
        courseService.getInterviewStudents(),
      ]);
      const students = uniqBy(mentorStudents.concat(interviewStudents), 'id');
      const activeStudents = students.filter(student => student.isActive);
      setStudents(activeStudents);
    };
    getData();
  };

  useEffect(loadDataEffect, [props.course.id]);

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) {
      return;
    }
    try {
      setLoading(true);
      await courseService.expelStudent(values.githubId, values.comment);
      message.success('The student has been expelled');
      const activeStudents = students.filter(s => s.githubId !== values.githubId);
      setStudents(activeStudents);
      form.resetFields();
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const noData = !students.length;

  return (
    <PageLayout
      loading={loading}
      title="Expel Student"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Row gutter={24} style={{ margin: 16 }}>
        <Col {...colSizes}>
          <Typography.Paragraph type="warning">
            This page allows to expel a student from the course
          </Typography.Paragraph>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
              <PersonSelect data={students} disabled={noData} placeholder={noData ? 'No Students' : undefined} />
            </Form.Item>

            <Form.Item
              name="comment"
              label="Reason for expelling"
              rules={[{ required: true, message: 'Please give us a couple words why you are expelling the student' }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>

            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, 'mentor'));
