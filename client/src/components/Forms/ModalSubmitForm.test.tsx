import { fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ModalSubmitForm } from './ModalSubmitForm';

const PROPS_MOCK = {
  submit: jest.fn(),
  close: jest.fn(),
  children: [],
  title: 'Form',
  data: { field: 'value' },
};

describe('ModalSubmitForm', () => {
  it('should not render when data was not provided', () => {
    render(<ModalSubmitForm {...PROPS_MOCK} data={null} />);

    const form = screen.queryByText('Form');

    expect(form).not.toBeInTheDocument();
  });

  describe('when form was submitted', () => {
    it('should not render footer', () => {
      render(<ModalSubmitForm {...PROPS_MOCK} submitted={true} />);

      const footerBtn = screen.queryByText('Submit');

      expect(footerBtn).not.toBeInTheDocument();
    });

    it('should render success message', () => {
      render(<ModalSubmitForm {...PROPS_MOCK} submitted={true} />);

      const success = screen.getByText('Successfully submitted');

      expect(success).toBeInTheDocument();
    });

    it('should close on OK button click', () => {
      render(<ModalSubmitForm {...PROPS_MOCK} submitted={true} />);
      const okButton = screen.getByText('Ok');

      fireEvent.click(okButton);

      expect(PROPS_MOCK.close).toHaveBeenCalled();
    });
  });

  describe('when form was not submitted', () => {
    it('should render footer', () => {
      render(<ModalSubmitForm {...PROPS_MOCK} submitted={false} />);

      const footerBtn = screen.getByText('Submit');

      expect(footerBtn).toBeInTheDocument();
    });

    it('should render form fields', () => {
      render(
        <ModalSubmitForm {...PROPS_MOCK} submitted={false}>
          <Form.Item label="Input"></Form.Item>
        </ModalSubmitForm>,
      );

      const input = screen.getByText(/input/i);

      expect(input).toBeInTheDocument();
    });
  });

  describe('when error text was provided', () => {
    it('should render error', () => {
      const ERROR_MESSAGE = 'Error!';
      render(<ModalSubmitForm {...PROPS_MOCK} errorText={ERROR_MESSAGE} />);

      const error = screen.getByText(ERROR_MESSAGE);

      expect(error).toBeInTheDocument();
    });
  });
});
