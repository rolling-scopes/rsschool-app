import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { UpdateUserDtoLanguagesEnum } from '@client/api';
import { LABELS } from 'modules/Registry/constants';
import { Course } from 'services/models';
import { AdditionalInfo } from './AdditionalInfo';

const courses = [
  {
    id: 1,
    name: 'test',
    startDate: new Date().toUTCString(),
    planned: true,
  },
] as Course[];

const mockValues = {
  preferedCourses: [1],
  languagesMentoring: [UpdateUserDtoLanguagesEnum.En],
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
      <AdditionalInfo courses={courses} onPrevious={previousHandler} />
    </Form>,
  );

describe('AdditionalInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = userEvent.setup();

  test.each`
    label
    ${LABELS.courses}
    ${LABELS.aboutYourself}
  `('should render field with $label label', async ({ label }) => {
    renderAdditionalInfo(mockValues);

    const field = await screen.findByText(label);
    expect(field).toBeInTheDocument();
  });

  test('should render data processing checkbox', async () => {
    renderAdditionalInfo(mockValues);

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('should render Previous button', async () => {
    renderAdditionalInfo(mockValues);

    const button = await screen.findByRole('button', { name: /previous/i });
    expect(button).toBeInTheDocument();
  });

  test('should render Submit button', async () => {
    renderAdditionalInfo(mockValues);

    const button = await screen.findByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
  });

  test('should call only submitHandler', async () => {
    renderAdditionalInfo(mockValues);

    const button = await screen.findByRole('button', { name: /submit/i });

    await user.click(button);

    expect(submitHandler).toHaveBeenCalled();
    expect(submitFailedHandler).not.toHaveBeenCalled();
  });

  test('should call only submitFailedHandler', async () => {
    renderAdditionalInfo({ ...mockValues, dataProcessing: 0 });

    const button = await screen.findByRole('button', { name: /submit/i });

    await user.click(button);

    expect(submitHandler).not.toHaveBeenCalled();
    expect(submitFailedHandler).toHaveBeenCalled();
  });
});
