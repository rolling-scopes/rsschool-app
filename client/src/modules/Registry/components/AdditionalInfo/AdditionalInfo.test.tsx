/* eslint-disable testing-library/no-unnecessary-act */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES } from 'modules/Registry/constants';
import { Course } from 'services/models';
import { AdditionalInfo } from './AdditionalInfo';

const preferedCourses = [
  {
    id: 1,
    name: 'test',
    startDate: new Date().toUTCString(),
    planned: true,
  },
] as Course[];

const mockValues = {
  preferedCourses,
  languagesMentoring: ['English'],
  dataProcessing: 1,
  aboutMyself: "I'm Groot",
};

type Values = typeof mockValues;

const previousHandler = jest.fn();
const submitHandler = jest.fn();
const submitFailedHandler = jest.fn();

const setup = (values: Values) =>
  render(
    <Form initialValues={values} onFinish={submitHandler} onFinishFailed={submitFailedHandler}>
      <AdditionalInfo courses={preferedCourses} checkedList={[1]} onPrevious={previousHandler} />
    </Form>,
  );

describe('AdditionalInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('should call previousHandler', async () => {
    setup(mockValues);
    const button = await screen.findByText('Previous');

    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    expect(previousHandler).toHaveBeenCalledTimes(1);
  });

  test('should call submitHandler', async () => {
    setup(mockValues);
    const button = await screen.findByText('Submit');

    expect(button).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(button);
    });

    expect(submitHandler).toHaveBeenCalledTimes(1);
    expect(submitFailedHandler).not.toHaveBeenCalled();
  });

  test('should call submitFailedHandler', async () => {
    setup({ ...mockValues, dataProcessing: 0 });
    const button = await screen.findByText('Submit');

    expect(button).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(button);
    });

    expect(submitHandler).not.toHaveBeenCalled();
    expect(submitFailedHandler).toHaveBeenCalledTimes(1);
  });

  test('should render error message on unchecked data processing', async () => {
    setup(mockValues);

    const checkbox = await screen.findByRole('checkbox');
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.shouldAgree);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();

    const errorMessage = await screen.findByText(ERROR_MESSAGES.shouldAgree);
    expect(errorMessage).toBeInTheDocument();
  });
});
