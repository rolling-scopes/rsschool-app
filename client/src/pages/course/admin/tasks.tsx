import * as React from 'react';
import { FormGroup, Label, Button, Input } from 'reactstrap';
import { Field } from 'react-final-form';
import ReactTable from 'react-table';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { CourseService, CourseTask, Stage, Course } from 'services/course';
import { TaskService, Task } from 'services/task';
import { Header } from 'components/Header';
import withSession, { Session } from 'components/withSession';
import withCourseData from 'components/withCourseData';
import { TaskEditModal } from 'components/TasksForm/TaskEditModal';
import { ValidationError } from 'components/ValidationError';
import { requiredValidator } from 'components/Forms';

import '../../../index.scss';

type Props = {
  session?: Session;
  course: Course;
};

type State = {
  tasks: Task[];
  courseTasks: CourseTask[];
  stages: Stage[];
  modalValues: any;
  modalAction: 'update' | 'create';
};

class CourseTasksPage extends React.Component<Props, State> {
  state: State = {
    tasks: [],
    courseTasks: [],
    stages: [],
    modalValues: undefined,
    modalAction: 'update',
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService();
  }

  async componentDidMount() {
    const taskService = new TaskService();
    const [courseTasks, stages, tasks] = await Promise.all([
      this.courseService.getCourseTasks(this.props.course.id),
      this.courseService.getStages(this.props.course.id),
      taskService.getTasks(),
    ]);
    this.setState({ courseTasks, stages, tasks });
  }

  render() {
    if (!this.props.session) {
      return null;
    }
    return (
      <div>
        <Header username={this.props.session.githubId} />
        {this.renderModal()}
        <Button size="sm" color="success" onClick={this.handleAddTaskClick}>
          Add Task
        </Button>
        <ReactTable
          className="-striped -highlight"
          data={this.state.courseTasks}
          defaultFilterMethod={(filter, row) => String(row[filter.id]) === filter.value}
          defaultSorted={[{ id: 'studentEndDate', desc: true }]}
          filterable={true}
          columns={[
            { Header: 'Course Task Id', accessor: 'courseTaskId', maxWidth: 100 },
            {
              Header: 'Name',
              accessor: 'name',
              Cell: (props: { value?: string; original?: any }) => {
                if (props.original && props.original.descriptionUrl) {
                  return <a href={props.original.descriptionUrl}>{props.value}</a>;
                }
                return props.value;
              },
            },
            { Header: 'Scores Count', accessor: 'taskResultCount', maxWidth: 100 },
            {
              Header: 'End Date',
              accessor: 'studentEndDate',
              maxWidth: 220,
              Cell: (props: { value: string }) => (props.value ? format(props.value, 'YYYY-MM-DD HH:mm Z') : null),
            },
            { Header: 'Max Score', accessor: 'maxScore', maxWidth: 100, sortMethod: this.sortNumber },
            { Header: 'Score Weight', accessor: 'scoreWeight', maxWidth: 100, sortMethod: this.sortNumber },
            {
              Header: 'Actions',
              filterable: false,
              maxWidth: 200,
              Cell: row => (
                <>
                  <Button color="link" onClick={() => this.handleUpdateRowClick(row)}>
                    Edit
                  </Button>
                  <Button color="link" onClick={() => this.handleDeleteRowClick(row)}>
                    Remove
                  </Button>
                </>
              ),
            },
          ]}
        />
      </div>
    );
  }

  renderModal() {
    if (this.state.modalValues == null) {
      return null;
    }
    return (
      <TaskEditModal
        onApply={this.handleSubmit}
        onClose={() => this.setState({ modalValues: null })}
        isOpen={this.state.modalValues != null}
        initialValues={{
          ...this.state.modalValues,
          studentEndDate: this.state.modalValues.studentEndDate
            ? new Date(this.state.modalValues.studentEndDate)
            : new Date(),
        }}
      >
        {this.state.modalAction === 'create' && (
          <Field name="taskId" validate={requiredValidator}>
            {({ input, meta }) => (
              <FormGroup className="col-md-auto">
                <Label>Task</Label>
                <Input {...input} name="name" type="select">
                  <option value="">(Empty)</option>
                  {this.state.tasks
                    .filter(task => !this.state.courseTasks.some(courseTask => courseTask.taskId === task.id))
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                </Input>
                <ValidationError meta={meta} />
              </FormGroup>
            )}
          </Field>
        )}
        <Field name="stageId" validate={requiredValidator}>
          {({ input, meta }) => (
            <FormGroup className="col-md-auto">
              <Label>Stage</Label>
              <Input {...input} name="name" type="select">
                <option value="">(Empty)</option>
                {this.state.stages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </Input>
              <ValidationError meta={meta} />
            </FormGroup>
          )}
        </Field>
        <Field name="studentEndDate">
          {({ input }) => (
            <FormGroup className="col-md-auto">
              <Label>Student End Date</Label>
              <div>
                <DatePicker
                  className="form-control"
                  showTimeSelect={true}
                  selected={input.value}
                  onChange={input.onChange as any}
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="yyyy-MM-dd HH:mm"
                  timeCaption="time"
                />
              </div>
            </FormGroup>
          )}
        </Field>
        <Field name="maxScore">
          {({ input }) => (
            <FormGroup className="col-md-auto">
              <Label>Max Score</Label>
              <Input {...input} name="maxScore" maxLength={5} type="number" />
            </FormGroup>
          )}
        </Field>
        <Field name="scoreWeight">
          {({ input }) => (
            <FormGroup className="col-md-auto">
              <Label>Score Weight</Label>
              <Input {...input} name="scoreWeight" type="number" />
            </FormGroup>
          )}
        </Field>
      </TaskEditModal>
    );
  }

  private sortNumber = (a: number, b: number) => b - a;

  private handleAddTaskClick = () => {
    this.setState({ modalValues: {}, modalAction: 'create' });
  };

  private handleUpdateRowClick = (row: any) => {
    this.setState({ modalValues: row.original });
  };

  private handleDeleteRowClick = async (row: any) => {
    await this.courseService.deleteCourseTask(this.props.course.id, row.original.courseTaskId);
    const courseTasks = await this.courseService.getCourseTasks(this.props.course.id);
    this.setState({ courseTasks });
  };

  private handleSubmit = async (values: any) => {
    const data = {
      maxScore: values.maxScore ? Number(values.maxScore) : undefined,
      stageId: values.stageId,
      scoreWeight: values.scoreWeight,
      studentEndDate: format(values.studentEndDate),
    };

    if (this.state.modalAction === 'create') {
      await this.courseService.createCourseTask(this.props.course.id, { ...data, taskId: values.taskId });
    } else {
      await this.courseService.updateCourseTask(this.props.course.id, values.courseTaskId, data);
    }
    const courseTasks = await this.courseService.getCourseTasks(this.props.course.id);
    this.setState({ modalValues: null, courseTasks });
  };
}

export default withCourseData(withSession(CourseTasksPage));
