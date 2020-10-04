import React, { useState, useMemo, useEffect } from 'react';
import { useAsync } from 'react-use';
import { Form, Typography, Rate, Input, Radio, Button, message, Divider } from 'antd';
import withCourseData from 'components/withCourseData';
import { withSession, UserSearch, PageLayoutSimple } from 'components';
import { CoursePageProps, StudentBasic } from 'services/models';
import { CourseService } from 'services/course';
import { AxiosError } from 'axios';
import _ from 'lodash';
import { useLoading } from 'components/useLoading';

const SKILLS_LEVELS = [
  `Doesn't know`,
  `Poor knowledge (almost doesn't know)`,
  'Knows something (with tips)',
  'Good knowledge (makes not critical mistakes)',
  'Great knowledge',
];

const CODING_LEVELS = [
  `Isn't able to coding`,
  `Poor coding ability (almost isn't able to)`,
  'Can code with tips',
  'Good coding ability (makes not critical mistakes)',
  'Great coding ability',
];

const ENGLISH_LEVELS = ['A0', 'A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2'];

const defaultInitialValues = {
  githubId: null,
  'skills-htmlCss-level': 0,
  'skills-dataStructures-array': 0,
  'skills-dataStructures-list': 0,
  'skills-dataStructures-stack': 0,
  'skills-dataStructures-queue': 0,
  'skills-dataStructures-tree': 0,
  'skills-dataStructures-hashTable': 0,
  'skills-dataStructures-heap': 0,
  'skills-common-binaryNumber': 0,
  'skills-common-oop': 0,
  'skills-common-bigONotation': 0,
  'skills-common-sortingAndSearchAlgorithms': 0,
  'skills-comment': '',
  'programmingTask-task': '',
  'programmingTask-codeWritingLevel': 0,
  'programmingTask-resolved': null,
  'programmingTask-comment': '',
  'english-levelStudentOpinion': 0,
  'english-levelMentorOpinion': 0,
  'english-whereAndWhenLearned': '',
  'english-comment': '',
  'resume-verdict': null,
  'resume-comment': '',
};

const SKILLS = [
  {
    name: 'htmlCss',
    label: 'HTML/CSS',
    comment: `Position and display attributes' values, tags, weight of selectors, pseudo-classes and elements, box model, relative and absolute values, em vs rem, semantic, semantic tags, etc.`,
    skills: [
      {
        name: 'level',
        label: 'Average level',
      },
    ],
  },
  {
    name: 'dataStructures',
    label: 'Data structures',
    comment: `Representation in computer memory. Operations' complexity. Difference between list and array, or between stack and queue.`,
    skills: [
      {
        name: 'array',
        label: 'Array',
      },
      {
        name: 'list',
        label: 'List',
      },
      {
        name: 'stack',
        label: 'Stack',
      },
      {
        name: 'queue',
        label: 'Queue',
      },
      {
        name: 'tree',
        label: 'Tree',
      },
      {
        name: 'hashTable',
        label: 'Hash table',
      },
      {
        name: 'heap',
        label: 'Heap',
      },
    ],
  },
  {
    name: 'common',
    label: 'Common of CS / Programming',
    comment: null,
    skills: [
      {
        name: 'oop',
        label: 'OOP (Encapsulation, Polymorphism, and Inheritance)',
      },
      {
        name: 'binaryNumber',
        label: 'Binary number',
      },
      {
        name: 'bigONotation',
        label: 'Big O notation',
      },
      {
        name: 'sortingAndSearchAlgorithms',
        label: 'Sorting and search algorithms (Binary search, Bubble sort, Quick sort, etc.)',
      },
    ],
  },
];

const radioStyle = { display: 'block', height: '30px', lineHeight: '30px' };

const renderSkills = () => (
  <>
    <Typography.Title level={3}>Skills</Typography.Title>
    {SKILLS.map((category) => (
      <div key={`skills.${category.name}`}>
        <Typography.Title level={4} key={category.name}>
          {category.label}
        </Typography.Title>
        {category.comment && <Typography.Paragraph>{category.comment}</Typography.Paragraph>}
        {category.skills.map((skill: { name: string; label: string }) => (
          <Form.Item name={`skills-${category.name}-${skill.name}`} label={skill.label} key={skill.name}>
            <Rate tooltips={SKILLS_LEVELS} />
          </Form.Item>
        ))}
      </div>
    ))}
    <Form.Item label="Comment" name="skills-comment" style={{ marginBottom: 40 }}>
      <Input.TextArea placeholder="Comments about student's skills" autoSize={{ minRows: 3, maxRows: 5 }} />
    </Form.Item>
  </>
);

const renderProgrammingTask = () => (
  <>
    <Typography.Title level={3}>Code writing level</Typography.Title>
    <Form.Item label="What tasks did the student have to solve?" name="programmingTask-task">
      <Input.TextArea placeholder="aaabbcc = 3a2b2c" autoSize={{ minRows: 3, maxRows: 5 }} />
    </Form.Item>
    <Form.Item label="Has the student solved the task(s)?" name="programmingTask-resolved">
      <Radio.Group>
        <Radio style={radioStyle} value={1}>
          Yes, he/she has
        </Radio>
        <Radio style={radioStyle} value={2}>
          Yes, he/she has, but with tips
        </Radio>
        <Radio style={radioStyle} value={3}>
          No, he/she hasn't
        </Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="Code writing confidence" name="programmingTask-codeWritingLevel">
      <Rate tooltips={CODING_LEVELS} />
    </Form.Item>
    <Form.Item label="Comment" name="programmingTask-comment" style={{ marginBottom: 40 }}>
      <Input.TextArea placeholder="Comments about student's code writing level" autoSize={{ minRows: 3, maxRows: 5 }} />
    </Form.Item>
  </>
);

