import { Form, Col, Steps, Radio, Input, Button, Rate, Typography, Switch, message } from 'antd';
import { Header, withSession, PersonSelect, LoadingScreen } from 'components';
import { FormComponentProps } from 'antd/lib/form';
import { isNumber } from 'lodash';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CoursePageProps } from 'services/models';
import { CourseService } from 'services/course';
import { StudentBasic } from '../../../../../common/models';

// Debounce is needed because of with using GetFieldDecorator the component is rerendered
// every time for changing the state.
// TODO?: Maybe it is a good idea don't use GetFieldDecorator and rewrite form without it.
// https://stackoverflow.com/questions/53669448/very-slow-input-elements-in-ant-design-form
import reactComponentDebounce from 'react-component-debounce';

const STAGE_ID = 17;

const DEBOUCE_INPUT_TIMEOUT = 300;

const DebounceInput = reactComponentDebounce({ triggerMs: DEBOUCE_INPUT_TIMEOUT })(Input);
const DebounceTextArea = reactComponentDebounce({ triggerMs: DEBOUCE_INPUT_TIMEOUT })(Input.TextArea);

type Props = CoursePageProps & FormComponentProps;

type State = {
  isLoading: boolean;
  currentStep: number;
  studentId: number | null;
  students: StudentBasic[];
  stepsStatuses: {
    [index: string]: 'wait' | 'process' | 'finish' | 'error' | undefined;
  };
  common: {
    reason: 'haveITEducation' | 'doNotWorkInIT' | 'whatThisCourseAbout' | 'other' | null;
    reasonOther: string | null;
    whenStartCoding: number | null;
    schoolChallengesParticipaton: string | null;
    whereStudied: string | null;
    workExperience: string | null;
    otherAchievements: string | null;
    militaryService: 'served' | 'liable' | 'notLiable' | null;
  };
  skills: {
    [index: string]: any;
    htmlCss: {
      level: number | null;
    };
    dataStructures: {
      array: number | null;
      list: number | null;
      stack: number | null;
      queue: number | null;
      tree: number | null;
      hashTable: number | null;
      heap: number | null;
    };
    common: {
      binaryNumber: number | null;
      oop: number | null;
      bigONotation: number | null;
      sortingAndSearchAlgorithms: number | null;
    };
    comment: string | null;
  };
  programmingTask: {
    task: string | null;
    codeWritingLevel: number | null;
    resolved: number | null;
    comment: string | null;
  };
  english: {
    levelStudentOpinion: number | null;
    levelMentorOpinion: number | null;
    whereAndWhenLearned: string | null;
    comment: string | null;
  };
  resume: {
    verdict: 'yes' | 'no' | 'noButGoodCandidate' | 'didNotDecideYet' | null;
    comment: string | null;
  };
};

enum FormSteps {
  common = 0,
  skills = 1,
  programmingTask = 2,
  english = 3,
  resume = 4,
}

const STEPS = ['common', 'skills', 'programmingTask', 'english', 'resume'];

enum FormStepStatuses {
  WAIT = 'wait',
  PROCESS = 'process',
  FINISH = 'finish',
  ERROR = 'error',
}

const DEFAULT_STEP_STATUS = undefined;

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

