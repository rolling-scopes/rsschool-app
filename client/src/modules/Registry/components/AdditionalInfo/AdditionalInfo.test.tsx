/* eslint-disable testing-library/no-unnecessary-act */
import { act, fireEvent, render, screen } from '@testing-library/react';
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

const renderAdditionalInfo = (values: Values) =>
  render(
    <Form initialValues={values} onFinish={submitHandler} onFinishFailed={submitFailedHandler}>
      <AdditionalInfo courses={preferedCourses} checkedList={[1]} onPrevious={previousHandler} />
    </Form>,
  );

describe('AdditionalInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call previousHandler', async () => {
    renderAdditionalInfo(mockValues);

    const button = await screen.findByText('Previous');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(previousHandler).toHaveBeenCalled();
  });

  test('should call submitHandler', async () => {
    renderAdditionalInfo(mockValues);

    const button = await screen.findByText('Submit');
    expect(button).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(submitHandler).toHaveBeenCalled();
    expect(submitFailedHandler).not.toHaveBeenCalled();
  });

  test('should call submitFailedHandler', async () => {
    renderAdditionalInfo({ ...mockValues, dataProcessing: 0 });

    const button = await screen.findByText('Submit');
    expect(button).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(submitHandler).not.toHaveBeenCalled();
    expect(submitFailedHandler).toHaveBeenCalled();
  });

  test('should render checkbox', async () => {
    renderAdditionalInfo(mockValues);

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('should not render error message when checkbox is selected', async () => {
    renderAdditionalInfo(mockValues);

    const checkbox = await screen.findByRole('checkbox');
    const errorMessage = screen.queryByText(ERROR_MESSAGES.shouldAgree);
    expect(checkbox).toBeChecked();
    expect(errorMessage).not.toBeInTheDocument();
  });

  test('should render error message when checkbox is not selected', async () => {
    renderAdditionalInfo(mockValues);

    const checkbox = await screen.findByRole('checkbox');

    fireEvent.click(checkbox);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.shouldAgree);
    expect(checkbox).not.toBeChecked();
    expect(errorMessage).toBeInTheDocument();
  });
});
