import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { ModalSubmitForm } from './ModalSubmitForm';

const PROPS_MOCK = {
  submit: vi.fn(),
  close: vi.fn(),
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

  it('submits the validated form values when the OK button is clicked', async () => {
    // Exercises the onOk handler: validateFields() resolves (no required fields),
    // then submit() is called with the gathered values.
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <ModalSubmitForm {...PROPS_MOCK} submit={submit} data={{ name: 'Ann' }}>
        <Form.Item name="name" label="Name">
          <input aria-label="name" />
        </Form.Item>
      </ModalSubmitForm>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ann' })));
  });

  it('does not submit when field validation fails', async () => {
    // A required field left empty makes validateFields() reject; the `.catch(() => null)`
    // returns null and the `if (values == null) return` guard short-circuits submit.
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <ModalSubmitForm {...PROPS_MOCK} submit={submit} data={{}}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Required' }]}>
          <input aria-label="name" />
        </Form.Item>
      </ModalSubmitForm>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it('resets the form and calls close when the Cancel button is clicked', async () => {
    const close = vi.fn();
    const user = userEvent.setup();
    render(<ModalSubmitForm {...PROPS_MOCK} close={close} />);

    await user.click(screen.getByRole('button', { name: /Cancel/ }));

    expect(close).toHaveBeenCalled();
  });

  it('forwards form value changes to onChange', async () => {
    // onValuesChange -> onChange?.(form.getFieldsValue())
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ModalSubmitForm {...PROPS_MOCK} onChange={onChange}>
        <Form.Item name="name" label="Name">
          <input aria-label="name" />
        </Form.Item>
      </ModalSubmitForm>,
    );

    await user.type(screen.getByLabelText('name'), 'x');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('uses getInitialValues to derive the form initial values when provided', () => {
    // Drives the `getInitialValues ? getInitialValues(data) : data` true branch.
    const getInitialValues = vi.fn(() => ({ name: 'Derived' }));
    render(
      <ModalSubmitForm {...PROPS_MOCK} getInitialValues={getInitialValues}>
        <Form.Item name="name" label="Name">
          <input aria-label="name" />
        </Form.Item>
      </ModalSubmitForm>,
    );

    expect(getInitialValues).toHaveBeenCalledWith(PROPS_MOCK.data);
    expect(screen.getByLabelText('name')).toHaveValue('Derived');
  });

  it('seeds the url field from data.selectedSolutionUrl', () => {
    // Drives the effect branch `data?.selectedSolutionUrl !== undefined`.
    render(
      <ModalSubmitForm {...PROPS_MOCK} data={{ selectedSolutionUrl: 'https://pr/1' }}>
        <Form.Item name="url" label="Url">
          <input aria-label="url" />
        </Form.Item>
      </ModalSubmitForm>,
    );

    expect(screen.getByLabelText('url')).toHaveValue('https://pr/1');
  });
});