const renderEnglishLevel = () => (
  <>
    <Typography.Title level={3}>English level</Typography.Title>
    <Form.Item label="English level by student's opinion" name="english-levelStudentOpinion">
      <Rate tooltips={ENGLISH_LEVELS} count={12} />
    </Form.Item>
    <Form.Item label="Where and when learned English?" name="english-whereAndWhenLearned">
      <Input placeholder="Example: Self-education / International House 2019" />
    </Form.Item>
    <Typography.Paragraph>
      Ask the student to tell about himself, hobby, favorite book or film, etc. (2-3 minutes). Use{' '}
      <a
        target="_blank"
        href="https://www.bellenglish.com/sites/default/files/public/uploads/General/LanguageLevels.png"
      >
        this chart
      </a>{' '}
      in order to define the estimated English level
    </Typography.Paragraph>
    <Form.Item label="English level by mentor's opinion" name="english-levelMentorOpinion">
      <Rate tooltips={ENGLISH_LEVELS} count={12} />
    </Form.Item>
    <Form.Item label="Comment" name="english-comment" style={{ marginBottom: 40 }}>
      <Input.TextArea
        placeholder="Comments / impressions about student's english level"
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
    </Form.Item>
  </>
);

const renderResume = () => (
  <>
    <Typography.Title level={3}>Resume</Typography.Title>
    <Form.Item label="Do you want take the student in your group and be his/her mentor?" name="resume-verdict">
      <Radio.Group>
        <Radio style={radioStyle} value={'yes'}>
          Yes, I do.
        </Radio>
        <Radio style={radioStyle} value={'no'}>
          No, I do not.
        </Radio>
        <Radio style={radioStyle} value={'noButGoodCandidate'}>
          No, I do not, but he/she is a good candidate.
        </Radio>
        <Radio style={radioStyle} value={'didNotDecideYet'}>
          I didn't decide yet. I'll submit the feedback later.
        </Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item
      label="Comment"
      name="resume-comment"
      rules={[{ required: true, message: 'Please choose your verdict' }]}
      style={{ marginBottom: '20px' }}
    >
      <Input.TextArea placeholder="Resume" autoSize={{ minRows: 3, maxRows: 5 }} />
    </Form.Item>
  </>
);

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const [githubId] = useState(window ? new URLSearchParams(window.location.search).get('githubId') : null);

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, withLoading] = useLoading(false);
  const [students, setStudents] = useState([] as StudentBasic[]);
  const [interviews, setInterviews] = useState([] as { id: number; completed: boolean; student: StudentBasic }[]);

  const loadData = async () => {
    const interviews = await courseService.getInterviewerStageInterviews(props.session.githubId);
    setStudents(interviews.filter((i) => !i.completed).map((i) => i.student));
    setInterviews(interviews);
  };

  useAsync(withLoading(loadData), []);

  useEffect(() => {
    form.setFieldsValue({ githubId });
  }, [githubId]);

  useEffect(() => {
    if (interviews?.length && githubId) {
      handleStudentSelect(githubId);
    }
  }, [interviews, githubId]);

  const filterStudents = async (searchText: string) => {
    return students.filter(({ githubId, name }) => `${githubId} ${name}`.match(searchText));
  };

  const handleStudentSelect = async (githubId: string) => {
    const interview = interviews.find((i) => i.student.githubId === githubId);
    if (interview != null) {
      const feedback = await courseService.getStageInterviewFeedback(interview.id);
      form.setFieldsValue(deserializeFromJson(feedback));
    }
  };

  const handleSubmit = withLoading(async (values: any) => {
    if (!values.githubId || !values['resume-verdict'] || loading) {
      return;
    }

    const interview = interviews.find((i) => i.student.githubId === values.githubId);
    if (interview == null) {
      return;
    }

    try {
      const json = serializeToJson(values);
      await courseService.postStageInterviewFeedback(interview?.id, {
        json,
        githubId: values.githubId,
        isCompleted: values['resume-verdict'] !== 'didNotDecideYet',
        isGoodCandidate: values['resume-verdict'] === 'noButGoodCandidate',
        decision: values['resume-verdict'],
      });
      message.success('You interview feedback has been submitted. Thank you.');
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError;
      const errorMessage = error?.response?.data?.data?.message ?? 'An error occurred. Please try later.';
      message.error(errorMessage);
    }
  });

  return (
    <PageLayoutSimple
      loading={loading}
      title="Technical Screening Feedback"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Form
        form={form}
        initialValues={defaultInitialValues}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
      >
        <Typography.Title level={4}>Student</Typography.Title>
        <Form.Item
          name="githubId"
          label="Student"
          rules={[{ required: true, message: 'Please select a student' }]}
          style={{ marginBottom: '40px' }}
        >
          <UserSearch
            onChange={handleStudentSelect}
            keyField="githubId"
            defaultValues={students}
            searchFn={filterStudents}
          />
        </Form.Item>
        {renderSkills()}
        <Divider dashed />
        {renderProgrammingTask()}
        <Divider dashed style={{ height: 2 }} />
        {renderEnglishLevel()}
        <Divider dashed />
        {renderResume()}
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

function serializeToJson(values: any) {
  return _.keys(values)
    .filter((v) => v !== 'githubId')
    .reduce((acc, key) => {
      return _.set(acc, key.split('-').join('.'), values[key]);
    }, {});
}

function deserializeFromJson(json: any) {
  return _.keys(defaultInitialValues)
    .filter((key) => key !== 'githubId')
    .reduce((acc, key) => {
      acc[key] = _.get(json, key.split('-'));
      return acc;
    }, {} as any);
}

export default withCourseData(withSession(Page, 'mentor'));