const EnglishLevelsMapping = {
  A0: 0.5,
  A1: 1,
  'A1+': 1.5,
  A2: 2,
  'A2+': 2.5,
  B1: 3,
  'B1+': 3.5,
  B2: 4,
  'B2+': 4.5,
  C1: 5,
  'C1+': 5.5,
  C2: 6,
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

const defaultState: State = {
  isLoading: false,
  studentId: null,
  currentStep: FormSteps.common,
  students: [],
  stepsStatuses: {
    [+FormSteps.common]: DEFAULT_STEP_STATUS,
    [+FormSteps.skills]: DEFAULT_STEP_STATUS,
    [+FormSteps.programmingTask]: DEFAULT_STEP_STATUS,
    [+FormSteps.english]: DEFAULT_STEP_STATUS,
    [+FormSteps.resume]: DEFAULT_STEP_STATUS,
  },
  common: {
    reason: null,
    reasonOther: null,
    whenStartCoding: null,
    schoolChallengesParticipaton: null,
    whereStudied: null,
    workExperience: null,
    otherAchievements: null,
    militaryService: null,
  },
  skills: {
    htmlCss: {
      level: null,
    },
    dataStructures: {
      array: null,
      list: null,
      stack: null,
      queue: null,
      tree: null,
      hashTable: null,
      heap: null,
    },
    common: {
      binaryNumber: null,
      oop: null,
      bigONotation: null,
      sortingAndSearchAlgorithms: null,
    },
    comment: null,
  },
  programmingTask: {
    task: null,
    codeWritingLevel: null,
    resolved: null,
    comment: null,
  },
  english: {
    levelStudentOpinion: null,
    levelMentorOpinion: null,
    whereAndWhenLearned: null,
    comment: null,
  },
  resume: {
    verdict: null,
    comment: null,
  },
};

class StageInterviewFeedback extends React.Component<Props, State> {
  state: State = defaultState;

  private courseService = new CourseService();

  async componentDidMount() {
    await this.loadStudents();
  }

  private loadSavedFeedback = studentId => {
    this.props.form.validateFields(async (_, values: any) => {
      const { common, skills, programmingTask, english, resume } = values;
      await this.setState({ isLoading: true, common, skills, programmingTask, english, resume });

      const courseId = this.props.course.id;
      const feedback = await this.courseService.getStageInterviewFeedback(courseId, STAGE_ID, studentId);

      const json = JSON.parse(feedback);

      const englishLevelMentorOpinion = json.english && json.english.levelMentorOpinion;
      const englishLevelStudentOpinion = json.english && json.english.levelStudentOpinion;

      await this.setState({
        isLoading: false,
        studentId,
        ...json,
        english: {
          ...english,
          levelMentorOpinion: englishLevelMentorOpinion
            ? EnglishLevelsMapping[englishLevelMentorOpinion.toUpperCase()]
            : english.levelMentorOpinion,
          levelStudentOpinion: englishLevelStudentOpinion
            ? EnglishLevelsMapping[englishLevelStudentOpinion.toUpperCase()]
            : english.levelStudentOpinion,
        },
      });
      this.props.form.resetFields();
    });
  };

  private async loadStudents() {
    await this.setState({ isLoading: true });

    const courseId = this.props.course.id;
    const students = await this.courseService.getStageInterviewStudents(courseId, STAGE_ID);

    await this.setState({ students, isLoading: false });
  }

  private yearValidator = (_: any, value: number, callback: (isInvalid?: boolean) => {}) => {
    const range = 100;
    const year = Number(value);
    const currentYear = new Date().getFullYear();

    const isInRange = currentYear - year <= range;
    const isLessThanCurrent = year <= currentYear;

    return isNumber(year) && isInRange && isLessThanCurrent ? callback() : callback(true);
  };

  private isLastStep = (currentStep: number) => !Object.values(FormSteps).includes(currentStep + 1);
  private isFirstStep = (currentStep: number) => !Object.values(FormSteps).includes(currentStep - 1);

  private onButtonNextClick = () => {
    let { currentStep } = this.state;
    currentStep = !this.isLastStep(currentStep) ? (currentStep += 1) : currentStep;

    this.onStepChange(currentStep);
    this.setState({ currentStep });
  };

  private onButtonPrevClick = () => {
    let { currentStep } = this.state;
    currentStep = !this.isFirstStep(currentStep) ? (currentStep -= 1) : currentStep;

    this.onStepChange(currentStep);
    this.setState({ currentStep });
  };

  private onStepChange = async (currentStep: number) => {
    const { stepsStatuses } = this.state;

    const newStatuses: any = {};

    Object.keys(stepsStatuses)
      .filter(key => stepsStatuses[key] === FormStepStatuses.PROCESS)
      .forEach(key => (stepsStatuses[key] = FormStepStatuses.FINISH));

    newStatuses[currentStep] = FormStepStatuses.PROCESS;

    await this.setState({ currentStep, stepsStatuses: { ...stepsStatuses, ...newStatuses } });
  };

  private onSkillRateChange = async (categoryName: string, skillName: string, value: number) => {
    const skillValue = Boolean(value) ? value : null;

    await this.setState({
      skills: {
        ...this.state.skills,
        [categoryName]: {
          ...this.state.skills[categoryName],
          [skillName]: skillValue,
        },
      },
    });

    this.props.form.setFieldsValue({ [`skills.${categoryName}.${skillName}`]: skillValue });
  };

  private onSkillNotAskedChange = async (categoryName: string, skillName: string, isNotAsked: boolean) => {
    const skillValue = isNotAsked ? 0 : null;

    await this.setState({
      skills: {
        ...this.state.skills,
        [categoryName]: {
          ...this.state.skills[categoryName],
          [skillName]: skillValue,
        },
      },
    });

    this.props.form.setFieldsValue({ [`skills.${categoryName}.${skillName}`]: skillValue });
  };

  private handleSaveDraft = async () => {
    this.props.form.validateFields(async (_, values: any) => {
      try {
        await this.setState({ isLoading: true });
        const courseId = this.props.course.id;
        const { common, skills, programmingTask, english, resume } = values;
        const data = {
          studentId: values.studentId,
          json: JSON.stringify({
            common,
            skills,
            programmingTask,
            resume,
            english: {
              ...english,
              levelStudentOpinion: english.levelStudentOpinion
                ? ENGLISH_LEVELS[english.levelStudentOpinion * 2 - 1].toLowerCase()
                : null,
              levelMentorOpinion: english.levelMentorOpinion
                ? ENGLISH_LEVELS[english.levelMentorOpinion * 2 - 1].toLowerCase()
                : null,
            },
          }),
          isCompleted: false,
          decision: null,
          isGoodCandidate: null,
        };

        await this.courseService.postStageInterviewFeedback(courseId, STAGE_ID, data);

        await this.setState({ isLoading: false, ...values });
        message.success('Draft has been saved.');
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        const failedStepNames = Object.keys(err).filter((key: string) => STEPS.includes(key));
        const newStatuses: any = {};

        STEPS.forEach((stepName: string) => {
          const statusIndex = FormSteps[stepName as keyof typeof FormSteps];
          if (failedStepNames.includes(stepName)) {
            newStatuses[statusIndex] = FormStepStatuses.ERROR;
          } else {
            newStatuses[statusIndex] = FormStepStatuses.FINISH;
          }
        });

        failedStepNames.forEach((stepName: string) => {
          const statusIndex = FormSteps[stepName as keyof typeof FormSteps];
          newStatuses[statusIndex] = FormStepStatuses.ERROR;
        });

        this.setState({ stepsStatuses: { ...this.state.stepsStatuses, ...newStatuses } });
        return;
      }
      try {
        await this.setState({ isLoading: true });
        const courseId = this.props.course.id;
        const { common, skills, programmingTask, english, resume }: State = values;

        const data = {
          studentId: values.studentId,
          json: JSON.stringify({
            common,
            skills,
            programmingTask,
            resume,
            english: {
              ...english,
              levelStudentOpinion: english.levelStudentOpinion
                ? ENGLISH_LEVELS[english.levelStudentOpinion * 2 - 1].toLowerCase()
                : null,
              levelMentorOpinion: english.levelMentorOpinion
                ? ENGLISH_LEVELS[english.levelMentorOpinion * 2 - 1].toLowerCase()
                : null,
            },
          }),
          isCompleted: resume.verdict === 'didNotDecideYet' ? false : true,
          decision:
            resume.verdict === 'no' || resume.verdict === 'yes'
              ? resume.verdict
              : resume.verdict !== 'didNotDecideYet'
              ? 'no'
              : null,
          isGoodCandidate:
            resume.verdict === 'yes' || resume.verdict === 'noButGoodCandidate'
              ? true
              : resume.verdict === 'no'
              ? false
              : null,
        };

        await this.courseService.postStageInterviewFeedback(courseId, STAGE_ID, data);

        await this.setState({ ...defaultState });
        await this.loadStudents();
        this.props.form.resetFields();
        message.success('Feedback has been submitted.');
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };

  public renderSkills = (field: any) => {
    return SKILLS.map(category => (
      <div key={`skills.${category.name}`}>
        <Typography.Title level={4} key={category.name}>
          {category.label}
        </Typography.Title>
        {category.comment && <Typography.Paragraph>{category.comment}</Typography.Paragraph>}
        {category.skills.map((skill: { name: string; label: string }) => (
          <Form.Item label={skill.label} key={skill.name}>
            {field(`skills.${category.name}.${skill.name}`, {
              initialValue: this.state.skills[category.name][skill.name],
              rules: [
                {
                  required: true,
                  message: `Please specify estimated level of ${skill.label} knowledge!`,
                },
              ],
            })(
              <Rate
                tooltips={SKILLS_LEVELS}
                onChange={this.onSkillRateChange.bind(this, category.name, skill.name)}
                style={{ marginBottom: '5px' }}
              />,
            )}
            {Boolean(this.state.skills[category.name][skill.name]) && (
              <Typography.Text className="ant-rate-text">
                {SKILLS_LEVELS[this.state.skills[category.name][skill.name] - 1]}
              </Typography.Text>
            )}
            <Typography.Paragraph>
              <Switch
                checked={this.state.skills[category.name][skill.name] === 0}
                onChange={this.onSkillNotAskedChange.bind(this, category.name, skill.name)}
                size="small"
              />{' '}
              I didn't ask about it
            </Typography.Paragraph>
          </Form.Item>
        ))}
      </div>
    ));
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    const { currentStep } = this.state;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <>
        <Header
          title="Stage Interview Feedback"
          courseName={this.props.course.name}
          username={this.props.session.githubId}
        />
        <LoadingScreen show={this.state.isLoading}>
          <Col className="m-2" sm={12}>
            <Form onSubmit={this.handleSubmit} layout="vertical">
              <Form.Item label="Student">
                {field('studentId', {
                  initialValue: this.state.studentId,
                  rules: [{ required: true, message: 'Please select a student' }],
                })(<PersonSelect data={this.state.students} onChange={this.loadSavedFeedback} />)}
              </Form.Item>
              <Form.Item>
                <Steps labelPlacement="vertical" current={currentStep} onChange={this.onStepChange}>
                  <Steps.Step title="Common info" status={this.state.stepsStatuses[FormSteps.common]} />
                  <Steps.Step title="Skills" status={this.state.stepsStatuses[FormSteps.skills]} />
                  <Steps.Step title="Programming task" status={this.state.stepsStatuses[FormSteps.programmingTask]} />
                  <Steps.Step title="English" status={this.state.stepsStatuses[FormSteps.english]} />
                  <Steps.Step title="Resume" status={this.state.stepsStatuses[FormSteps.resume]} />
                </Steps>
              </Form.Item>
              <div style={currentStep !== FormSteps.common ? { display: 'none' } : {}}>
                <Form.Item label="Why are you interested in this course?">
                  {field('common.reason', {
                    initialValue: this.state.common.reason,
                    rules: [{ required: true, message: 'Please select a reason' }],
                  })(
                    <Radio.Group
                      onChange={e => {
                        this.setState({
                          common: {
                            ...this.state.common,
                            reason: e.target.value,
                          },
                        });
                      }}
                    >
                      <Radio style={radioStyle} value={'haveITEducation'}>
                        I have IT education and I'd like to learn JS
                      </Radio>
                      <Radio style={radioStyle} value={'doNotWorkInIT'}>
                        I don't work in IT / don't have IT education, but I would like to retrain and take a job in IT
                      </Radio>
                      <Radio style={radioStyle} value={'whatThisCourseAbout'}>
                        I would like to find out what this course is about
                      </Radio>
                      <Radio style={radioStyle} value={'other'}>
                        Other...
                        {this.state.common.reason === 'other'
                          ? field('common.reasonOther', {
                              initialValue: this.state.common.reasonOther,
                              rules: [{ required: false }],
                            })(<DebounceInput style={{ width: 300, marginLeft: 10 }} />)
                          : null}
                      </Radio>
                    </Radio.Group>,
                  )}
                </Form.Item>
                <Form.Item label="When did you start coding?">
                  {field('common.whenStartCoding', {
                    initialValue: this.state.common.whenStartCoding,
                    rules: [
                      {
                        validator: this.yearValidator,
                        message: 'The input is not valid year!',
                      },
                      { required: true, message: 'Please input a year' },
                    ],
                  })(<DebounceInput placeholder="2019" />)}
                </Form.Item>
                <Form.Item label="What did you graduate from? (university/specialty)">
                  {field('common.whereStudied', {
                    initialValue: this.state.common.whereStudied,
                    rules: [{ required: true, message: 'Please type university name and a specialty' }],
                  })(<DebounceInput placeholder="BSU/Economist (2014 - 2019)" />)}
                </Form.Item>
                <Form.Item label="Do you have any work experience? (not only in IT)">
                  {field('common.workExperience', {
                    initialValue: this.state.common.workExperience,
                    rules: [{ required: true, message: 'Please type work experience' }],
                  })(<DebounceInput placeholder="Accountant (2 years)" />)}
                </Form.Item>
                <Form.Item label="Have you ever won school competitions?">
                  {field('common.schoolChallengesParticipaton', {
                    initialValue: this.state.common.schoolChallengesParticipaton,
                    rules: [{ required: false }],
                  })(<DebounceInput placeholder="Math, English" />)}
                </Form.Item>
                <Form.Item label="Other achievements">
                  {field('common.otherAchievements', {
                    initialValue: this.state.common.otherAchievements,
                    rules: [{ required: false }],
                  })(<DebounceTextArea autosize={{ minRows: 3, maxRows: 5 }} />)}
                </Form.Item>
                <Form.Item label="Military Service">
                  {field('common.militaryService', {
                    initialValue: this.state.common.militaryService,
                    rules: [{ required: true, message: 'Please select a military status' }],
                  })(
                    <Radio.Group>
                      <Radio style={radioStyle} value={'served'}>
                        I served in the military
                      </Radio>
                      <Radio style={radioStyle} value={'noLiable'}>
                        I am unsuitable / not liable for military service
                      </Radio>
                      <Radio style={radioStyle} value={'liable'}>
                        I am liable for military service
                      </Radio>
                    </Radio.Group>,
                  )}
                </Form.Item>
              </div>
              <div style={currentStep !== FormSteps.skills ? { display: 'none' } : {}}>{this.renderSkills(field)}</div>
              <div style={currentStep !== FormSteps.programmingTask ? { display: 'none' } : {}}>
                <Form.Item label="What tasks did the student have to solve?">
                  {field('programmingTask.task', {
                    initialValue: this.state.programmingTask.task,
                    rules: [
                      {
                        required: true,
                        message: 'Please type the task!',
                      },
                    ],
                  })(<DebounceTextArea placeholder="aaabbcc = 3a2b2c" autosize={{ minRows: 3, maxRows: 5 }} />)}
                </Form.Item>
                <Form.Item label="Has the student solved the tasks?">
                  {field('programmingTask.resolved', {
                    initialValue: this.state.programmingTask.resolved,
                    rules: [{ required: true, message: 'Please select a verdict!' }],
                  })(
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
                    </Radio.Group>,
                  )}
                </Form.Item>
                <Form.Item label="Code writing confidence">
                  {field('programmingTask.codeWritingLevel', {
                    initialValue: this.state.programmingTask.codeWritingLevel,
                    rules: [
                      {
                        required: true,
                        message: 'Please specify estimated level of coding!',
                      },
                    ],
                  })(
                    <Rate
                      tooltips={CODING_LEVELS}
                      onChange={value => {
                        this.setState({
                          programmingTask: {
                            ...this.state.programmingTask,
                            codeWritingLevel: value,
                          },
                        });
                      }}
                    />,
                  )}
                  {this.state.programmingTask.codeWritingLevel ? (
                    <span className="ant-rate-text">
                      {CODING_LEVELS[this.state.programmingTask.codeWritingLevel - 1]}
                    </span>
                  ) : (
                    ''
                  )}
                </Form.Item>
                <Form.Item label="Comment">
                  {field('programmingTask.comment', {
                    initialValue: this.state.programmingTask.comment,
                  })(<DebounceTextArea autosize={{ minRows: 3, maxRows: 5 }} />)}
                </Form.Item>
              </div>
              <div style={currentStep !== FormSteps.english ? { display: 'none' } : {}}>
                <Form.Item label="English level by student's opinion">
                  {field('english.levelStudentOpinion', {
                    initialValue: this.state.english.levelStudentOpinion,
                    rules: [{ required: true, message: 'Please specify estimated level of English level!' }],
                  })(
                    <Rate
                      tooltips={ENGLISH_LEVELS.filter((_, idx) => idx % 2 !== 0)}
                      count={6}
                      allowHalf={true}
                      onChange={value => {
                        this.setState({
                          english: {
                            ...this.state.english,
                            levelStudentOpinion: value,
                          },
                        });
                      }}
                    />,
                  )}
                  {Boolean(this.state.english.levelStudentOpinion) && (
                    <Typography.Text className="ant-rate-text">
                      {ENGLISH_LEVELS[Number(this.state.english.levelStudentOpinion) * 2 - 1]}
                    </Typography.Text>
                  )}
                </Form.Item>
                <Form.Item label="Where and when learned English?">
                  {field('english.whereAndWhenLearned', {
                    initialValue: this.state.english.whereAndWhenLearned,
                    rules: [{ required: false }],
                  })(<DebounceInput placeholder="Self-education / International House 2019" />)}
                </Form.Item>
                <Form.Item label="English level by mentor's opinion">
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
                  {field('english.levelMentorOpinion', {
                    initialValue: this.state.english.levelMentorOpinion,
                  })(
                    <Rate
                      tooltips={ENGLISH_LEVELS.filter((_, idx) => idx % 2 !== 0)}
                      count={6}
                      allowHalf={true}
                      onChange={value => {
                        this.setState({
                          english: {
                            ...this.state.english,
                            levelMentorOpinion: value,
                          },
                        });
                      }}
                    />,
                  )}
                  {Boolean(this.state.english.levelMentorOpinion) && (
                    <Typography.Text className="ant-rate-text">
                      {ENGLISH_LEVELS[Number(this.state.english.levelMentorOpinion) * 2 - 1]}
                    </Typography.Text>
                  )}
                </Form.Item>
                <Form.Item label="Comment">
                  {field('english.comment', {
                    initialValue: this.state.english.comment,
                  })(<DebounceTextArea autosize={{ minRows: 3, maxRows: 5 }} />)}
                </Form.Item>
              </div>
              <div style={currentStep !== FormSteps.resume ? { display: 'none' } : {}}>
                <Form.Item label="Do you take the student in your group?">
                  {field('resume.verdict', {
                    initialValue: this.state.resume.verdict,
                    rules: [{ required: true, message: 'Please select a verdict!' }],
                  })(
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
                    </Radio.Group>,
                  )}
                </Form.Item>
                <Form.Item label="Comment">
                  {field('resume.comment', {
                    initialValue: this.state.resume.comment,
                  })(<DebounceTextArea autosize={{ minRows: 3, maxRows: 5 }} />)}
                </Form.Item>
              </div>
              {!this.isFirstStep(currentStep) && (
                <Button onClick={this.onButtonPrevClick} style={{ marginRight: 10 }}>
                  Prev
                </Button>
              )}
              {!this.isLastStep(currentStep) && <Button onClick={this.onButtonNextClick}>Next</Button>}
              {this.isLastStep(currentStep) && (
                <>
                  <Button type="dashed" style={{ marginRight: 10 }} onClick={this.handleSaveDraft}>
                    Save draft
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </>
              )}
            </Form>
          </Col>
        </LoadingScreen>
      </>
    );
  }
}

export default withCourseData(withSession(Form.create()(StageInterviewFeedback), 'mentor'));
