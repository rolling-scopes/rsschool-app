import * as React from 'react';

import { Header } from 'components/Header';
import withSession, { Session } from 'components/withSession';
import { FormGroup, Label, Button, Input } from 'reactstrap';
import { Field } from 'react-final-form';
import ReactTable from 'react-table';
import { TaskService } from 'services/task';
import { requiredValidator } from 'components/Forms';
import { TaskEditModal } from 'components/TasksForm/TaskEditModal';
import { ValidationError } from 'components/ValidationError';

import '../../index.scss';

type Props = {
  session: Session;
};

type State = {
  submitted: boolean;
  tasks: any[];
  modalValues: any | null;
};

class Tasks extends React.Component<Props, State> {
  state: State = {
    submitted: false,
    tasks: [],
    modalValues: null,
  };

  taskService = new TaskService();

  async loadTasks() {
    const tasks = await this.taskService.getTasks();
    this.setState({ tasks });
  }

  async componentDidMount() {
    await this.loadTasks();
  }

  stringFilter = (filter: any, row: any) => (row[filter.id] || '').toLowerCase().startsWith(filter.value.toLowerCase());

  handleSubmit = async (values: any) => {
    await this.taskService.updateTasks([values]);
    this.setState({ submitted: true });
    await this.loadTasks();
    this.setState({ modalValues: null });
  };

  renderModal() {
    return (
      <TaskEditModal
        onApply={this.handleSubmit}
        onClose={() => {
          this.setState({ modalValues: null });
        }}
        isOpen={this.state.modalValues != null}
        initialValues={{
          verification: 'auto',
          ...this.state.modalValues,
        }}
      >
        <Field name="name" validate={requiredValidator}>
          {({ input, meta }) => (
            <FormGroup className="col-md-auto">
              <Label>Task Name</Label>
              <Input {...input} name="name" type="text" />
              <ValidationError meta={meta} />
            </FormGroup>
          )}
        </Field>
        <Field name="description">
          {({ input }) => (
            <FormGroup className="col-md-auto">
              <Label>Description</Label>
              <Input {...input} name="description" type="textarea" />
            </FormGroup>
          )}
        </Field>

        <Field name="descriptionUrl">
          {({ input }) => (
            <FormGroup className="col-md-auto">
              <Label>Description Url</Label>
              <Input {...input} name="descriptionUrl" type="text" />
            </FormGroup>
          )}
        </Field>

        <Field name="verification">
          {({ input, meta }) => (
            <FormGroup className="col-md-auto">
              <Label>Verification</Label>
              <Input {...input} name="descriptionUrl" type="select">
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </Input>
              <ValidationError meta={meta} />
            </FormGroup>
          )}
        </Field>

        <Field name="allowStudentArtefacts" type="checkbox">
          {({ input, meta }) => (
            <FormGroup className="col-md-auto">
              <Label>
                <Input {...input} name="allowStudentArtefacts" type="checkbox" />
                Allow Student Artefacts
              </Label>
              <ValidationError meta={meta} />
            </FormGroup>
          )}
        </Field>
      </TaskEditModal>
    );
  }

  handleRowClick(row: any) {
    this.setState({ modalValues: row.original });
  }

  handleAddTaskClick = () => {
    this.setState({ modalValues: {} });
  };

  render() {
    return (
      <div>
        <Header username={this.props.session.githubId} />
        <div className="m-3">
          {this.renderModal()}
          <Button color="success" onClick={this.handleAddTaskClick}>
            Add
          </Button>
          <ReactTable
            className="-striped -highlight"
            defaultSorted={[{ id: 'name', desc: false }]}
            filterable={true}
            defaultPageSize={50}
            defaultFilterMethod={(filter, row) => String(row[filter.id]) === filter.value}
            data={this.state.tasks}
            columns={[
              {
                Header: 'Task Id',
                accessor: 'id',
                maxWidth: 100,
                sortMethod: (a, b) => b - a,
              },
              {
                Header: 'Name',
                accessor: 'name',
                maxWidth: 360,
                filterMethod: this.stringFilter,
              },
              {
                Header: 'Description',
                accessor: 'description',
                maxWidth: 100,
                filterMethod: this.stringFilter,
              },
              {
                Header: 'Description Url',
                accessor: 'descriptionUrl',
                filterMethod: this.stringFilter,
              },
              {
                Header: 'Verification',
                accessor: 'verification',
                maxWidth: 100,
                filterMethod: this.stringFilter,
              },
              {
                Header: 'Actions',
                filterable: false,
                maxWidth: 100,
                Cell: row => (
                  <>
                    <Button color="link" onClick={() => this.handleRowClick(row)}>
                      Edit
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default withSession(Tasks);
