import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Form } from 'react-final-form';

type Props = {
  isOpen: boolean;
  onApply: (values: any) => void;
  onClose: () => void;
  initialValues: any;
};

let submitFn = () => {};

export class TaskEditModal extends React.Component<Props> {
  state = {
    values: null,
  };

  handleSubmit = async (values: any) => {
    this.props.onApply(values);
  };

  handleApply = () => submitFn();

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader toggle={this.props.onClose}>Add/Edit Task</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={this.handleSubmit}
            initialValues={this.props.initialValues}
            render={({ handleSubmit }: any) => {
              submitFn = handleSubmit;
              return this.props.children;
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleApply}>
            Apply
          </Button>
          <Button color="secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
